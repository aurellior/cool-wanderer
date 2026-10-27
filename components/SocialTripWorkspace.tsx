"use client";

import React, { useState, useEffect, useCallback } from "react";
import DynamicLeafletMap from "./map/DynamicMap";
import { FocusedStop } from "./map/LeafletMap";
import { ActivityItem, ItineraryData } from "@/lib/schema";
import { PRESET_SUMMARIES } from "@/lib/presets";

const HISTORY_IDS_STORAGE_KEY = "cool_wanderer_history_ids";

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
  icon: "subway" | "directions_walk" | "local_taxi";
  mode: string;
  duration: string;
}[] = [
  { icon: "subway", mode: "Subway Ginza Line", duration: "18 mnt (4.2 km)" },
  { icon: "directions_walk", mode: "Jalan Kaki", duration: "8 mnt (650m)" },
  {
    icon: "local_taxi",
    mode: "Taxi",
    duration: "12 mnt (Rekomendasi Hemat Waktu)",
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

export default function SocialTripWorkspace() {
  // Start EMPTY on initial page load unless ?id= is in URL
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [focusedStop, setFocusedStop] = useState<FocusedStop | null>(null);
  const [activeStopIdx, setActiveStopIdx] = useState<number | null>(null);

  // History state loaded from DB using IDs stored in localStorage
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [historyDropdownOpen, setHistoryDropdownOpen] =
    useState<boolean>(false);

  // Input State
  const [urlInput, setUrlInput] = useState("");
  const [rawCaption, setRawCaption] = useState("");
  const [showManualCaption, setShowManualCaption] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mobile View Toggle ("timeline" | "map")
  const [mobileView, setMobileView] = useState<"timeline" | "map">("timeline");

  const applyItinerary = useCallback(
    (newTrip: ItineraryData, recordId?: string, preferredDay?: number) => {
      setItinerary(newTrip);
      const finalId = recordId || newTrip.id || null;
      setActiveRecordId(finalId);
      const targetDay =
        preferredDay && newTrip.days.some((d) => d.day === preferredDay)
          ? preferredDay
          : newTrip.days[0]?.day || 1;
      setActiveDay(targetDay);
      setActiveStopIdx(null);
      setFocusedStop(null);
      setHistoryDropdownOpen(false);

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

  // Fetch history records from DB based on IDs stored in localStorage
  const fetchHistoryFromDb = useCallback(async () => {
    const savedIds = getSavedIdsFromLocalStorage();
    if (savedIds.length === 0) {
      setHistoryRecords([]);
      setIsLoadingHistory(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/itineraries?ids=${encodeURIComponent(savedIds.join(","))}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.records)) {
          setHistoryRecords(data.records);
          // Sync localStorage IDs with valid DB records
          const validIds = data.records.map((r: HistoryRecord) => r.id);
          saveIdsToLocalStorage(validIds);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Initial load: fetch history list & check if ?id= is in URL
  useEffect(() => {
    fetchHistoryFromDb();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id");
      if (urlId) {
        fetch(`/api/itineraries?id=${encodeURIComponent(urlId)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.record?.itinerary) {
              applyItinerary(data.record.itinerary, data.record.id, 1);
            }
          })
          .catch(() => {});
      }
    }
  }, [fetchHistoryFromDb, applyItinerary]);

  // Add a newly saved DB record ID to localStorage & history state
  const registerSavedRecord = useCallback(
    (record: HistoryRecord, preferredDay?: number) => {
      const currentIds = getSavedIdsFromLocalStorage();
      const updatedIds = [
        record.id,
        ...currentIds.filter((existingId) => existingId !== record.id),
      ].slice(0, 25);
      saveIdsToLocalStorage(updatedIds);

      setHistoryRecords((prev) => [
        record,
        ...prev.filter((r) => r.id !== record.id),
      ]);

      applyItinerary(record.itinerary, record.id, preferredDay);
    },
    [applyItinerary]
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() && !rawCaption.trim()) {
      setErrorMsg("Tempel link TikTok, Instagram, atau YouTube terlebih dahulu.");
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

  // ==================== EMPTY INITIAL STATE (START SCREEN + HISTORY) ====================
  if (!itinerary) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-on-surface">
        {/* Simple Header */}
        <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]">
                near_me
              </span>
            </div>
            <span className="font-bold text-sm tracking-tight text-primary uppercase">
              Cool Wanderer
            </span>
          </div>
          <span className="text-xs text-slate-400">
            AI Social Media Itinerary Generator
          </span>
        </header>

        {/* Centered Empty State Input Card + History List */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 py-8 gap-6">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.05)] p-6 sm:p-8 flex flex-col gap-5">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[26px]">
                  auto_awesome
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Mulai Buat Rute Perjalanan
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
                Tempel link video TikTok, Instagram Reels, atau YouTube Shorts
                untuk diekstrak menjadi jadwal harian &amp; peta rute otomatis.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:bg-white focus-within:border-primary transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    link
                  </span>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste TikTok, Instagram, or YouTube link..."
                    className="w-full text-sm bg-transparent text-on-surface placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-container text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isGenerating ? "sync" : "auto_awesome"}
                  </span>
                  <span>{isGenerating ? "Menganalisis..." : "Generate"}</span>
                </button>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowManualCaption((prev) => !prev)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {showManualCaption
                    ? "Tutup input caption manual"
                    : "+ Tempel transkrip / caption manual"}
                </button>
              </div>

              {showManualCaption && (
                <textarea
                  rows={3}
                  value={rawCaption}
                  onChange={(e) => setRawCaption(e.target.value)}
                  placeholder="Contoh: Hari 1 di Jogja sarapan Kopi Klotok Kaliurang, lanjut Taman Sari, sore ke Tempo Gelato dan malam di Malioboro..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-on-surface focus:bg-white focus:outline-none focus:border-primary"
                />
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-error font-medium">
                  {errorMsg}
                </div>
              )}
            </form>

            {/* Quick Presets to Test */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5">
              <span className="text-xs text-slate-400 font-medium">
                Belum punya link? Coba simulasi dengan preset contoh:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {PRESET_SUMMARIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleSelectPreset(p.id)}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ==================== SAVED HISTORY SECTION (FROM DB + LOCALSTORAGE IDS) ==================== */}
          {!isLoadingHistory && historyRecords.length > 0 && (
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-5 sm:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[19px]">
                    history
                  </span>
                  <h2 className="font-bold text-sm text-on-surface">
                    Riwayat Itinerary Anda ({historyRecords.length})
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">
                  Tersimpan di Database • ID di LocalStorage
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
                      onClick={() =>
                        applyItinerary(rec.itinerary, rec.id, 1)
                      }
                      className="group p-3 rounded-2xl border border-slate-200/80 hover:border-primary hover:bg-slate-50/70 flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {rec.itinerary.durationDays}H
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
                              {rec.itinerary.tripTitle}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono flex-shrink-0">
                              #{rec.id.slice(-6)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{rec.itinerary.destination}</span>
                            <span>•</span>
                            <span>{totalPlaces} Tempat</span>
                            <span>•</span>
                            <span>{dateFormatted}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryItem(rec.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-red-50 transition-colors"
                          title="Hapus dari riwayat & database"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            delete
                          </span>
                        </button>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[18px]">
                          chevron_right
                        </span>
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[#f8fafc] text-on-surface">
      {/* ==================== SIMPLE CLEAN HEADER ==================== */}
      <header className="relative h-14 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 flex-shrink-0 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            onClick={handleResetEmpty}
            className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm cursor-pointer"
            title="Kembali ke halaman awal"
          >
            <span className="material-symbols-outlined text-[18px]">
              near_me
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span
              onClick={handleResetEmpty}
              className="font-bold text-sm tracking-tight text-primary uppercase cursor-pointer"
            >
              Cool Wanderer
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-secondary-container flex-shrink-0"></span>
              <span className="font-bold text-sm text-on-surface truncate">
                {itinerary.destination}
              </span>
              {activeRecordId && (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                  #{activeRecordId.slice(-6)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* History Dropdown, New Link & Google Maps Button */}
        <div className="flex items-center gap-2">
          {historyRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryDropdownOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">
                history
              </span>
              <span className="hidden sm:inline">
                Riwayat ({historyRecords.length})
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetEmpty}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Link Baru</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleMapsRoute}
            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">
              navigation
            </span>
            <span className="hidden sm:inline">Buka Rute Maps</span>
          </button>
        </div>

        {/* Floating History Switcher Dropdown */}
        {historyDropdownOpen && (
          <div className="absolute top-14 right-4 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-on-surface">
                Riwayat Itinerary (Database)
              </span>
              <button
                type="button"
                onClick={() => setHistoryDropdownOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
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
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-on-surface truncate">
                        {rec.itinerary.tripTitle}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {rec.itinerary.destination} • #{rec.id.slice(-6)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(rec.id, e)}
                      className="p-1 text-slate-400 hover:text-error rounded"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        delete
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ==================== MAIN SPLIT VIEW ==================== */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* LEFT COLUMN: TRACKING TIMELINE WITH CONNECTING VERTICAL LINE */}
        <div
          className={`w-full lg:w-[460px] xl:w-[490px] lg:h-full lg:overflow-y-auto bg-white border-r border-slate-200/80 flex flex-col ${
            mobileView === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Day Selector Pills */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {itinerary.days.map((dayObj) => {
              const isSelected = currentDayPlan?.day === dayObj.day;
              const dateText = dayObj.dateLabel || `${dayObj.activities.length} Spot`;
              return (
                <button
                  key={dayObj.day}
                  type="button"
                  onClick={() => setActiveDay(dayObj.day)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm font-bold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {isSelected
                    ? `Hari ${dayObj.day} (Aktif)`
                    : `Hari ${dayObj.day} • ${dateText}`}
                </button>
              );
            })}
          </div>

          {/* Day Context Header + Vertical Line Activity Tracker */}
          {currentDayPlan && (
            <div className="p-4 pb-24 lg:pb-8 flex flex-col gap-5">
              {/* Compact Day Summary Capsule */}
              <div className="bg-surface-container-low rounded-2xl p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h1 className="font-bold text-base text-on-surface">
                    {currentDayPlan.title}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-[11px] font-bold text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[13px]">
                      routine
                    </span>
                    {currentDayPlan.efficiencyLabel || "Efisien 98%"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-on-surface-variant">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      calendar_today
                    </span>
                    {currentDayPlan.fullDateLabel ||
                      `Hari ke-${currentDayPlan.day}`}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      place
                    </span>
                    {currentDayPlan.activities.length} Tempat
                  </span>
                  {(currentDayPlan.dayBudgetLabel ||
                    itinerary.estimatedBudget) && (
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">
                        payments
                      </span>
                      {currentDayPlan.dayBudgetLabel ||
                        itinerary.estimatedBudget}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-secondary-container font-medium">
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      wb_sunny
                    </span>
                    {currentDayPlan.weatherLabel || "Cerah"}
                  </span>
                </div>
              </div>

              {/* VERTICAL LINE ACTIVITY TRACKING FEED */}
              <div className="relative flex flex-col pl-1">
                {/* Continuous Vertical Line Connecting All Stops */}
                <div className="absolute top-5 bottom-8 left-[19px] w-[2px] bg-slate-200 -translate-x-1/2 z-0"></div>

                {currentDayPlan.activities.map((act, idx) => {
                  const isLast = idx === currentDayPlan.activities.length - 1;
                  const isOrange =
                    act.isHighlightOrange ||
                    (idx === currentDayPlan.activities.length - 1 &&
                      currentDayPlan.activities.length >= 4);

                  const imgSrc =
                    act.imageUrl || DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length];

                  const badgeLabel =
                    act.badgeLabel ||
                    act.estimatedCost ||
                    (act.category === "food"
                      ? "Kuliner"
                      : act.category === "sightseeing"
                      ? "Budaya"
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
                        className={`relative z-10 flex items-start gap-3.5 cursor-pointer ${
                          isLast ? "" : "pb-3.5"
                        }`}
                      >
                        {/* Numbered Node on the Vertical Line */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm font-bold text-xs transition-transform ${
                            isOrange
                              ? "bg-secondary-container text-white"
                              : "bg-primary text-white"
                          }`}
                        >
                          {idx + 1}
                        </div>

                        {/* Clean Activity Card */}
                        <div
                          className={`flex-1 bg-white rounded-2xl border p-3.5 flex flex-col gap-2.5 transition-all ${
                            isCardSelected
                              ? "border-primary ring-2 ring-primary/15 shadow-md"
                              : "border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:border-slate-300"
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Square Thumbnail */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                              <img
                                alt={act.placeName}
                                className="w-full h-full object-cover"
                                src={imgSrc}
                              />
                            </div>

                            {/* Main Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span
                                  className={`text-xs font-bold ${
                                    isOrange
                                      ? "text-secondary-container"
                                      : "text-primary"
                                  }`}
                                >
                                  {act.time}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    badgeTone === "sunset" ||
                                    badgeTone === "orange"
                                      ? "bg-secondary-fixed text-on-secondary-fixed"
                                      : "bg-surface-container-high text-on-surface-variant"
                                  }`}
                                >
                                  {badgeTone === "sunset" && (
                                    <span className="material-symbols-outlined text-[12px]">
                                      sunny
                                    </span>
                                  )}
                                  {badgeLabel}
                                </span>
                              </div>

                              <h2 className="font-bold text-sm text-on-surface truncate">
                                {act.placeName}
                              </h2>
                              <p className="text-xs text-on-surface-variant truncate mt-0.5">
                                {act.description}
                              </p>
                            </div>
                          </div>

                          {/* Simple Clean Footer Line */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <span className="text-slate-500 truncate pr-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-secondary-container flex-shrink-0">
                                lightbulb
                              </span>
                              <span className="truncate">
                                {act.footerText || act.tips}
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-semibold text-[11px] flex-shrink-0 transition-colors">
                              <span className="material-symbols-outlined text-[13px]">
                                near_me
                              </span>
                              Petunjuk
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TRANSIT CONNECTOR PILL ON THE VERTICAL LINE */}
                      {!isLast && transit && (
                        <div className="relative z-10 flex items-center gap-3.5 py-0.5 pb-3.5">
                          <div className="flex-shrink-0 w-8 flex justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white"></div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-slate-200/70 text-[11px] font-medium text-on-surface-variant">
                            <span
                              className={`material-symbols-outlined text-[14px] ${
                                transit.icon === "local_taxi"
                                  ? "text-secondary"
                                  : transit.icon === "directions_walk"
                                  ? "text-tertiary"
                                  : "text-primary"
                              }`}
                            >
                              {transit.icon}
                            </span>
                            <span>{transit.mode}</span>
                            <span className="text-slate-300">•</span>
                            <span>{transit.duration}</span>
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

        {/* RIGHT COLUMN: CLEAN INTERACTIVE MAP */}
        <div
          className={`w-full lg:flex-1 h-[calc(100vh-3.5rem)] ${
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
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white p-1 rounded-full shadow-lg flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMobileView("timeline")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            mobileView === "timeline"
              ? "bg-primary text-white"
              : "text-slate-300"
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            format_list_numbered
          </span>
          <span>Rute</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("map")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            mobileView === "map" ? "bg-primary text-white" : "text-slate-300"
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">map</span>
          <span>Peta</span>
        </button>
      </div>
    </div>
  );
}
