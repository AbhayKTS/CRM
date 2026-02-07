import express from "express";
import { getDb, serializeNotes, deserializeNotes } from "./db.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();
const db = getDb();

const mapLead = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  source: row.source,
  status: row.status,
  notes: deserializeNotes(row.notes),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.post("/", (req, res) => {
  const { name, email, source = "website", note } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  const timestamp = new Date().toISOString();
  const notes = note ? [{ text: note, createdAt: timestamp }] : [];
  const stmt = db.prepare(
    `INSERT INTO leads (name, email, source, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    name,
    email,
    source,
    "new",
    serializeNotes(notes),
    timestamp,
    timestamp
  );
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(info.lastInsertRowid);
  return res.status(201).json(mapLead(lead));
});

router.use(authMiddleware);

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  return res.json(rows.map(mapLead));
});

router.get("/summary", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM leads").get().count;
  const converted = db
    .prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'converted'")
    .get().count;
  const contacted = db
    .prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'contacted'")
    .get().count;
  return res.json({ total, contacted, converted });
});

router.get("/:id", (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }
  return res.json(mapLead(lead));
});

router.patch("/:id", (req, res) => {
  const { status, note } = req.body;
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }
  const timestamp = new Date().toISOString();
  const notes = deserializeNotes(lead.notes);
  if (note) {
    notes.push({ text: note, createdAt: timestamp });
  }
  const nextStatus = status || lead.status;
  db.prepare(
    `UPDATE leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?`
  ).run(nextStatus, serializeNotes(notes), timestamp, req.params.id);

  const updated = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  return res.json(mapLead(updated));
});

export default router;
