import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  prompt: z.string().min(3).max(4000),
  genre: z.string().max(80).optional().default(""),
  tone: z.string().max(80).optional().default(""),
  length: z.enum(["short", "medium", "long"]).default("short"),
  language: z.string().max(40).default("English"),
  characters: z.string().max(2000).optional().default(""),
});

const LENGTH_MAP = {
  short: { chapters: 3, wordsPerChapter: 350 },
  medium: { chapters: 5, wordsPerChapter: 600 },
  long: { chapters: 8, wordsPerChapter: 900 },
} as const;

const OutlineSchema = z.object({
  title: z.string(),
  logline: z.string(),
  chapters: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
    }),
  ),
});

export const Route = createFileRoute("/api/generate-story")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY;
        const lovableKey = process.env.LOVABLE_API_KEY;
        if (!supabaseUrl || !supabaseAnon || !lovableKey) {
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

        const { chapters: chapterCount, wordsPerChapter } = LENGTH_MAP[body.length];

        // Insert story row
        const { data: storyRow, error: storyErr } = await supabase
          .from("stories")
          .insert({
            user_id: userId,
            title: "Generating…",
            prompt: body.prompt,
            genre: body.genre || null,
            tone: body.tone || null,
            length: body.length,
            language: body.language,
            characters: body.characters || null,
            status: "generating",
          })
          .select("id")
          .single();
        if (storyErr || !storyRow) {
          return new Response(JSON.stringify({ error: storyErr?.message ?? "DB error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const storyId = storyRow.id as string;

        try {
          const gateway = createLovableAiGatewayProvider(lovableKey);
          const model = gateway("google/gemini-3.6-flash");

          // 1. Generate outline
          const outlinePrompt = `You are a master storyteller. Design a compelling story based on:

Idea: ${body.prompt}
Genre: ${body.genre || "author's choice"}
Tone: ${body.tone || "author's choice"}
Language: ${body.language}
Characters the user wants involved: ${body.characters || "(none specified — invent memorable ones)"}

Return a JSON object with:
- title: an evocative title
- logline: a one-sentence hook
- chapters: an array of exactly ${chapterCount} chapters, each with title and a 2-3 sentence summary describing what happens.

Write the title, logline, chapter titles, and summaries in ${body.language}.`;

          let outline: z.infer<typeof OutlineSchema>;
          try {
            const { output } = await generateText({
              model,
              output: Output.object({ schema: OutlineSchema }),
              prompt: outlinePrompt,
            });
            outline = output;
          } catch (err) {
            if (NoObjectGeneratedError.isInstance(err)) {
              throw new Error("Failed to generate outline. Please try again.");
            }
            throw err;
          }

          // Cap chapters defensively
          const outlineChapters = outline.chapters.slice(0, chapterCount);

          await supabase
            .from("stories")
            .update({ title: outline.title, outline: outline as unknown as object })
            .eq("id", storyId);

          // 2. Generate each chapter
          for (let i = 0; i < outlineChapters.length; i++) {
            const ch = outlineChapters[i];
            const prior = outlineChapters
              .slice(0, i)
              .map((c, idx) => `Chapter ${idx + 1}: ${c.title} — ${c.summary}`)
              .join("\n");

            const chapterPrompt = `You are writing "${outline.title}", a ${body.genre || "story"} with a ${body.tone || "compelling"} tone, in ${body.language}.

Full outline so far:
${prior || "(this is the opening chapter)"}

Now write Chapter ${i + 1}: "${ch.title}".
Chapter summary to expand: ${ch.summary}

Write approximately ${wordsPerChapter} words of vivid, immersive prose. Use markdown paragraphs. Do NOT include the chapter number or title as a heading — only the prose. Write in ${body.language}.`;

            const { text } = await generateText({
              model,
              prompt: chapterPrompt,
            });

            const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

            await supabase.from("chapters").insert({
              story_id: storyId,
              user_id: userId,
              chapter_number: i + 1,
              title: ch.title,
              content: text.trim(),
              word_count: wordCount,
            });
          }

          await supabase.from("stories").update({ status: "complete" }).eq("id", storyId);

          return Response.json({ storyId });
        } catch (err) {
          console.error("Story generation failed:", err);
          await supabase.from("stories").update({ status: "failed" }).eq("id", storyId);
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Generation failed",
              storyId,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
