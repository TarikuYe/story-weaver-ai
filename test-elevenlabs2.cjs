const fs = require('fs');

async function test() {
  const key = "sk_abbe63cfb4ea68bc44865c526c48458fc9daa832b1d413c8";
  
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB", {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": key,
    },
    body: JSON.stringify({
      text: "This is a test of the Eleven Labs API with multilingual v2.",
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.5 },
    }),
  });

  if (!response.ok) {
    console.error("Failed:", response.status, response.statusText);
    console.error(await response.text());
  } else {
    console.log("Success! Received audio data.");
    const buf = Buffer.from(await response.arrayBuffer());
    console.log("Audio size:", buf.length, "bytes");
  }
}

test();
