import Database from "better-sqlite3";

export function initDb(dbPath = "./data.sqlite") {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      shop TEXT NOT NULL,
      created_at TEXT,
      total_price REAL,
      currency TEXT,
      customer_email TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS docs (
      doc_id TEXT PRIMARY KEY,
      shop TEXT NOT NULL,
      type TEXT NOT NULL,
      ref_id TEXT NOT NULL,
      text TEXT NOT NULL,
      embedding_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_docs_shop_type ON docs(shop, type);
    CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop);
  `);

  return db;
}
