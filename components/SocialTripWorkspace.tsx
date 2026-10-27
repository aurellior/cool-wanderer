"use client";

import React, { useState, useEffect, useCallback } from "react";
import DynamicLeafletMap from "./map/DynamicMap";
import { FocusedStop } from "./map/LeafletMap";
import { ActivityCategory, ActivityItem, ItineraryData } from "@/lib/schema";
import { PRESET_SUMMARIES } from "@/lib/presets";
import {
  Navigation,
  Sparkles,
  Link2,
  Loader2,
  History,
  Trash2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  MapPin,
  Wallet,
  Sun,
  Lightbulb,
  Train,
  Footprints,
  Car,
  ListOrdered,
  Map as MapIcon,
  CheckCircle2,
  Compass,
  X,
  Route,
  Clock,
  Utensils,
  Landmark,
  Ticket,
  BedDouble,
  FileText,
  AlertCircle,
} from "lucide-react";

const HISTORY_IDS_STORAGE_KEY = "cool_wanderer_history_ids";
const HISTORY_CACHE_STORAGE_KEY = "cool_wanderer_history_cache";
const ACTIVE_ID_STORAGE_KEY = "cool_wanderer_active_id";

interface HistoryRecord {
  id: string;
  createdAt: string;
  itinerary: ItineraryData;
}

const DEFAULT_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB07u6Ix2lcJXoieNOGUrkplOD51cAJ6_IfcqzAkgfTkxfJ8X_B95jUoBGt6Ujn7TdOHbtf-odaSxkIkLSfUXdiCp8QlXT2goRNVohTk7I6EK4peTv63K6Zf26WsEhIk_7DhjrbR8cSNKZVDJ_DrYIVYTObBiJ5B99iy1UdBgyhSMWGi6jACVzATfvYi-THJBu4E-MN2jAT2hxKGoh8nfC-CydrbbkURVR7HnGBrxd7BApFg6SwwjkZQQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuABOdK_qLtzEwiN0Qm0HMqDXFgfgDWnDfWg7kHFBvlPARVPduuRN8ocEIU7EsS80UCI3o2tFBpzqPGY_-4-QANbw9Vhx8Drd3DfF95cXG3JfW6ZjFv3seMTDyT1XBGsWUKM6V0icz4xmnmWZWDHcuMKY2GH9X3lkznVgAOhbV3YPdZfMheocfu1vh60CavV9JXPtYsU5sdaDWBHt13Wm-IS6TiO7b1mCBvMzronHNxwMqLdYGPnBNYabQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRdtgaiQ9dzgYDw-Uy8I2ZKgG0BHHJZjw1Zze67qIIam4DibA-jkgeJ5cTwxrZKFtJq0QDJBCLsq8-deD7txmiFy78c6e2UGZsWmggjwZwwmiUkCXnDgJ7MVBzrrz-xfVg-8hEPuHJzHQl8WMqH4tGBYWC-iFSMUYz7Dt1fL-QU3rN4Nz2ZCBSuWY18NM5QT8wak4S80caa12_ce3uK2IccjpaZbju9KWtW7G_QLW2bR4CjRk79Ch_HA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCoGBTJ9b7AfU0JCcJm5MHD30m9c9cOeelnT2jG2X6-AqibIM2ai62jqIpT4J5Yv4zq7Lg9KSoQMVTYmUQeRjeCWzVG-Yu27GHXlsWhOTxLeyCUOoagxn8jQLQeN_5GC7nSDV0g0TYkCkpWSYRa5T4w8CQf1DyXq5T1xOwwbt25-lRzG6e7OpFrbHsZuXqHzt_8HdqVmJAQrw-DVvMUTxa3NN8I41vStH9uka2UEy1zCJYdxqm6-BdQDg",
];

const DEFAULT_TRANSITS: {
  icon: "subway" | "directions_walk" | "local_taxi" | "directions_car";
  mode: string;
  duration: string;
}[] = [
  { icon: "directions_car", mode: "Kendaraan / Transit", duration: "15 mnt" },
  { icon: "directions_walk", mode: "Jalan Kaki", duration: "8 mnt (650m)" },
  {
    icon: "local_taxi",
    mode: "Taksi Online",
    duration: "12 mnt (Hemat Waktu)",
  },
];

