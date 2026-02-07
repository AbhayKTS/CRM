import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dataDir = path.resolve("./data");
const dbPath = path.join(dataDir, "crm.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export const getDb = () => db;

export const serializeNotes = (notes) => JSON.stringify(notes ?? []);
export const deserializeNotes = (notes) => {
  try {
    return JSON.parse(notes ?? "[]");
  } catch {
    return [];
  }
};
