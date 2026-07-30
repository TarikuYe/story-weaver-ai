import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";
import { ADVANCED_AUTHOR_PROMPT } from "@/lib/prompts";

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
  chapters: z.array(z.object({ title: z.string(), summary: z.string() })),
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
        if (!supabaseUrl || !supabaseAnon) {
          return new Response("Server misconfigured: missing Supabase env vars", { status: 500 });
        }

        let model: ReturnType<ReturnType<typeof createAiProvider>>;
        try {
          const provider = createAiProvider();
          model = provider();
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "AI provider not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
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
          const outlinePrompt = `You are a master storyteller. Design a compelling story based on:

Idea: ${body.prompt}
Genre: ${body.genre || "author's choice"}
Tone: ${body.tone || "author's choice"}
Language: ${body.language}
Characters the user wants involved: ${body.characters || "(none specified — invent memorable ones)"}

Return a JSON object with:
- title: an evocative title
- logline: a one-sentence hook
- chapters: an array of exactly ${chapterCount} chapters, each with "title" and a 2-3 sentence "summary" describing what happens.

Write the title, logline, chapter titles, and summaries in ${body.language}.`;

          let outline: z.infer<typeof OutlineSchema>;
          try {
            const { text } = await generateText({
              model,
              prompt: outlinePrompt + "\n\nCRITICAL: Return ONLY valid JSON and absolutely no other text. Do not wrap in markdown blocks.",
            });
            
            // Attempt to extract JSON in case the model ignored the instruction and added markdown
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const rawJson = jsonMatch ? jsonMatch[0] : text;
            
            outline = OutlineSchema.parse(JSON.parse(rawJson));
          } catch (err) {
            console.error("Outline parsing failed. Raw error:", err);
            throw new Error("Failed to generate outline. Please try again.");
          }

          const outlineChapters = outline.chapters.slice(0, chapterCount);

          await supabase
            .from("stories")
            .update({ title: outline.title, outline: outline as unknown as object })
            .eq("id", storyId);

          let storyBible = "No story bible yet. Create one after this chapter based on the outline.";
          let previousSummaries = "No previous chapters.";

          for (let i = 0; i < outlineChapters.length; i++) {
            const ch = outlineChapters[i];

            const chapterPrompt = `${ADVANCED_AUTHOR_PROMPT}

====================================================
CURRENT STATE
====================================================
Title: "${outline.title}"
Genre: ${body.genre || "author's choice"}
Tone: ${body.tone || "author's choice"}
Language: ${body.language}

CURRENT STORY BIBLE:
${storyBible}

PREVIOUS CHAPTER SUMMARIES:
${previousSummaries}

====================================================
YOUR TASK
====================================================
Write Chapter ${i + 1}: "${ch.title}".
Chapter summary to expand: ${ch.summary}
Word count target: approximately ${wordsPerChapter} words of vivid, immersive prose.

====================================================
OUTPUT FORMAT (CRITICAL)
====================================================
Return your response ENTIRELY inside XML tags. Do not include any text outside these tags.

<chapter_title>Title here</chapter_title>
<chapter_summary>1-2 sentence summary of this chapter</chapter_summary>
<main_scenes>Bullet points of main scenes</main_scenes>
<chapter_content>
The full novel-quality prose here... (use markdown paragraphs, do NOT include the chapter title as a heading)
</chapter_content>
<character_notes>Development notes</character_notes>
<mysteries>New mysteries introduced</mysteries>
<questions_answered>Questions answered</questions_answered>
<foreshadowing>Foreshadowing planted</foreshadowing>
<story_bible_updates>
FULL, complete, updated Story Bible here. Do not output a diff, output the entire updated Story Bible so the next chapter remembers everything.
</story_bible_updates>
<preview>Preview sentence for the next chapter</preview>
`;

            const { text } = await generateText({ model, prompt: chapterPrompt });

            const extractTag = (tag: string) => {
              const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
              return text.match(regex)?.[1]?.trim() || "";
            };

            const chapterTitle = extractTag("chapter_title") || ch.title;
            const chapterSummary = extractTag("chapter_summary");
            const chapterContent = extractTag("chapter_content") || text; // Fallback to raw text if tag fails
            const mainScenes = extractTag("main_scenes");
            const charNotes = extractTag("character_notes");
            const mysteries = extractTag("mysteries");
            const questionsAnswered = extractTag("questions_answered");
            const foreshadowing = extractTag("foreshadowing");
            const newStoryBible = extractTag("story_bible_updates");
            const preview = extractTag("preview");

            // Update state for next iterations
            if (newStoryBible && newStoryBible.length > 50) {
              storyBible = newStoryBible;
            }
            if (chapterSummary) {
              if (previousSummaries === "No previous chapters.") previousSummaries = "";
              previousSummaries += `\nChapter ${i + 1} (${chapterTitle}): ${chapterSummary}`;
            }

            const wordCount = chapterContent.trim().split(/\s+/).filter(Boolean).length;

            const fullMarkdown = `${chapterContent}

---
### 📝 Author's Notes

**Chapter Summary:**
${chapterSummary || ch.summary}

**Main Scenes:**
${mainScenes}

**Character Development:**
${charNotes}

**Mysteries Introduced:**
${mysteries}

**Questions Answered:**
${questionsAnswered}

**Foreshadowing:**
${foreshadowing}

**Preview:**
*${preview}*`;

            await supabase.from("chapters").insert({
              story_id: storyId,
              user_id: userId,
              chapter_number: i + 1,
              title: chapterTitle,
              content: fullMarkdown.trim(),
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