const AI_LOADING_STEPS = [
  {
    title: "Mengekstrak konten & metadata video",
    desc: "Mengambil caption, audio, serta frame visual dari tautan sosial media...",
  },
  {
    title: "Mendeteksi destinasi & kuliner dengan Gemini AI",
    desc: "Mengidentifikasi seluruh tempat wisata, kafe, dan aktivitas yang direkomendasikan...",
  },
  {
    title: "Mengelompokkan rute harian searah (Smart Clustering)",
    desc: "Menyusun urutan kunjungan pagi hingga malam agar rute efisien & tidak bolak-balik...",
  },
  {
    title: "Memetakan koordinat GPS & estimasi budget",
    desc: "Menyiapkan pin peta interaktif OpenStreetMap, jam terbaik, dan tips lokal...",
  },
];

function getSavedIdsFromLocalStorage(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function saveIdsToLocalStorage(ids: string[]): void {
  try {
    localStorage.setItem(HISTORY_IDS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

function getCachedRecordsFromLocalStorage(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_CACHE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is HistoryRecord =>
            Boolean(item && typeof item.id === "string" && item.itinerary)
        )
      : [];
  } catch {
    return [];
  }
}

function saveCachedRecordsToLocalStorage(records: HistoryRecord[]): void {
  try {
    localStorage.setItem(
      HISTORY_CACHE_STORAGE_KEY,
      JSON.stringify(records.slice(0, 25))
    );
  } catch {
    // ignore storage errors
  }
}

function getActiveIdFromLocalStorage(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveActiveIdToLocalStorage(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_ID_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_ID_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

function renderTransitIcon(iconName: string) {
  switch (iconName) {
    case "directions_walk":
      return <Footprints className="w-3.5 h-3.5 text-tertiary shrink-0" />;
    case "local_taxi":
    case "directions_car":
      return <Car className="w-3.5 h-3.5 text-secondary shrink-0" />;
    case "subway":
    default:
      return <Train className="w-3.5 h-3.5 text-primary shrink-0" />;
  }
}

function renderCategoryIcon(
  category: ActivityCategory,
  badgeTone: string | undefined
) {
  if (badgeTone === "sunset") {
    return <Sun className="w-3 h-3 shrink-0" />;
  }
  switch (category) {
    case "food":
      return <Utensils className="w-3 h-3 shrink-0" />;
    case "sightseeing":
      return <Landmark className="w-3 h-3 shrink-0" />;
    case "stay":
      return <BedDouble className="w-3 h-3 shrink-0" />;
    case "activity":
    default:
      return <Ticket className="w-3 h-3 shrink-0" />;
  }
}

export default function SocialTripWorkspace() {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [focusedStop, setFocusedStop] = useState<FocusedStop | null>(null);
  const [activeStopIdx, setActiveStopIdx] = useState<number | null>(null);

  // History state loaded from localStorage + DB
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [historyDropdownOpen, setHistoryDropdownOpen] =
    useState<boolean>(false);

  // Input State
  const [urlInput, setUrlInput] = useState("");
  const [rawCaption, setRawCaption] = useState("");
  const [showManualCaption, setShowManualCaption] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(12);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mobile View Toggle ("timeline" | "map")
  const [mobileView, setMobileView] = useState<"timeline" | "map">("timeline");

  // Animate progress bar & steps during AI generation
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      setLoadingProgress(12);
      return;
    }

    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 92) return prev;
        const increment = prev < 45 ? 6 : prev < 75 ? 3.5 : 1.5;
        return Math.min(92, Math.round((prev + increment) * 10) / 10);
      });
    }, 450);

    const stepTimer = setInterval(() => {
      setLoadingStep((prev) =>
        prev < AI_LOADING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 2400);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [isGenerating]);

  const applyItinerary = useCallback(
    (newTrip: ItineraryData, recordId?: string, preferredDay?: number) => {
      setItinerary(newTrip);
      const finalId = recordId || newTrip.id || null;
      setActiveRecordId(finalId);
      saveActiveIdToLocalStorage(finalId);

      const targetDay =
        preferredDay && newTrip.days.some((d) => d.day === preferredDay)
          ? preferredDay
          : newTrip.days[0]?.day || 1;
      setActiveDay(targetDay);
      setActiveStopIdx(null);
      setFocusedStop(null);
      setHistoryDropdownOpen(false);
      setMobileView("timeline");

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (finalId) {
          url.searchParams.set("id", finalId);
        } else {
          url.searchParams.delete("id");
        }
        window.history.replaceState(null, "", url.toString());
      }
    },
    []
  );

  // Load history & active itinerary from localStorage first, then sync with DB
  const hydrateAndSyncHistory = useCallback(async () => {
    const cachedRecords = getCachedRecordsFromLocalStorage();
    const savedIds = getSavedIdsFromLocalStorage();

    const mergedIds = Array.from(
      new Set([...savedIds, ...cachedRecords.map((r) => r.id)])
    ).slice(0, 25);

    if (mergedIds.length !== savedIds.length) {
      saveIdsToLocalStorage(mergedIds);
    }

    if (cachedRecords.length > 0) {
      setHistoryRecords(cachedRecords);
    }

    if (mergedIds.length === 0) {
      setHistoryRecords([]);
      setIsLoadingHistory(false);
      return cachedRecords;
    }

    try {
      const res = await fetch(
        `/api/itineraries?ids=${encodeURIComponent(mergedIds.join(","))}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.records) && data.records.length > 0) {
          const recordMap = new Map<string, HistoryRecord>();
          for (const rec of cachedRecords) {
            recordMap.set(rec.id, rec);
          }
          for (const rec of data.records as HistoryRecord[]) {
            recordMap.set(rec.id, rec);
          }
          const combined = mergedIds
            .map((id) => recordMap.get(id))
            .filter((r): r is HistoryRecord => Boolean(r));

          setHistoryRecords(combined);
          saveCachedRecordsToLocalStorage(combined);
          saveIdsToLocalStorage(combined.map((r) => r.id));
          setIsLoadingHistory(false);
          return combined;
        }
      }
    } catch {
      // ignore network error and keep localStorage records
    } finally {
      setIsLoadingHistory(false);
    }

    return cachedRecords;
  }, []);

  // Initial load: restore active itinerary & history from URL ?id= or localStorage
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const localCache = getCachedRecordsFromLocalStorage();
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const targetId = params?.get("id") || getActiveIdFromLocalStorage();

      if (targetId) {
        const cachedMatch = localCache.find((r) => r.id === targetId);
        if (cachedMatch && isMounted) {
          applyItinerary(cachedMatch.itinerary, cachedMatch.id, 1);
        } else {
          try {
            const res = await fetch(
              `/api/itineraries?id=${encodeURIComponent(targetId)}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data?.record?.itinerary && isMounted) {
                const fetchedRec: HistoryRecord = data.record;
                const updatedCache = [
                  fetchedRec,
                  ...localCache.filter((r) => r.id !== fetchedRec.id),
                ].slice(0, 25);
                saveCachedRecordsToLocalStorage(updatedCache);
                saveIdsToLocalStorage(updatedCache.map((r) => r.id));
                applyItinerary(fetchedRec.itinerary, fetchedRec.id, 1);
              }
            }
          } catch {
            // ignore
          }
        }
      }

      await hydrateAndSyncHistory();
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [hydrateAndSyncHistory, applyItinerary]);

  // Add a newly saved DB record ID + data to localStorage & history state
  const registerSavedRecord = useCallback(
    (record: HistoryRecord, preferredDay?: number) => {
      const currentIds = getSavedIdsFromLocalStorage();
      const updatedIds = [
        record.id,
        ...currentIds.filter((existingId) => existingId !== record.id),
      ].slice(0, 25);
      saveIdsToLocalStorage(updatedIds);

      const currentCache = getCachedRecordsFromLocalStorage();
      const updatedCache = [
        record,
        ...currentCache.filter((r) => r.id !== record.id),
      ].slice(0, 25);
      saveCachedRecordsToLocalStorage(updatedCache);

      setHistoryRecords(updatedCache);
      applyItinerary(record.itinerary, record.id, preferredDay);
    },
    [applyItinerary]
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() && !rawCaption.trim()) {
      setErrorMsg(
        "Tempel link TikTok, Instagram, atau YouTube terlebih dahulu."
      );
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlInput.trim(),
          rawCaption: rawCaption.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mengekstrak link.");
      }

      setLoadingProgress(100);
      registerSavedRecord(
        {
          id: data.id,
          createdAt: data.createdAt || new Date().toISOString(),
          itinerary: data.itinerary,
        },
        1
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server AI.";
      setErrorMsg(msg);
      if (msg.toLowerCase().includes("caption manual")) {
        setShowManualCaption(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId }),
      });
      const data = await res.json();
      if (res.ok && data.itinerary) {
        setLoadingProgress(100);
        registerSavedRecord(
          {
            id: data.id,
            createdAt: data.createdAt || new Date().toISOString(),
            itinerary: data.itinerary,
          },
          presetId === "tokyo-48h" ? 2 : 1
        );
      }
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteHistoryItem = async (
    idToDelete: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const updatedIds = getSavedIdsFromLocalStorage().filter(
      (id) => id !== idToDelete
    );
    saveIdsToLocalStorage(updatedIds);

    const updatedCache = getCachedRecordsFromLocalStorage().filter(
      (r) => r.id !== idToDelete
    );
    saveCachedRecordsToLocalStorage(updatedCache);

    setHistoryRecords((prev) => prev.filter((r) => r.id !== idToDelete));

    if (activeRecordId === idToDelete) {
      handleResetEmpty();
    }

    try {
      await fetch(`/api/itineraries?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
      });
    } catch {
      // ignore
    }
  };

  const handleResetEmpty = () => {
    setItinerary(null);
    setActiveRecordId(null);
    saveActiveIdToLocalStorage(null);
    setUrlInput("");
    setRawCaption("");
    setErrorMsg(null);
    setActiveStopIdx(null);
    setFocusedStop(null);
    setHistoryDropdownOpen(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleFocusStop = (dayNum: number, idx: number) => {
    setActiveStopIdx(idx);
    setFocusedStop({
      day: dayNum,
      activityIndex: idx,
      timestamp: Date.now(),
    });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileView("map");
    }
  };

  const handleOpenGoogleMapsRoute = () => {
    if (!itinerary) return;
    const currentDayObj =
      itinerary.days.find((d) => d.day === activeDay) || itinerary.days[0];
    const stops = currentDayObj ? currentDayObj.activities : [];
    if (stops.length === 0) return;

    const coord = (a: ActivityItem) => `${a.location.lat},${a.location.lng}`;
    if (stops.length === 1) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${coord(stops[0])}`,
        "_blank"
      );
      return;
    }

    const origin = coord(stops[0]);
    const destination = coord(stops[stops.length - 1]);
    const waypoints = stops.slice(1, -1).map(coord).join("|");

    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}${
        waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""
      }&travelmode=transit`,
      "_blank"
    );
  };

  // ==================== HYBRID AI LOADING STATE (PROGRESS BAR + SKELETON WORKSPACE) ====================
  if (isGenerating) {
    const activeStepInfo =
      AI_LOADING_STEPS[loadingStep] || AI_LOADING_STEPS[0];

    return (
      <div className="min-h-dvh lg:h-dvh lg:overflow-hidden flex flex-col bg-[#f8fafc] text-on-surface">
        {/* Clean Header */}
        <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <Navigation className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-primary uppercase whitespace-nowrap">
              Cool Wanderer
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 truncate">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
              <span className="truncate">Menyusun Itinerary AI...</span>
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary-fixed/60 text-primary text-xs font-bold shrink-0">
            {Math.round(loadingProgress)}%
          </div>
        </header>

        {/* Split-View Hybrid Loading: Progress Stepper + Skeleton Timeline & Map */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden">
          {/* Left Column: Active Progress Card + Skeleton Feed */}
          <div className="w-full lg:w-[460px] xl:w-[500px] lg:h-full bg-white border-r border-slate-200/80 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-5 gap-5">
            {/* Multi-Step AI Progress Card */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-[#f0fdfa] via-white to-[#f8fafc] p-4 sm:p-5 shadow-sm flex flex-col gap-4 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                      Tahap {loadingStep + 1} dari {AI_LOADING_STEPS.length}
                    </span>
                    <h2 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {activeStepInfo.title}
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-primary bg-primary-fixed/60 px-2.5 py-1 rounded-lg shrink-0">
                  {Math.round(loadingProgress)}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-teal-500 to-secondary-container transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeStepInfo.desc}
              </p>

              {/* Step Checklist */}
              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-200/60">
                {AI_LOADING_STEPS.map((step, idx) => {
                  const isDone = idx < loadingStep;
                  const isCurrent = idx === loadingStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-xs transition-opacity ${
                        isDone
                          ? "text-primary font-semibold"
                          : isCurrent
                          ? "text-slate-900 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skeleton Shimmer Day Tabs */}
            <div className="flex items-center gap-2 overflow-hidden shrink-0">
              <div className="h-8 w-28 rounded-full bg-slate-200/80 animate-pulse shrink-0" />
              <div className="h-8 w-24 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="h-8 w-24 rounded-full bg-slate-100 animate-pulse shrink-0" />
            </div>

            {/* Skeleton Shimmer Day Summary Capsule */}
            <div className="rounded-2xl bg-slate-100/80 p-4 flex flex-col gap-2.5 animate-pulse shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-48 rounded bg-slate-200" />
                <div className="h-5 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-200" />
              </div>
            </div>

            {/* Skeleton Shimmer Timeline Cards */}
            <div className="relative flex flex-col pl-1 gap-4 shrink-0">
              <div className="absolute top-5 bottom-8 left-[19px] w-[2px] bg-slate-200 -translate-x-1/2 z-0" />
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="relative z-10 flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 animate-pulse">
                    {num}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col gap-3 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-3 w-20 rounded bg-slate-200" />
                          <div className="h-4 w-16 rounded-full bg-slate-200" />
                        </div>
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="h-3 w-full rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-3 w-40 rounded bg-slate-100" />
                      <div className="h-6 w-16 rounded-lg bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Map Skeleton Preview (Desktop) */}
          <div className="hidden lg:flex flex-1 h-full bg-slate-100 relative items-center justify-center overflow-hidden">
            {/* Subtle Map Grid Pattern */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(#94a3b8 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10 bg-white/90 backdrop-blur-md px-6 py-5 rounded-3xl shadow-md border border-slate-200/80 flex flex-col items-center gap-3 max-w-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center">
                <Compass className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Menyiapkan Peta Rute Interaktif...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Menghubungkan titik koordinat destinasi dan mengurutkan jalur
                perjalanan terpendek di OpenStreetMap.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== EMPTY INITIAL STATE (START SCREEN + HISTORY) ====================
  if (!itinerary) {
    return (
      <div className="min-h-dvh flex flex-col bg-[#f8fafc] text-on-surface">
        {/* Simple Header */}
        <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-primary uppercase whitespace-nowrap">
              Cool Wanderer
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 truncate">
            AI Social Media Itinerary Generator
          </span>
        </header>

        {/* Centered Empty State Input Card + History List */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 gap-6">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.05)] p-5 sm:p-8 flex flex-col gap-5">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Mulai Buat Rute Perjalanan
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
                Tempel link video TikTok, Instagram Reels, atau YouTube Shorts
                untuk diekstrak menjadi jadwal harian &amp; peta rute otomatis.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:bg-white focus-within:border-primary transition-all min-w-0">
                  <Link2 className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Tempel link TikTok, Instagram, atau YouTube..."
                    className="w-full text-sm bg-transparent text-on-surface placeholder:text-slate-400 focus:outline-none min-w-0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-container text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 transition-all shrink-0"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Generate</span>
                </button>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowManualCaption((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {showManualCaption
                      ? "Tutup input caption manual"
                      : "Tempel transkrip / caption manual"}
                  </span>
                  {showManualCaption ? (
                    <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>
              </div>

              {showManualCaption && (
                <textarea
                  rows={3}
                  value={rawCaption}
                  onChange={(e) => setRawCaption(e.target.value)}
                  placeholder="Contoh: Hari 1 di Jogja sarapan Kopi Klotok Kaliurang, lanjut Taman Sari, sore ke Tempo Gelato dan malam di Malioboro..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-on-surface focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                />
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-error font-medium leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>

            {/* Quick Presets to Test */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5">
              <span className="text-xs text-slate-400 font-medium text-center">
                Belum punya link? Coba simulasi dengan preset contoh:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {PRESET_SUMMARIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleSelectPreset(p.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ==================== SAVED HISTORY SECTION (FROM DB + LOCALSTORAGE) ==================== */}
          {!isLoadingHistory && historyRecords.length > 0 && (
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-4 sm:p-6 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary shrink-0" />
                  <h2 className="font-bold text-sm text-on-surface">
                    Riwayat Itinerary Anda ({historyRecords.length})
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">
                  Tersimpan di LocalStorage &amp; DB
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {historyRecords.map((rec) => {
                  const totalPlaces = rec.itinerary.days.reduce(
                    (acc, d) => acc + d.activities.length,
                    0
                  );
                  const dateFormatted = new Date(
                    rec.createdAt
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={rec.id}
                      onClick={() => applyItinerary(rec.itinerary, rec.id, 1)}
                      className="group p-3 rounded-2xl border border-slate-200/80 hover:border-primary hover:bg-slate-50/70 flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {rec.itinerary.durationDays}H
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
                              {rec.itinerary.tripTitle}
                            </span>
                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono shrink-0">
                              #{rec.id.slice(-6)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="inline-flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                              <MapPin className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">
                                {rec.itinerary.destination}
                              </span>
                            </span>
                            <span>•</span>
                            <span className="whitespace-nowrap">
                              {totalPlaces} Tempat
                            </span>
                            <span>•</span>
                            <span className="whitespace-nowrap">
                              {dateFormatted}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryItem(rec.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-red-50 transition-colors"
                          title="Hapus dari riwayat & database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==================== GENERATED ITINERARY VIEW ====================
  const currentDayPlan =
    itinerary.days.find((d) => d.day === activeDay) || itinerary.days[0];

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden flex flex-col bg-[#f8fafc] text-on-surface">
      {/* ==================== SIMPLE CLEAN HEADER ==================== */}
      <header className="relative h-14 px-3 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0 z-40">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleResetEmpty}
            className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
            title="Kembali ke halaman awal"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span
              onClick={handleResetEmpty}
              className="hidden sm:inline font-bold text-sm tracking-tight text-primary uppercase cursor-pointer whitespace-nowrap"
            >
              Cool Wanderer
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-secondary-container shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
                {itinerary.destination}
              </span>
              {activeRecordId && (
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono shrink-0">
                  #{activeRecordId.slice(-6)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* History Dropdown, New Link & Google Maps Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {historyRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryDropdownOpen((prev) => !prev)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                Riwayat ({historyRecords.length})
              </span>
              <span className="sm:hidden">{historyRecords.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetEmpty}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Link Baru</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleMapsRoute}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0 whitespace-nowrap"
            title="Buka Rute di Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Buka Rute Maps</span>
            <span className="sm:hidden">Maps</span>
          </button>
        </div>

        {/* Floating History Switcher Dropdown */}
        {historyDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setHistoryDropdownOpen(false)}
            />
            <div className="fixed sm:absolute top-16 sm:top-14 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-on-surface">
                  Riwayat Itinerary ({historyRecords.length})
                </span>
                <button
                  type="button"
                  onClick={() => setHistoryDropdownOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {historyRecords.map((rec) => {
                  const isCurrent = rec.id === activeRecordId;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => applyItinerary(rec.itinerary, rec.id, 1)}
                      className={`p-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-primary-fixed/40 border border-primary/30"
                          : "hover:bg-slate-100 border border-transparent"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-on-surface truncate">
                          {rec.itinerary.tripTitle}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {rec.itinerary.destination} • #{rec.id.slice(-6)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(rec.id, e)}
                        className="p-1.5 text-slate-400 hover:text-error rounded-lg shrink-0"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </header>

      {/* ==================== MAIN SPLIT VIEW ==================== */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden relative">
        {/* LEFT COLUMN: TRACKING TIMELINE WITH CONNECTING VERTICAL LINE */}
        <div
          className={`w-full lg:w-[460px] xl:w-[500px] lg:h-full bg-white border-r border-slate-200/80 flex flex-col min-h-0 shrink-0 ${
            mobileView === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* AI Source Analysis Summary Header (Fixed at top of panel, never shrinks) */}
          <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 bg-slate-50/60 flex flex-col gap-1.5 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-fixed/70 text-primary text-[10px] font-bold uppercase tracking-wide shrink-0">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{itinerary.sourcePlatform || "AI Video"}</span>
                </span>
                {itinerary.sourceAuthor && (
                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[160px]">
                    {itinerary.sourceAuthor}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-primary shrink-0">
                {itinerary.days.reduce(
                  (sum, d) => sum + d.activities.length,
                  0
                )}{" "}
                Rekomendasi • {itinerary.days.length} Hari
              </span>
            </div>
            <h2 className="font-bold text-sm text-on-surface leading-snug break-words">
              {itinerary.tripTitle}
            </h2>
            {itinerary.summary && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {itinerary.summary}
              </p>
            )}
          </div>

          {/* Day Selector Pills (shrink-0 prevents Flexbox from crushing height) */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {itinerary.days.map((dayObj) => {
              const isSelected = currentDayPlan?.day === dayObj.day;
              const dateText =
                dayObj.dateLabel || `${dayObj.activities.length} Spot`;
              return (
                <button
                  key={dayObj.day}
                  type="button"
                  onClick={() => setActiveDay(dayObj.day)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm font-bold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isSelected
                      ? `Hari ${dayObj.day} (Aktif)`
                      : `Hari ${dayObj.day} • ${dateText}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Day Context Header + Vertical Line Activity Tracker */}
          <div className="flex-1 min-h-0 lg:overflow-y-auto">
            {currentDayPlan && (
              <div className="p-4 pb-28 lg:pb-8 flex flex-col gap-5">
                {/* Compact Day Summary Capsule */}
                <div className="bg-surface-container-low rounded-2xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="font-bold text-sm sm:text-base text-on-surface leading-snug break-words">
                      {currentDayPlan.title}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-[11px] font-bold text-primary shrink-0">
                      <Route className="w-3 h-3 shrink-0" />
                      <span>
                        {currentDayPlan.efficiencyLabel || "Rute Searah"}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {currentDayPlan.fullDateLabel ||
                          `Hari ke-${currentDayPlan.day}`}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{currentDayPlan.activities.length} Tempat</span>
                    </span>
                    {(currentDayPlan.dayBudgetLabel ||
                      itinerary.estimatedBudget) && (
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span>
                          {currentDayPlan.dayBudgetLabel ||
                            itinerary.estimatedBudget}
                        </span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-secondary-container font-medium">
                      <Sun className="w-3.5 h-3.5 shrink-0" />
                      <span>{currentDayPlan.weatherLabel || "Cerah"}</span>
                    </span>
                  </div>
                </div>

                {/* VERTICAL LINE ACTIVITY TRACKING FEED */}
                <div className="relative flex flex-col pl-1">
                  {/* Continuous Vertical Line Connecting All Stops */}
                  {currentDayPlan.activities.length > 1 && (
                    <div className="absolute top-5 bottom-8 left-[19px] w-[2px] bg-slate-200 -translate-x-1/2 z-0" />
                  )}

                  {currentDayPlan.activities.map((act, idx) => {
                    const isLast = idx === currentDayPlan.activities.length - 1;
                    const isOrange =
                      act.isHighlightOrange ||
                      (idx === currentDayPlan.activities.length - 1 &&
                        currentDayPlan.activities.length >= 4);

                    const imgSrc =
                      act.imageUrl ||
                      DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length];

                    const badgeLabel =
                      act.badgeLabel ||
                      act.estimatedCost ||
                      (act.category === "food"
                        ? "Kuliner"
                        : act.category === "sightseeing"
                        ? "Wisata"
                        : "Aktivitas");

                    const badgeTone =
                      act.badgeTone ||
                      (act.category === "food"
                        ? "orange"
                        : isOrange
                        ? "sunset"
                        : "neutral");

                    const transit =
                      act.transitToNext ||
                      (!isLast
                        ? DEFAULT_TRANSITS[idx % DEFAULT_TRANSITS.length]
                        : undefined);

                    const isCardSelected = activeStopIdx === idx;

                    return (
                      <React.Fragment key={`${currentDayPlan.day}-${idx}`}>
                        {/* ACTIVITY STOP ROW */}
                        <div
                          onClick={() =>
                            handleFocusStop(currentDayPlan.day, idx)
                          }
                          className={`relative z-10 flex items-start gap-3 sm:gap-3.5 cursor-pointer ${
                            isLast ? "" : "pb-3.5"
                          }`}
                        >
                          {/* Numbered Node on the Vertical Line */}
                          <div
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm font-bold text-xs transition-transform ${
                              isOrange
                                ? "bg-secondary-container text-white"
                                : "bg-primary text-white"
                            }`}
                          >
                            {idx + 1}
                          </div>

                          {/* Clean Activity Card */}
                          <div
                            className={`flex-1 min-w-0 bg-white rounded-2xl border p-3 sm:p-3.5 flex flex-col gap-2.5 transition-all ${
                              isCardSelected
                                ? "border-primary ring-2 ring-primary/15 shadow-md"
                                : "border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Square Thumbnail */}
                              <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                <img
                                  alt={act.placeName}
                                  className="w-full h-full object-cover"
                                  src={imgSrc}
                                />
                              </div>

                              {/* Main Details */}
                              <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap ${
                                      isOrange
                                        ? "text-secondary-container"
                                        : "text-primary"
                                    }`}
                                  >
                                    <Clock className="w-3 h-3 shrink-0" />
                                    <span>{act.time}</span>
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold max-w-full truncate ${
                                      badgeTone === "sunset" ||
                                      badgeTone === "orange"
                                        ? "bg-secondary-fixed text-on-secondary-fixed"
                                        : "bg-surface-container-high text-on-surface-variant"
                                    }`}
                                  >
                                    {renderCategoryIcon(
                                      act.category,
                                      badgeTone
                                    )}
                                    <span className="truncate">
                                      {badgeLabel}
                                    </span>
                                  </span>
                                </div>

                                <h3 className="font-bold text-sm text-on-surface leading-snug line-clamp-2 break-words">
                                  {act.placeName}
                                </h3>
                                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed break-words">
                                  {act.description}
                                </p>
                              </div>
                            </div>

                            {/* Simple Clean Footer Line */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                              <div className="text-slate-500 flex items-start gap-1.5 min-w-0 flex-1">
                                <Lightbulb className="w-3.5 h-3.5 text-secondary-container shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-snug break-words">
                                  {act.footerText || act.tips}
                                </span>
                              </div>

                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-semibold text-[11px] shrink-0 transition-colors">
                                <Navigation className="w-3 h-3 shrink-0" />
                                <span>Petunjuk</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* TRANSIT CONNECTOR PILL ON THE VERTICAL LINE */}
                        {!isLast && transit && (
                          <div className="relative z-10 flex items-center gap-3 sm:gap-3.5 py-0.5 pb-3.5">
                            <div className="shrink-0 w-8 flex justify-center">
                              <div className="w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white" />
                            </div>
                            <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-slate-200/70 text-[11px] font-medium text-on-surface-variant min-w-0 max-w-full">
                              {renderTransitIcon(transit.icon)}
                              <span className="truncate">{transit.mode}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate">
                                {transit.duration}
                              </span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CLEAN INTERACTIVE MAP */}
        <div
          className={`w-full lg:flex-1 h-[calc(100dvh-3.5rem)] lg:h-full min-h-0 ${
            mobileView === "timeline" ? "hidden lg:block" : "block"
          }`}
        >
          <DynamicLeafletMap
            itinerary={itinerary}
            selectedDay={activeDay}
            focusedStop={focusedStop}
            onSelectActivity={(_day, actIdx) => {
              setActiveStopIdx(actIdx);
            }}
          />
        </div>
      </div>

      {/* MOBILE FLOATING SWITCHER (Rute | Peta) */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md text-white p-1 rounded-full shadow-xl border border-white/10 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMobileView("timeline")}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            mobileView === "timeline"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5 shrink-0" />
          <span>Rute</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("map")}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            mobileView === "map"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5 shrink-0" />
          <span>Peta</span>
        </button>
      </div>
    </div>
  );
}
