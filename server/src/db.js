import fs from "fs";
import path from "path";
import { JSONFilePreset } from "lowdb/node";

const dataDir = path.resolve("./data");
const dbPath = path.join(dataDir, "crm.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPromise = JSONFilePreset(dbPath, { leads: [] });

export const getDb = async () => dbPromise;
