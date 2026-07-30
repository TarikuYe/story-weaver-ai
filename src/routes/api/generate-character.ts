import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  genre: z.string().max(80).optional().default(""),
  archetype: z.string().max(80).optional().default(""),
  role: z.string().max(80).optional().default("protagonist"),
});

const CharacterSchema = z.object({
  name: z.string(),
  age: z.string(),
  occupation: z.string(),
  appearance: z.string(),
  backstory: z.string(),
  strengths: z.string(),
  weaknesses: z.string(),
  skills: z.string(),
  goals: z.string(),
  relationships: z.string(),
  personality: z.string(),
  clothing: z.string(),
  voice_style: z.string(),
  portrait_prompt: z.string(),
});

export const Route = createFileRoute("/api/generate-character")({
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

        // Insert placeholder row immediately so the UI can navigate
        const { data: charRow, error: charErr } = await supabase
          .from("characters")
          .insert({
            user_id: userId,
            name: "Generating…",
            prompt: body.prompt,
            genre: body.genre || null,
            status: "generating",
          })
          .select("id")
          .single();

        if (charErr || !charRow) {
          return new Response(JSON.stringify({ error: charErr?.message ?? "DB error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const characterId = charRow.id as string;

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

          const characterPrompt = `You are a creative writing assistant specializing in deep, memorable characters.

Create a rich character based on:
Description: ${body.prompt}
Genre: ${body.genre || "unspecified"}
Archetype: ${body.archetype || "unspecified"}
Role: ${body.role || "protagonist"}

Return a JSON object with these exact fields:
- name: full character name (evocative for the genre)
- age: age or age range as a string
- occupation: their role or profession in the story
- appearance: 2–3 sentences on physical description — height, build, face, hair, distinguishing features
- backstory: 3–4 sentences on formative history — where they came from, key events that shaped them
- strengths: comma-separated list of 4–6 strengths
- weaknesses: comma-separated list of 3–5 genuine flaws or limitations
- skills: comma-separated list of specific abilities or expertise areas
- goals: 2 sentences — immediate goal + deeper motivation
- relationships: 2–3 sentences describing key relationships (allies, enemies, family)
- personality: 3–4 sentences on how they think, speak, and behave
- clothing: 2 sentences on typical attire and style
- voice_style: 1–2 sentences on how they talk — cadence, vocabulary, tone
- portrait_prompt: a detailed image generation prompt (60–80 words) describing exactly how an artist should depict them — pose, lighting, background, style`;

          let character: z.infer<typeof CharacterSchema>;
          try {
            const { output } = await generateText({
              model,
              output: Output.object({ schema: CharacterSchema }),
              prompt: characterPrompt,
            });
            character = output;
          } catch (err) {
            if (NoObjectGeneratedError.isInstance(err)) {
              throw new Error("Failed to generate character. Please try again.");
            }
            throw err;
          }

          await supabase
            .from("characters")
            .update({
              name: character.name,
              age: character.age,
              occupation: character.occupation,
              appearance: character.appearance,
              backstory: character.backstory,
              strengths: character.strengths,
              weaknesses: character.weaknesses,
              skills: character.skills,
              goals: character.goals,
              relationships: character.relationships,
              personality: character.personality,
              clothing: character.clothing,
              voice_style: character.voice_style,
              status: "complete",
            })
            .eq("id", characterId);

          return Response.json({ characterId, character });
        } catch (err) {
          console.error("Character generation failed:", err);
          await supabase.from("characters").update({ status: "failed" }).eq("id", characterId);
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Generation failed",
              characterId,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
