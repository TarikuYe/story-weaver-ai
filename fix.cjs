const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "src/routes/api");
const files = [
  "generate-character.ts",
  "generate-world.ts",
  "generate-comic.ts",
  "generate-interactive.ts",
  "generate-dialogue.ts",
  "generate-audiobook.ts",
];

const modelInitReplace = `let model: ReturnType<ReturnType<typeof createAiProvider>>;
        try {
          const provider = createAiProvider();
          model = provider();
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "AI provider not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        try {`;

files.forEach((file) => {
  const filePath = path.join(apiDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, "utf-8");
  
  // 1. Import
  content = content.replace(
    /import \{ createLovableAiGatewayProvider \} from "@\/lib\/ai-gateway.server";/,
    `import { createAiProvider } from "@/lib/ai-gateway.server";`
  );
  
  // 2. Env vars
  content = content.replace(
    /const lovableKey = process\.env\.LOVABLE_API_KEY;\s+if \(!supabaseUrl \|\| !supabaseAnon \|\| !lovableKey\) \{/,
    `if (!supabaseUrl || !supabaseAnon) {`
  );

  // 3. Model instantiation
  content = content.replace(
    /try \{\s+const gateway = createLovableAiGatewayProvider\(lovableKey\);\s+const model = gateway\("google\/gemini-3\.6-flash"\);/,
    modelInitReplace
  );

  // 4. JSON Generation replacement (for the 4 files that use Output.object)
  if (file !== "generate-dialogue.ts") {
    // Extract Schema name and variable name
    let match = content.match(/let (\w+): z\.infer<typeof (\w+)Schema>;/);
    if (match) {
      let varName = match[1];
      let schemaName = match[2] + "Schema";
      
      const oldGenBlockRegex = new RegExp(
        `let ${varName}: z\\.infer<typeof ${schemaName}>;\\s+try \\{\\s+const \\{ output \\} = await generateText\\(\\{\\s+model,\\s+output: Output\\.object\\(\\{ schema: ${schemaName} \\}\\),\\s+prompt: (\\w+)Prompt,\\s+\\}\\);\\s+${varName} = output;\\s+\\} catch \\(err\\) \\{\\s+if \\(NoObjectGeneratedError\\.isInstance\\(err\\)\\) \\{\\s+throw new Error\\("Failed to generate (?:[^"]+)\\. Please try again\\."\\);\\s+\\}\\s+throw err;\\s+\\}`
      );
      
      const promptVar = content.match(oldGenBlockRegex)?.[1] || varName + "Prompt";

      const newGenBlock = `let ${varName}: z.infer<typeof ${schemaName}>;
          try {
            const { text } = await generateText({
              model,
              prompt: ${promptVar} + "\\n\\nCRITICAL: Return ONLY valid JSON and absolutely no other text. Do not wrap in markdown blocks.",
            });
            const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
            const rawJson = jsonMatch ? jsonMatch[0] : text;
            ${varName} = ${schemaName}.parse(JSON.parse(rawJson));
          } catch (err) {
            console.error("${varName} parsing failed. Raw error:", err);
            throw new Error("Failed to generate ${varName}. Please try again.");
          }`;
      
      content = content.replace(oldGenBlockRegex, newGenBlock);
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
});

console.log("Refactoring complete");
