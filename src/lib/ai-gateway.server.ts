import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Returns the best available AI provider based on configured env vars.
 *
 * Priority:
 * 1. OPENAI_API_KEY  — direct OpenAI (works locally and in production)
 * 2. GROQ_API_KEY    — Groq (generous free tier, blazing fast)
 * 3. GEMINI_API_KEY  — Google Gemini (generous free tier)
 * 4. LOVABLE_API_KEY — Lovable AI gateway
 */
export function createAiProvider() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  if (openaiKey) {
    const openai = createOpenAI({ apiKey: openaiKey });
    return (model?: string) => openai(model ?? "gpt-4o-mini");
  }

  if (groqKey) {
    const groq = createOpenAICompatible({
      name: "groq",
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: groqKey,
    });
    return (model?: string) => groq(model ?? "llama-3.3-70b-versatile");
  }

  if (geminiKey) {
    const gemini = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: geminiKey,
    });
    return (model?: string) => gemini(model ?? "gemini-2.0-flash");
  }

  if (lovableKey) {
    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: {
        "Lovable-API-Key": lovableKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });
    return (model?: string) => gateway(model ?? "google/gemini-3.6-flash");
  }

  throw new Error(
    "No AI provider configured. Set OPENAI_API_KEY, GROQ_API_KEY (free), or GEMINI_API_KEY (free) in your .env file.",
  );
}

/** @deprecated Use createAiProvider() instead */
export function createLovableAiGatewayProvider(lovableApiKey: string) {
  const gateway = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
  return gateway;
}
