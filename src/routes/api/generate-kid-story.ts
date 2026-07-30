import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";
import fs from "fs";
import path from "path";

const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  tone: z.string().max(80).default("whimsical and educational"),
  characters: z.string().max(500).optional().default(""),
  page_count: z.number().int().min(3).max(10).default(5),
});

const PageSchema = z.object({
  page_number: z.number(),
  text: z.string(),
  image_prompt: z.string(),
});

const KidStorySchema = z.object({
  title: z.string(),
  pages: z.array(PageSchema),
});

async function generateImage(prompt: string, retries = 3): Promise<string | null> {
  // Using Pollinations.ai - A free, no-API-key required image generation service
  // perfect for development and prototyping.
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt + ", cute children's book illustration, high quality, soft colors");
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&nologo=true`;
  
  for (let i = 0; i < retries; i++) {
    try {
      // Add a small delay to prevent rapid-fire requests
      await new Promise(r => setTimeout(r, 2000 + (i * 2000)));
      
      const response = await fetch(url);
      
      if (response.status === 429) {
        console.warn(`Rate limited by Pollinations, retrying in ${3 * (i + 1)}s...`);
        await new Promise(r => setTimeout(r, 3000 * (i + 1)));
        continue;
      }
      
      if (!response.ok) {
        console.error("Image generation failed:", response.statusText);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    } catch (err) {
      console.error("Error generating image:", err);
    }
  }
  return null;
}

export const Route = createFileRoute("/api/generate-kid-story")({
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

        const { data: storyRow, error: storyErr } = await (supabase as any)
          .from("kid_stories")
          .insert({
            user_id: userId,
            title: "Generating...",
            prompt: body.prompt,
            tone: body.tone,
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
          const storyPrompt = `You are a talented children's book author. Create a complete, short, illustrated kid's story.

Story idea: ${body.prompt}
Tone: ${body.tone}
Characters: ${body.characters || "Invent fitting characters"}
Number of pages: ${body.page_count}

Return a JSON object with:
- title: the title of the story
- pages: array of exactly ${body.page_count} page objects, each with:
  - page_number: integer starting at 1
  - text: The story text for this page (2-4 simple, engaging sentences suitable for children)
  - image_prompt: A highly detailed image generation prompt describing the illustration for this page. Describe the character appearances, the setting, colors, and art style (e.g., "A cute, soft watercolor illustration of...").`;

          let story: z.infer<typeof KidStorySchema>;
          try {
            const { output } = await generateText({
              model,
              output: Output.object({ schema: KidStorySchema }),
              prompt: storyPrompt,
            });
            story = output;
          } catch (err) {
            if (NoObjectGeneratedError.isInstance(err)) {
              throw new Error("Failed to generate kid story. Please try again.");
            }
            throw err;
          }

          // Ensure directories exist
          const imagesDir = path.join(process.cwd(), "public", "kid_stories", storyId);
          if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

          const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
          const geminiKey = process.env.GEMINI_API_KEY;
          
          const finalPages = [];

          for (const page of story.pages) {
            let audioUrl = "";
            let imageUrl = "";

            // Generate Image
            const base64Image = await generateImage(page.image_prompt);
            if (base64Image) {
              const buffer = Buffer.from(base64Image, 'base64');
              const fileName = `page_${page.page_number}.jpg`;
              fs.writeFileSync(path.join(imagesDir, fileName), buffer);
              imageUrl = `/kid_stories/${storyId}/${fileName}`;
            }

            // Generate Audio
            if (elevenLabsKey && page.text.trim().length > 0) {
              // Using a whimsical/warm voice for kids stories (Dorothy's ID)
              const voiceId = "ThT5KcBeYPX3keUQqHPh"; 
              const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: "POST",
                headers: {
                  "Accept": "audio/mpeg",
                  "Content-Type": "application/json",
                  "xi-api-key": elevenLabsKey,
                },
                body: JSON.stringify({
                  text: page.text,
                  model_id: "eleven_multilingual_v2",
                  voice_settings: { stability: 0.5, similarity_boost: 0.8 },
                }),
              });

              if (ttsResponse.ok) {
                const arrayBuffer = await ttsResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const fileName = `page_${page.page_number}.mp3`;
                fs.writeFileSync(path.join(imagesDir, fileName), buffer);
                audioUrl = `/kid_stories/${storyId}/${fileName}`;
              }
            }

            finalPages.push({ ...page, image_url: imageUrl, audio_url: audioUrl });
          }

          await (supabase as any)
            .from("kid_stories")
            .update({
              title: story.title,
              pages: finalPages as unknown as object[],
              status: "complete",
            })
            .eq("id", storyId);

          return Response.json({ storyId, title: story.title });
        } catch (err) {
          console.error("Kid Story generation failed:", err);
          await (supabase as any).from("kid_stories").update({ status: "failed" }).eq("id", storyId);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Generation failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
