import crypto from "crypto";
import express from "express";
import { getDb } from "./db.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

const mapLead = (lead) => ({
  id: lead.id,
  name: lead.name,
  email: lead.email,
  source: lead.source,
  status: lead.status,
  notes: lead.notes,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

const withDb = async () => {
  const db = await getDb();
  await db.read();
  db.data ||= { leads: [] };
  return db;
};

router.post("/", async (req, res) => {
  const { name, email, source = "website", note } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  const timestamp = new Date().toISOString();
  const db = await withDb();
  const lead = {
    id: crypto.randomUUID(),
    name,
    email,
    source,
    status: "new",
    notes: note ? [{ text: note, createdAt: timestamp }] : [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.data.leads.push(lead);
  await db.write();
  return res.status(201).json(mapLead(lead));
});

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const db = await withDb();
  const rows = [...db.data.leads].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return res.json(rows.map(mapLead));
});

router.get("/summary", async (req, res) => {
  const db = await withDb();
  const total = db.data.leads.length;
  const converted = db.data.leads.filter((lead) => lead.status === "converted").length;
  const contacted = db.data.leads.filter((lead) => lead.status === "contacted").length;
  return res.json({ total, contacted, converted });
});

router.get("/:id", async (req, res) => {
  const db = await withDb();
  const lead = db.data.leads.find((item) => item.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }
  return res.json(mapLead(lead));
});

router.patch("/:id", async (req, res) => {
  const { status, note } = req.body;
  const db = await withDb();
  const lead = db.data.leads.find((item) => item.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }
  const timestamp = new Date().toISOString();
  if (status) {
    lead.status = status;
  }
  if (note) {
    lead.notes.push({ text: note, createdAt: timestamp });
  }
  lead.updatedAt = timestamp;
  await db.write();
  return res.json(mapLead(lead));
});

export default router;
