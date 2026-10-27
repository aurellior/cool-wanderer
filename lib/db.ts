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

const CLOUD_KV_APP_KEY =
  process.env.CLOUD_KV_APP_KEY || "q3l656rj";

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

export function generateItineraryId(suffix?: string): string {
  const rand =
    suffix || Math.random().toString(36).substring(2, 8);
  return `cw_${Date.now()}_${rand}`;
}

// Zero-config persistent cloud storage across serverless instances
async function saveToCloudStore(
  record: StoredItineraryRecord,
  useBlobKeyInNewId: boolean
): Promise<StoredItineraryRecord | null> {
  try {
    const postRes = await fetch("https://bytebin.lucko.me/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "cool-wanderer/1.0",
      },
      body: JSON.stringify(record),
    });

    if (!postRes.ok) {
      return null;
    }

    const postData = (await postRes.json()) as { key?: string };
    const blobKey = postData?.key?.trim();
    if (!blobKey) {
      return null;
    }

    const finalId = useBlobKeyInNewId
      ? generateItineraryId(blobKey)
      : record.id;

    const finalRecord: StoredItineraryRecord = {
      ...record,
      id: finalId,
      itinerary: {
        ...record.itinerary,
        id: finalId,
      },
    };

    const safeId = encodeURIComponent(finalId);
    await Promise.allSettled([
      fetch(
        `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${CLOUD_KV_APP_KEY}/${safeId}/${encodeURIComponent(
          blobKey
        )}`,
        { method: "POST", cache: "no-store" }
      ),
      fetch(`https://ntfy.sh/cw_idx_${safeId}`, {
        method: "POST",
        body: blobKey,
        cache: "no-store",
      }),
    ]);

    return finalRecord;
  } catch (err) {
    console.warn("Cloud store save failed:", err);
    return null;
  }
}

