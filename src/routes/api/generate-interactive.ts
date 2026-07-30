import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  genre: z.string().max(80).default("Adventure"),
  choices_per_node: z.number().int().min(2).max(4).default(3),
  depth: z.enum(["short", "medium", "deep"]).default("medium"),
});

const ChoiceSchema = z.object({
  text: z.string(),
  leads_to: z.string(),
});

const NodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  choices: z.array(ChoiceSchema),
  is_ending: z.boolean(),
  ending_type: z.string().optional(),
});

const InteractiveSchema = z.object({
  title: z.string(),
  premise: z.string(),
  opening: z.string(),
  nodes: z.array(NodeSchema),
});

export const Route = createFileRoute("/api/generate-interactive")({
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

        const nodeCount = { short: 6, medium: 10, deep: 15 }[body.depth];

        const { data: interactiveRow, error: interactiveErr } = await supabase
          .from("interactive_stories")
          .insert({
            user_id: userId,
            title: "Generating…",
            prompt: body.prompt,
            genre: body.genre,
            status: "generating",
          })
          .select("id")
          .single();

        if (interactiveErr || !interactiveRow) {
          return new Response(JSON.stringify({ error: interactiveErr?.message ?? "DB error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" } },
          );
        }
        const interactiveId = interactiveRow.id as string;

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

          const interactivePrompt = `You are a master interactive fiction writer. Create a branching narrative with meaningful choices.

Concept: ${body.prompt}
Genre: ${body.genre}
Choices per decision point: ${body.choices_per_node}
Total story nodes: approximately ${nodeCount}

Return a JSON object with:
- title: story title
- premise: 2-sentence premise
- opening: 3-4 paragraph opening scene that ends with the first choice
- nodes: array of ${nodeCount} node objects (including endings), each with:
  - id: unique slug (e.g., "node_1", "encounter_guard", "betrayal_ending")
  - title: brief title for this node
  - content: 2–4 paragraphs of story text for this scene
  - choices: array of ${body.choices_per_node} choice objects (or empty array if ending), each with "text" (the choice the player sees) and "leads_to" (the id of the node it connects to)
  - is_ending: boolean (true if this node ends the story)
  - ending_type: if is_ending=true, one of "victory", "defeat", "bittersweet", "twist", "open"

Design the story graph to:
- Branch logically (choices must feel consequential)
- Include at least 3 distinct endings
- Ensure no dead-end nodes (every non-ending must have valid choice paths)
- Make sure all "leads_to" references point to valid node ids in your array`;

          let interactive: z.infer<typeof InteractiveSchema>;
          try {
            const { output } = await generateText({
              model,
              output: Output.object({ schema: InteractiveSchema }),
              prompt: interactivePrompt,
            });
            interactive = output;
          } catch (err) {
            if (NoObjectGeneratedError.isInstance(err)) {
              throw new Error("Failed to generate interactive story. Please try again.");
            }
            throw err;
          }

          await supabase
            .from("interactive_stories")
            .update({
              title: interactive.title,
              opening: interactive.opening,
              nodes: interactive.nodes as unknown as object[],
              status: "complete",
            })
            .eq("id", interactiveId);

          return Response.json({ interactiveId, interactive });
        } catch (err) {
          console.error("Interactive story generation failed:", err);
          await supabase.from("interactive_stories").update({ status: "failed" }).eq("id", interactiveId);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Generation failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
