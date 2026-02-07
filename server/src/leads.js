import express from "express";
import Lead from "./models/Lead.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

const mapLead = (lead) => ({
  id: lead._id,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  source: lead.source,
  status: lead.status,
  notes: lead.notes.map((n) => ({
    id: n._id,
    text: n.text,
    createdAt: n.createdAt,
  })),
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

// Public route: create lead from website contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, source = "website", note } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const lead = new Lead({
      name,
      email,
      phone,
      source,
      notes: note ? [{ text: note }] : [],
    });
    await lead.save();
    return res.status(201).json(mapLead(lead));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// All routes below require auth
router.use(authMiddleware);

// GET /api/leads?search=&status=&source=
router.get("/", async (req, res) => {
  try {
    const { search, status, source } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    return res.json(leads.map(mapLead));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/leads/summary
router.get("/summary", async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const contacted = await Lead.countDocuments({ status: "contacted" });
    const converted = await Lead.countDocuments({ status: "converted" });
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

    const bySource = await Lead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);
    const sourceStats = bySource.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    return res.json({ total, contacted, converted, conversionRate, bySource: sourceStats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/leads/:id
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    return res.json(mapLead(lead));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/leads/:id – update lead info + status
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, source, status } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (source !== undefined) lead.source = source;
    if (status !== undefined) lead.status = status;
    await lead.save();
    return res.json(mapLead(lead));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/leads/:id
router.delete("/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    return res.json({ message: "Lead deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/leads/:id/notes – add follow-up note
router.post("/:id/notes", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Note text is required" });
    }
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    lead.notes.push({ text });
    await lead.save();
    return res.status(201).json(mapLead(lead));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/leads/:id/notes – list notes
router.get("/:id/notes", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    return res.json(
      lead.notes.map((n) => ({ id: n._id, text: n.text, createdAt: n.createdAt }))
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
