import express from "express";
import cors from "cors";
import { z } from "zod";
import { initDb } from "./db.js";
import { sampleOrders } from "./sampleOrders.js";
import { embedText, chat } from "./ollama.js";
import { cosineSimilarity } from "./vector.js";
import { fetchRecentOrdersFromShopify } from "./shopify.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT ?? 8787);
const db = initDb("./data.sqlite");

// ---------- helpers ----------
function orderToDocText(order) {
  const items = (order.line_items ?? [])
    .map(li => `${li.quantity}x ${li.title} ($${li.price}) vendor=${li.vendor ?? "n/a"}`)
    .join("; ");

  return [
    `Order ${order.id}`,
    `created_at=${order.created_at ?? ""}`,
    `total=${order.total_price ?? order.totalPrice ?? ""} ${order.currency ?? "USD"}`,
    `customer=${order.customer_email ?? ""}`,
    `city=${order.shipping_city ?? ""}`,
    `tags=${(order.tags ?? []).join(",")}`,
    `discount_codes=${JSON.stringify(order.discount_codes ?? [])}`,
    `items=${items}`
  ].join("\n");
}

function upsertOrder({ shop, order }) {
  const id = String(order.id);
  const created_at = order.created_at ?? order.createdAt ?? null;
  const total_price = Number(order.total_price ?? order.totalPrice ?? 0);
  const currency = order.currency ?? "USD";
  const email = order.customer_email ?? order.email ?? null;

  db.prepare(`
    INSERT INTO orders (id, shop, created_at, total_price, currency, customer_email, raw_json)
    VALUES (@id, @shop, @created_at, @total_price, @currency, @customer_email, @raw_json)
    ON CONFLICT(id) DO UPDATE SET
      created_at=excluded.created_at,
      total_price=excluded.total_price,
      currency=excluded.currency,
      customer_email=excluded.customer_email,
      raw_json=excluded.raw_json
  `).run({
    id,
    shop,
    created_at,
    total_price,
    currency,
    customer_email: email,
    raw_json: JSON.stringify(order)
  });

  return id;
}

async function upsertDocEmbedding({ shop, type, ref_id, text }) {
  const embedding = await embedText(text);

  db.prepare(`
    INSERT INTO docs (doc_id, shop, type, ref_id, text, embedding_json, created_at)
    VALUES (@doc_id, @shop, @type, @ref_id, @text, @embedding_json, @created_at)
    ON CONFLICT(doc_id) DO UPDATE SET
      text=excluded.text,
      embedding_json=excluded.embedding_json
  `).run({
    doc_id: `${type}:${shop}:${ref_id}`,
    shop,
    type,
    ref_id,
    text,
    embedding_json: JSON.stringify(embedding),
    created_at: new Date().toISOString()
  });
}

async function semanticSearch({ shop, query, k = 6 }) {
  const qEmb = await embedText(query);

  const rows = db.prepare(`SELECT ref_id, text, embedding_json FROM docs WHERE shop = ?`).all(shop);
  const scored = rows.map(r => {
    const emb = JSON.parse(r.embedding_json);
    return { ref_id: r.ref_id, text: r.text, score: cosineSimilarity(qEmb, emb) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// ---------- routes ----------
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/ingest/sample", async (req, res) => {
  const shop = String(req.body?.shop ?? "demo-shop");
  const orders = sampleOrders;

  for (const o of orders) {
    const orderId = upsertOrder({ shop, order: o });
    const text = orderToDocText(o);
    await upsertDocEmbedding({ shop, type: "order", ref_id: orderId, text });
  }

  res.json({ ok: true, ingested: orders.length, shop });
});

app.post("/api/ingest/shopify", async (req, res) => {
  const Body = z.object({
    shop: z.string().min(3),
    accessToken: z.string().min(10),
    limit: z.number().int().min(1).max(100).optional()
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const { shop, accessToken, limit } = parsed.data;
  const orders = await fetchRecentOrdersFromShopify({ shop, accessToken, limit: limit ?? 20 });

  for (const o of orders) {
    const orderId = upsertOrder({ shop, order: o });
    const text = orderToDocText(o);
    await upsertDocEmbedding({ shop, type: "order", ref_id: orderId, text });
  }

  res.json({ ok: true, ingested: orders.length, shop });
});

app.post("/api/recommendations", async (req, res) => {
  const Body = z.object({
    shop: z.string().default("demo-shop"),
    question: z.string().min(3)
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const { shop, question } = parsed.data;
  const top = await semanticSearch({ shop, query: question, k: 6 });

  const system = `
You are an AI Commerce Assistant for a Shopify merchant.
You must:
- Use ONLY the provided Context to support claims.
- Produce enterprise-ready recommendations with clear "Why", "What to do", and "How to measure".
- If data is insufficient, say what is missing and suggest what to instrument.
Return JSON with keys:
{
  "insights": string[],
  "recommended_actions": { "title": string, "why": string, "steps": string[], "metrics": string[] }[],
  "follow_up_questions": string[]
}
`.trim();

  const answer = await chat({
    system,
    user: `Merchant question: ${question}\nShop: ${shop}\nRespond strictly as JSON.`,
    contextChunks: top.map(t => t.text)
  });

  res.json({
    ok: true,
    retrieved: top.map(t => ({ ref_id: t.ref_id, score: Number(t.score.toFixed(4)) })),
    answer
  });
});

app.post("/api/chat", async (req, res) => {
  const Body = z.object({
    shop: z.string().default("demo-shop"),
    message: z.string().min(1)
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });

  const { shop, message } = parsed.data;
  const top = await semanticSearch({ shop, query: message, k: 6 });

  const system = `
You are a helpful Shopify commerce analyst.
Use the provided Context snippets from orders. If not enough evidence, ask clarifying questions.
Keep answers concise and action-oriented.
`.trim();

  const answer = await chat({
    system,
    user: message,
    contextChunks: top.map(t => t.text)
  });

  res.json({ ok: true, retrieved: top.map(t => ({ ref_id: t.ref_id, score: t.score })), answer });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});