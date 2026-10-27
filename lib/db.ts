import fs from "fs";
import path from "path";
import { ItineraryData } from "./schema";

export interface StoredItineraryRecord {
  id: string;
  createdAt: string;
  itinerary: ItineraryData;
}

interface DatabaseSchema {
  records: Record<string, StoredItineraryRecord>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE_PATH = path.join(DATA_DIR, "itineraries-db.json");

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial: DatabaseSchema = { records: {} };
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

export function saveItineraryToDb(
  itinerary: ItineraryData
): StoredItineraryRecord {
  const db = ensureDbFile();
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

  db.records[id] = record;
  writeDbFile(db);
  return record;
}

export function getItineraryByIdFromDb(
  id: string
): StoredItineraryRecord | null {
  const db = ensureDbFile();
  return db.records[id] || null;
}

export function getItinerariesByIdsFromDb(
  ids: string[]
): StoredItineraryRecord[] {
  const db = ensureDbFile();
  return ids
    .map((id) => db.records[id])
    .filter((rec): rec is StoredItineraryRecord => Boolean(rec));
}

export function deleteItineraryFromDb(id: string): boolean {
  const db = ensureDbFile();
  if (db.records[id]) {
    delete db.records[id];
    writeDbFile(db);
    return true;
  }
  return false;
}
