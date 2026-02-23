import fetch from "node-fetch";

function mustEnv(name, fallback) {
  return process.env[name] ?? fallback;
}

const OLLAMA_BASE_URL = mustEnv("OLLAMA_BASE_URL", "http://localhost:11434");
const CHAT_MODEL = mustEnv("OLLAMA_CHAT_MODEL", "llama3");
const EMBED_MODEL = mustEnv("OLLAMA_EMBED_MODEL", "nomic-embed-text");

export async function embedText(text) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama embeddings failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.embedding; // number[]
}

export async function chat({ system, user, contextChunks = [] }) {
  const contextBlock = contextChunks.length
    ? `\n\nContext:\n${contextChunks.map((c, i) => `[${i+1}] ${c}`).join("\n\n")}`
    : "";

  const prompt = `${user}${contextBlock}`;

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama chat failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data?.message?.content ?? "";
}