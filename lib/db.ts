import fs from "fs";
import path from "path";
import os from "os";
import { ItineraryData } from "./schema";

export interface StoredItineraryRecord {
  id: string;
  createdAt: string;
  itinerary: ItineraryData;
}

interface DatabaseSchema {
  records: Record<string, StoredItineraryRecord>;
}

// 1. Upstash Redis / Vercel KV REST credentials
function getKvConfig() {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/$/, ""), token };
  }
  return null;
}

// 2. Safe directory for file fallback (Uses /tmp on Vercel to avoid EROFS error)
const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
);
const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "cool-wanderer-data")
  : path.join(process.cwd(), "data");
const DB_FILE_PATH = path.join(DATA_DIR, "itineraries-db.json");

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      let initial: DatabaseSchema = { records: {} };
      const bundledDbPath = path.join(
        process.cwd(),
        "data",
        "itineraries-db.json"
      );
      if (isServerless && fs.existsSync(bundledDbPath)) {
        try {
          const bundledRaw = fs.readFileSync(bundledDbPath, "utf-8");
          const bundledParsed = JSON.parse(bundledRaw) as DatabaseSchema;
          if (bundledParsed && typeof bundledParsed.records === "object") {
            initial = bundledParsed;
          }
        } catch {
          // ignore
        }
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed || typeof parsed.records !== "object") {
      return { records: {} };
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read DB file:", err);
    return { records: {} };
  }
}

function writeDbFile(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write DB file:", err);
  }
}

export function generateItineraryId(): string {
  const rand = Math.random().toString(36).substring(2, 8);
  return `cw_${Date.now()}_${rand}`;
}

export async function saveItineraryToDb(
  itinerary: ItineraryData
): Promise<StoredItineraryRecord> {
  const id =
    itinerary.id && !itinerary.id.startsWith("trip-")
      ? itinerary.id
      : generateItineraryId();

  const updatedItinerary: ItineraryData = {
    ...itinerary,
    id,
  };

  const record: StoredItineraryRecord = {
    id,
    createdAt: new Date().toISOString(),
    itinerary: updatedItinerary,
  };

  // 1. Try Vercel KV / Upstash Redis if configured in Vercel Environment Variables
  const kv = getKvConfig();
  if (kv) {
    try {
      const key = `itinerary:${id}`;
      await fetch(`${kv.url}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kv.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
      return record;
    } catch (kvErr) {
      console.warn("Vercel KV set failed, falling back to local file:", kvErr);
    }
  }

  // 2. Fallback to file storage (/tmp on Vercel or data/ locally)
  const db = ensureDbFile();
  db.records[id] = record;
  writeDbFile(db);
  return record;
}

export async function getItineraryByIdFromDb(
  id: string
): Promise<StoredItineraryRecord | null> {
  // 1. Try Vercel KV / Upstash Redis if configured
  const kv = getKvConfig();
  if (kv) {
    try {
      const key = `itinerary:${id}`;
      const res = await fetch(`${kv.url}/get/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${kv.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.result) {
          return typeof data.result === "string"
            ? (JSON.parse(data.result) as StoredItineraryRecord)
            : (data.result as StoredItineraryRecord);
        }
      }
    } catch (kvErr) {
      console.warn("Vercel KV get failed, falling back to local file:", kvErr);
    }
  }

  // 2. Fallback to file storage
  const db = ensureDbFile();
  return db.records[id] || null;
}

export async function getItinerariesByIdsFromDb(
  ids: string[]
): Promise<StoredItineraryRecord[]> {
  const kv = getKvConfig();
  if (kv && ids.length > 0) {
    try {
      const results = await Promise.all(
        ids.map((id) => getItineraryByIdFromDb(id))
      );
      return results.filter((r): r is StoredItineraryRecord => Boolean(r));
    } catch (kvErr) {
      console.warn("Vercel KV batch get failed:", kvErr);
    }
  }

  const db = ensureDbFile();
  return ids
    .map((id) => db.records[id])
    .filter((rec): rec is StoredItineraryRecord => Boolean(rec));
}

export async function deleteItineraryFromDb(id: string): Promise<boolean> {
  const kv = getKvConfig();
  if (kv) {
    try {
      const key = `itinerary:${id}`;
      await fetch(`${kv.url}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kv.token}`,
        },
      });
    } catch {
      // ignore
    }
  }

  const db = ensureDbFile();
  if (db.records[id]) {
    delete db.records[id];
    writeDbFile(db);
    return true;
  }
  return false;
}
