import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createAiProvider } from "@/lib/ai-gateway.server";
import fs from "fs";
import path from "path";

const VOICE_MAP: Record<string, string> = {
  dramatic: "pNInz6obpgDQGcFmaJgB", // Adam
  warm: "EXAVITQu4vr4xnSDxMaL", // Bella
  journalistic: "ErXwobaYiN019PkySvjV", // Antoni
  whimsical: "ThT5KcBeYPX3keUQqHPh", // Dorothy
  dark: "VR6AewLTigWG4xSOukaG", // Arnold
};

const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  narrator_style: z.string().max(100).default("dramatic"),
  chapter_count: z.number().int().min(1).max(5).default(2),
  tone: z.string().max(80).default(""),
});

const ChapterAudioSchema = z.object({
  chapter_number: z.number(),
  title: z.string(),
  narration_script: z.string(),
  sound_design_notes: z.string(),
  estimated_minutes: z.number(),
});

const AudiobookSchema = z.object({
  title: z.string(),
  series_intro: z.string(),
  chapters: z.array(ChapterAudioSchema),
});

export const Route = createFileRoute("/api/generate-audiobook")({
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

        const { data: audiobookRow, error: audiobookErr } = await supabase
          .from("audiobooks")
          .insert({
            user_id: userId,
            title: "Generating…",
            prompt: body.prompt,
            narrator_style: body.narrator_style,
            status: "generating",
          })
          .select("id")
          .single();

        if (audiobookErr || !audiobookRow) {
          return new Response(JSON.stringify({ error: audiobookErr?.message ?? "DB error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const audiobookId = audiobookRow.id as string;

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

          const audiobookPrompt = `You are a professional audiobook writer and sound designer. Create a complete audiobook script.

Story concept: ${body.prompt}
Narrator style: ${body.narrator_style}
Tone: ${body.tone || "author's choice"}
Number of chapters: ${body.chapter_count}

Narrator styles guide:
- dramatic: deep, theatrical, commanding — long pauses for tension
- warm: gentle, intimate, like reading by firelight
- journalistic: crisp, measured, authoritative
- whimsical: light, playful, expressive — good for fantasy/comedy
- dark: hushed, intense, slow-burn — perfect for horror/thriller

Return a JSON object with:
- title: audiobook title
- series_intro: a 2–3 sentence series introduction the narrator reads before Chapter 1
- chapters: array of ${body.chapter_count} chapter objects, each with:
  - chapter_number: integer
  - title: chapter title
  - narration_script: full prose narration script (400–600 words) written for spoken delivery — include pacing markers like [pause], [beat], [slow down], [emphasis: word] where appropriate
  - sound_design_notes: 2–3 sentences on recommended ambient sounds, music cues, and transitions for this chapter
  - estimated_minutes: estimated listening time in minutes as a number

The narration script must be written entirely in the specified narrator style with natural spoken rhythm.`;

          let audiobook: z.infer<typeof AudiobookSchema>;
          try {
            const { output } = await generateText({
              model,
              output: Output.object({ schema: AudiobookSchema }),
              prompt: audiobookPrompt,
            });
            audiobook = output;
          } catch (err) {
            if (NoObjectGeneratedError.isInstance(err)) {
              throw new Error("Failed to generate audiobook. Please try again.");
            }
            throw err;
          }

          const audiobooksDir = path.join(process.cwd(), "public", "audiobooks");
          if (!fs.existsSync(audiobooksDir)) {
            fs.mkdirSync(audiobooksDir, { recursive: true });
          }

          const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
          const finalChapters = [];

          for (const ch of audiobook.chapters) {
            let audioUrl = "";
            const cleanScript = ch.narration_script.replace(/\[.*?\]/g, "").trim();

            if (elevenLabsKey && cleanScript.length > 0) {
              const voiceId = VOICE_MAP[body.narrator_style] || VOICE_MAP["dramatic"];
              const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: "POST",
                headers: {
                  "Accept": "audio/mpeg",
                  "Content-Type": "application/json",
                  "xi-api-key": elevenLabsKey,
                },
                body: JSON.stringify({
                  text: cleanScript,
                  model_id: "eleven_multilingual_v2",
                  voice_settings: { stability: 0.5, similarity_boost: 0.5 },
                }),
              });

              if (ttsResponse.ok) {
                const arrayBuffer = await ttsResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const fileName = `${audiobookId}_ch${ch.chapter_number}.mp3`;
                fs.writeFileSync(path.join(audiobooksDir, fileName), buffer);
                audioUrl = `/audiobooks/${fileName}`;
              } else {
                console.error("ElevenLabs error:", await ttsResponse.text());
              }
            }

            finalChapters.push({ ...ch, audio_url: audioUrl });
          }

          await supabase
            .from("audiobooks")
            .update({
              title: audiobook.title,
              chapters_audio: finalChapters as unknown as object[],
              status: "complete",
            })
            .eq("id", audiobookId);

          return Response.json({ audiobookId, audiobook });
        } catch (err) {
          console.error("Audiobook generation failed:", err);
          await supabase.from("audiobooks").update({ status: "failed" }).eq("id", audiobookId);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Generation failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
