import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  characters: z.string().min(2).max(500),
  emotion: z.string().max(80).default("neutral"),
  setting: z.string().max(300).optional().default(""),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

export const Route = createFileRoute("/api/generate-dialogue")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseAnon) {
          return new Response("Server misconfigured", { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnon, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        let body: z.infer<typeof InputSchema>;
        try {
          body = InputSchema.parse(await request.json());
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Invalid input" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const lengthGuide = { short: "6–10 exchanges", medium: "12–18 exchanges", long: "20–30 exchanges" }[body.length];

        const { data: dialogueRow, error: dialogueErr } = await supabase
          .from("dialogues")
          .insert({
            user_id: userId,
            title: "Generating…",
            prompt: body.prompt,
            characters_involved: body.characters,
            emotion: body.emotion,
            setting: body.setting || null,
            status: "generating",
          })
          .select("id")
          .single();

        if (dialogueErr || !dialogueRow) {
          return new Response(JSON.stringify({ error: dialogueErr?.message ?? "DB error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const dialogueId = dialogueRow.id as string;

        let model: ReturnType<ReturnType<typeof createAiProvider>>;
        try {
          const provider = createAiProvider();
          model = provider();
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "AI provider not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        try {

          const dialoguePrompt = `You are a master dialogue writer for fiction. Write a compelling conversation scene.

Scenario: ${body.prompt}
Characters involved: ${body.characters}
Emotional tone: ${body.emotion}
Setting: ${body.setting || "unspecified — choose what fits the scenario"}
Length: ${lengthGuide}

Guidelines:
- Each line of dialogue must feel natural and character-specific
- Weave in action beats and body language between dialogue lines (in italics using *asterisks*)
- Let the emotion escalate organically through the scene
- End with a strong closing beat — a revelation, a decision, or a lingering tension
- Format: CHARACTERNAME: "dialogue line" with action beats on their own lines

Write only the scene content, no intro or commentary.`;

          const { text } = await generateText({
            model,
            prompt: dialoguePrompt,
          });

          // Generate a title from the first line
          const titlePrompt = `Based on this dialogue scene, generate a short evocative title (4–7 words, no quotes):

${text.slice(0, 200)}

Title:`;
          const { text: titleText } = await generateText({ model, prompt: titlePrompt });
          const title = titleText.trim().replace(/^["']|["']$/g, "").slice(0, 80);

          await supabase
            .from("dialogues")
            .update({
              title,
              content: text.trim(),
              status: "complete",
            })
            .eq("id", dialogueId);

          return Response.json({ dialogueId, title, content: text.trim() });
        } catch (err) {
          console.error("Dialogue generation failed:", err);
          await supabase.from("dialogues").update({ status: "failed" }).eq("id", dialogueId);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Generation failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
