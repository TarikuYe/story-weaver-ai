import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  type: z.string().max(80).optional().default("Fantasy"),
  era: z.string().max(80).optional().default(""),
  tone: z.string().max(80).optional().default(""),
});

const WorldSchema = z.object({
  name: z.string(),
  overview: z.string(),
  geography: z.string(),
  history: z.string(),
  politics: z.string(),
  religion: z.string(),
  magic_system: z.string(),
  technology: z.string(),
  economy: z.string(),
  climate: z.string(),
  population: z.string(),
  notable_locations: z.array(z.object({ name: z.string(), description: z.string() })),
  factions: z.array(z.object({ name: z.string(), description: z.string(), alignment: z.string() })),
});

export const Route = createFileRoute("/api/generate-world")({
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

        const { data: worldRow, error: worldErr } = await supabase
          .from("worlds")
          .insert({
            user_id: userId,
            name: "Generating…",
            prompt: body.prompt,
            type: body.type || null,
            status: "generating",
          })
          .select("id")
          .single();

        if (worldErr || !worldRow) {
          return new Response(JSON.stringify({ error: worldErr?.message ?? "DB error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const worldId = worldRow.id as string;

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

          const worldPrompt = `You are a master world-builder for fiction. Design a complete, internally consistent world based on:

Concept: ${body.prompt}
Genre/Type: ${body.type || "Fantasy"}
Era/Technology level: ${body.era || "author's choice"}
Tone: ${body.tone || "author's choice"}

Return a JSON object with these exact fields:
- name: the world's name (evocative, fitting the genre)
- overview: 3–4 sentence executive summary of what makes this world unique
- geography: 3–4 sentences on continents, major terrain, seas, and how geography shapes culture
- history: 4–5 sentences on key historical events — founding myths, wars, golden ages, cataclysms
- politics: 3–4 sentences on power structures, ruling bodies, current tensions
- religion: 3–4 sentences on major faiths, pantheons or philosophies, and how religion affects daily life
- magic_system: 3–4 sentences on the rules, costs, and limitations of magic (or "No magic system" if not applicable)
- technology: 2–3 sentences on the tech level and notable inventions
- economy: 2–3 sentences on trade, currency, major industries
- climate: 2–3 sentences on weather patterns and how they vary across regions
- population: 2–3 sentences on major races, species, or ethnic groups and rough numbers
- notable_locations: array of 5 objects, each with name and description (2 sentences)
- factions: array of 4 objects, each with name, description (2 sentences), and alignment (one of: lawful, neutral, chaotic, dark, light)`;

          let world: z.infer<typeof WorldSchema>;
          try {
            const { output } = await generateText({
              model,
              output: Output.object({ schema: WorldSchema }),
              prompt: worldPrompt,
            });
            world = output;
          } catch (err) {
            if (NoObjectGeneratedError.isInstance(err)) {
              throw new Error("Failed to generate world. Please try again.");
            }
            throw err;
          }

          await supabase
            .from("worlds")
            .update({
              name: world.name,
              overview: world.overview,
              geography: world.geography,
              history: world.history,
              politics: world.politics,
              religion: world.religion,
              magic_system: world.magic_system,
              technology: world.technology,
              economy: world.economy,
              climate: world.climate,
              population: world.population,
              notable_locations: world.notable_locations as unknown as object[],
              factions: world.factions as unknown as object[],
              status: "complete",
            })
            .eq("id", worldId);

          return Response.json({ worldId, world });
        } catch (err) {
          console.error("World generation failed:", err);
          await supabase.from("worlds").update({ status: "failed" }).eq("id", worldId);
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Generation failed",
              worldId,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