async function getFromCloudStore(
  id: string
): Promise<StoredItineraryRecord | null> {
  const cleanId = id.trim();
  const safeId = encodeURIComponent(cleanId);
  let pointerKey: string | null = null;

  // 1. Check primary cloud KV pointer index
  try {
    const kvRes = await fetch(
      `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${CLOUD_KV_APP_KEY}/${safeId}`,
      { cache: "no-store" }
    );
    if (kvRes.ok) {
      const text = (await kvRes.text()).replace(/"/g, "").trim();
      if (text === "DELETED") return null;
      if (text && /^[A-Za-z0-9]+$/.test(text)) {
        pointerKey = text;
      }
    }
  } catch {
    // ignore
  }

  // 2. Fallback to secondary ntfy pointer index
  if (!pointerKey) {
    try {
      const ntfyRes = await fetch(
        `https://ntfy.sh/cw_idx_${safeId}/json?poll=1`,
        { cache: "no-store" }
      );
      if (ntfyRes.ok) {
        const lines = (await ntfyRes.text())
          .trim()
          .split("\n")
          .filter(Boolean);
        if (lines.length > 0) {
          const last = JSON.parse(lines[lines.length - 1]) as {
            message?: string;
          };
          const msg = last?.message?.trim();
          if (msg === "DELETED") return null;
          if (msg && /^[A-Za-z0-9]+$/.test(msg)) {
            pointerKey = msg;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Also extract embedded blob key from cw_<timestamp>_<blobKey> if present
  let embeddedKey: string | null = null;
  if (cleanId.startsWith("cw_")) {
    const parts = cleanId.split("_");
    if (parts.length >= 3 && /^[A-Za-z0-9]{7,}$/.test(parts[2])) {
      embeddedKey = parts[2];
    }
  }

  const candidateKeys = Array.from(
    new Set([pointerKey, embeddedKey].filter((k): k is string => Boolean(k)))
  );

  for (const key of candidateKeys) {
    try {
      const blobRes = await fetch(`https://bytebin.lucko.me/${key}`, {
        headers: { "User-Agent": "cool-wanderer/1.0" },
        cache: "no-store",
      });
      if (blobRes.ok) {
        const parsed = (await blobRes.json()) as StoredItineraryRecord;
        if (parsed && parsed.itinerary) {
          return {
            ...parsed,
            id: cleanId,
            itinerary: {
              ...parsed.itinerary,
              id: cleanId,
            },
          };
        }
      }
    } catch {
      // try next candidate key
    }
  }

  return null;
}

export async function saveItineraryToDb(
  itinerary: ItineraryData
): Promise<StoredItineraryRecord> {
  const hasExistingCwId = Boolean(
    itinerary.id && itinerary.id.startsWith("cw_")
  );
  const initialId = hasExistingCwId
    ? itinerary.id!
    : generateItineraryId();

  let record: StoredItineraryRecord = {
    id: initialId,
    createdAt: new Date().toISOString(),
    itinerary: {
      ...itinerary,
      id: initialId,
    },
  };

  // 1. Try Vercel KV / Upstash Redis if configured in Vercel Environment Variables
  const kv = getKvConfig();
  if (kv) {
    try {
      const key = `itinerary:${record.id}`;
      await fetch(`${kv.url}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kv.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
    } catch (kvErr) {
      console.warn("Vercel KV set failed:", kvErr);
    }
  }

  // 2. Save to Zero-Config Cloud Store so shared ?id= links work across all Vercel serverless instances
  const cloudSaved = await saveToCloudStore(record, !hasExistingCwId);
  if (cloudSaved) {
    record = cloudSaved;
  }

  // 3. Also save to local /tmp or data/ file cache
  const db = ensureDbFile();
  db.records[record.id] = record;
  writeDbFile(db);

  return record;
}

export async function getItineraryByIdFromDb(
  id: string
): Promise<StoredItineraryRecord | null> {
  const cleanId = id.trim();
  if (!cleanId) return null;

  // 1. Try Vercel KV / Upstash Redis if configured
  const kv = getKvConfig();
  if (kv) {
    try {
      const key = `itinerary:${cleanId}`;
      const res = await fetch(`${kv.url}/get/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${kv.token}`,
        },
        cache: "no-store",
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
      console.warn("Vercel KV get failed:", kvErr);
    }
  }

  // 2. Try Zero-Config Cloud Store (works across all Vercel serverless instances)
  const cloudRecord = await getFromCloudStore(cleanId);
  if (cloudRecord) {
    const db = ensureDbFile();
    db.records[cleanId] = cloudRecord;
    writeDbFile(db);
    return cloudRecord;
  }

  // 3. Fallback to local file storage
  const db = ensureDbFile();
  return db.records[cleanId] || null;
}

export async function getItinerariesByIdsFromDb(
  ids: string[]
): Promise<StoredItineraryRecord[]> {
  const cleanIds = ids.map((s) => s.trim()).filter(Boolean);
  if (cleanIds.length === 0) return [];

  const kv = getKvConfig();
  if (kv) {
    try {
      const results = await Promise.all(
        cleanIds.map((id) => getItineraryByIdFromDb(id))
      );
      return results.filter((r): r is StoredItineraryRecord => Boolean(r));
    } catch (kvErr) {
      console.warn("Vercel KV batch get failed:", kvErr);
    }
  }

  // Check local file first, and for any missing IDs fetch from cloud store
  const db = ensureDbFile();
  let dbUpdated = false;

  const resolved = await Promise.all(
    cleanIds.map(async (id) => {
      if (db.records[id]) {
        return db.records[id];
      }
      const fromCloud = await getFromCloudStore(id);
      if (fromCloud) {
        db.records[id] = fromCloud;
        dbUpdated = true;
        return fromCloud;
      }
      return null;
    })
  );

  if (dbUpdated) {
    writeDbFile(db);
  }

  return resolved.filter((rec): rec is StoredItineraryRecord => Boolean(rec));
}

export async function deleteItineraryFromDb(id: string): Promise<boolean> {
  const cleanId = id.trim();
  const kv = getKvConfig();
  if (kv) {
    try {
      const key = `itinerary:${cleanId}`;
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

  const safeId = encodeURIComponent(cleanId);
  await Promise.allSettled([
    fetch(
      `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${CLOUD_KV_APP_KEY}/${safeId}/DELETED`,
      { method: "POST", cache: "no-store" }
    ),
    fetch(`https://ntfy.sh/cw_idx_${safeId}`, {
      method: "POST",
      body: "DELETED",
      cache: "no-store",
    }),
  ]);

  const db = ensureDbFile();
  if (db.records[cleanId]) {
    delete db.records[cleanId];
    writeDbFile(db);
    return true;
  }
  return false;
}
