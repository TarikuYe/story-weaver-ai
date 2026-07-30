import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  art_style: z.string().max(80).default("manga"),
  panel_count: z.number().int().min(4).max(12).default(6),
  characters: z.string().max(500).optional().default(""),
});

const PanelSchema = z.object({
  panel_number: z.number(),
  camera_angle: z.string(),
  setting: z.string(),
  characters_in_panel: z.string(),
  action: z.string(),
  dialogue: z.array(z.object({ speaker: z.string(), text: z.string() })),
  narration: z.string().optional(),
  mood: z.string(),
  image_prompt: z.string(),
});

const ComicSchema = z.object({
  title: z.string(),
  synopsis: z.string(),
  panels: z.array(PanelSchema),
});

export const Route = createFileRoute("/api/generate-comic")({
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

        const { data: comicRow, error: comicErr } = await supabase
          .from("comic_projects")
          .insert({
            user_id: userId,
            title: "Generating…",
            prompt: body.prompt,
            art_style: body.art_style,
            panel_count: body.panel_count,
            status: "generating",
          })
          .select("id")
          .single();

        if (comicErr || !comicRow) {
          return new Response(JSON.stringify({ error: comicErr?.message ?? "DB error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const comicId = comicRow.id as string;

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

          const comicPrompt = `You are a professional comic book writer and storyboard artist. Create a complete comic script.

Story concept: ${body.prompt}
Art style: ${body.art_style}
Characters: ${body.characters || "invent fitting characters"}
Number of panels: ${body.panel_count}

Return a JSON object with:
- title: comic title
- synopsis: 2-sentence story synopsis
- panels: array of exactly ${body.panel_count} panel objects, each with:
  - panel_number: integer starting at 1
  - camera_angle: one of "wide shot", "medium shot", "close-up", "extreme close-up", "overhead", "low angle", "dutch angle", "over-the-shoulder"
  - setting: brief description of where this panel takes place
  - characters_in_panel: names/descriptions of characters visible
  - action: what is happening visually in this panel (1–2 sentences)
  - dialogue: array of objects with "speaker" and "text" (0–3 lines max per panel)
  - narration: optional caption box text (narrator voice, if needed)
  - mood: single word describing the visual mood (e.g., "tense", "joyful", "mysterious")
  - image_prompt: detailed ${body.art_style} style image generation prompt for this panel (40–60 words)

Ensure the panels tell a complete story arc with a beginning, middle, and end.`;

          let comic: z.infer<typeof ComicSchema>;
          try {
            const { output } = await generateText({
              model,
              output: Output.object({ schema: ComicSchema }),
              prompt: comicPrompt,
            });
            comic = output;
          } catch (err) {
            if (NoObjectGeneratedError.isInstance(err)) {
              throw new Error("Failed to generate comic. Please try again.");
            }
            throw err;
          }

          await supabase
            .from("comic_projects")
            .update({
              title: comic.title,
              panels: comic.panels as unknown as object[],
              status: "complete",
            })
            .eq("id", comicId);

          return Response.json({ comicId, comic });
        } catch (err) {
          console.error("Comic generation failed:", err);
          await supabase.from("comic_projects").update({ status: "failed" }).eq("id", comicId);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Generation failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
