import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import leadsRouter from "./leads.js";
import { getAdminConfig, issueToken, verifyAdminPassword } from "./auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = getAdminConfig();
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (email !== admin.email) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const valid = await verifyAdminPassword(password, admin.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = issueToken({ email });
  return res.json({ token, email });
});

app.use("/api/leads", leadsRouter);

app.listen(port, () => {
  console.log(`CRM API listening on ${port}`);
});
