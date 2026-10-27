"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import DynamicLeafletMap from "./map/DynamicMap";
import { FocusedStop } from "./map/LeafletMap";
import {
  ActivityCategory,
  ActivityItem,
  DayPlan,
  ItineraryData,
} from "@/lib/schema";
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
  GripVertical,
  Check,
  Globe,
  Building2,
  Wand2,
  ArrowUpDown,
  Edit3,
  Share2,
} from "lucide-react";

const HISTORY_IDS_STORAGE_KEY = "cool_wanderer_history_ids";
const HISTORY_CACHE_STORAGE_KEY = "cool_wanderer_history_cache";
const ACTIVE_ID_STORAGE_KEY = "cool_wanderer_active_id";

interface HistoryRecord {
  id: string;
  createdAt: string;
  itinerary: ItineraryData;
}

interface LinkSlotForm {
  id: string;
  url: string;
  caption: string;
  showCaption: boolean;
}

interface CityGroupForm {
  id: string;
  cityName: string;
  links: LinkSlotForm[];
}

const DEFAULT_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB07u6Ix2lcJXoieNOGUrkplOD51cAJ6_IfcqzAkgfTkxfJ8X_B95jUoBGt6Ujn7TdOHbtf-odaSxkIkLSfUXdiCp8QlXT2goRNVohTk7I6EK4peTv63K6Zf26WsEhIk_7DhjrbR8cSNKZVDJ_DrYIVYTObBiJ5B99iy1UdBgyhSMWGi6jACVzATfvYi-THJBu4E-MN2jAT2hxKGoh8nfC-CydrbbkURVR7HnGBrxd7BApFg6SwwjkZQQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuABOdK_qLtzEwiN0Qm0HMqDXFgfgDWnDfWg7kHFBvlPARVPduuRN8ocEIU7EsS80UCI3o2tFBpzqPGY_-4-QANbw9Vhx8Drd3DfF95cXG3JfW6ZjFv3seMTDyT1XBGsWUKM6V0icz4xmnmWZWDHcuMKY2GH9X3lkznVgAOhbV3YPdZfMheocfu1vh60CavV9JXPtYsU5sdaDWBHt13Wm-IS6TiO7b1mCBvMzronHNxwMqLdYGPnBNYabQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRdtgaiQ9dzgYDw-Uy8I2ZKgG0BHHJZjw1Zze67qIIam4DibA-jkgeJ5cTwxrZKFtJq0QDJBCLsq8-deD7txmiFy78c6e2UGZsWmggjwZwwmiUkCXnDgJ7MVBzrrz-xfVg-8hEPuHJzHQl8WMqH4tGBYWC-iFSMUYz7Dt1fL-QU3rN4Nz2ZCBSuWY18NM5QT8wak4S80caa12_ce3uK2IccjpaZbju9KWtW7G_QLW2bR4CjRk79Ch_HA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCoGBTJ9b7AfU0JCcJm5MHD30m9c9cOeelnT2jG2X6-AqibIM2ai62jqIpT4J5Yv4zq7Lg9KSoQMVTYmUQeRjeCWzVG-Yu27GHXlsWhOTxLeyCUOoagxn8jQLQeN_5GC7nSDV0g0TYkCkpWSYRa5T4w8CQf1DyXq5T1xOwwbt25-lRzG6e7OpFrbHsZuXqHzt_8HdqVmJAQrw-DVvMUTxa3NN8I41vStH9uka2UEy1zCJYdxqm6-BdQDg",
];

const QUICK_COUNTRIES = [
  "🇮🇩 Indonesia",
  "🇯🇵 Jepang",
  "🇰🇷 Korea Selatan",
  "🇸🇬 Singapura",
  "🇹🇭 Thailand",
  "🇲🇾 Malaysia",
];

const AI_LOADING_STEPS = [
  {
    title: "Mengekstrak multi-link video & metadata setiap kota",
    desc: "Mengambil caption, audio, serta frame visual dari seluruh tautan sosial media...",
  },
  {
    title: "Mendeteksi daftar tujuan & destinasi dengan Gemini AI",
    desc: "Mengidentifikasi tempat wisata, kuliner, dan aktivitas per kota sebagai item yang bisa dipilih...",
  },
  {
    title: "Memetakan koordinat GPS & estimasi biaya",
    desc: "Menyiapkan pin peta interaktif OpenStreetMap dan saran waktu opsional untuk setiap destinasi...",
  },
  {
    title: "Menyiapkan workspace penyusun hari & urutan rute",
    desc: "Menyajikan daftar destinasi agar siap Anda pilih (add), atur urutannya, dan sesuaikan jam...",
  },
];

function createEmptyLinkSlot(): LinkSlotForm {
  return {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url: "",
    caption: "",
    showCaption: false,
  };
}

function createEmptyCityGroup(defaultCityName = ""): CityGroupForm {
  return {
    id: `city-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    cityName: defaultCityName,
    links: [createEmptyLinkSlot()],
  };
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function recalculateDayTransits(activities: ActivityItem[]): ActivityItem[] {
  return activities.map((act, idx) => {
    if (idx === activities.length - 1) {
      return {
        ...act,
        transitToNext: undefined,
      };
    }
    const nextAct = activities[idx + 1];
    const distKm = haversineKm(
      act.location.lat,
      act.location.lng,
      nextAct.location.lat,
      nextAct.location.lng
    );

    if (distKm < 1.1) {
      const meters = Math.max(100, Math.round((distKm * 1000) / 50) * 50);
      const walkMins = Math.max(2, Math.round(distKm * 13));
      return {
        ...act,
        transitToNext: {
          icon: "directions_walk",
          mode: "Jalan Kaki",
          duration: `${walkMins} mnt (${meters}m)`,
        },
      };
    }

    if (distKm < 25) {
      const driveMins = Math.max(5, Math.round(distKm * 2.6 + 4));
      return {
        ...act,
        transitToNext: {
          icon: "directions_car",
          mode: "Kendaraan / Transit",
          duration: `${driveMins} mnt (${distKm.toFixed(1)} km)`,
        },
      };
    }

    const transitMins = Math.max(25, Math.round(distKm * 1.1 + 15));
    return {
      ...act,
      transitToNext: {
        icon: "subway",
        mode: "Kereta / Antarkota",
        duration: `${transitMins} mnt (${Math.round(distKm)} km)`,
      },
    };
  });
}

function ensureCandidatePool(trip: ItineraryData): ItineraryData {
  const existingPool = Array.isArray(trip.candidatePlaces)
    ? trip.candidatePlaces
    : [];
  const dayActs = trip.days.flatMap((d) =>
    d.activities.map((a, idx) => ({
      ...a,
      id: a.id || `act-${d.day}-${idx}`,
      city: a.city || d.city || trip.destination,
      recommendedTime: a.recommendedTime || a.time || "09:00 - 11:00",
    }))
  );

  const mergedMap = new Map<string, ActivityItem>();
  for (const item of [...existingPool, ...dayActs]) {
    const key = item.placeName.toLowerCase().trim();
    if (!mergedMap.has(key)) {
      mergedMap.set(key, {
        ...item,
        id:
          item.id ||
          `cand-${mergedMap.size + 1}-${Math.random().toString(36).slice(2, 6)}`,
        city: item.city || trip.cities?.[0] || trip.destination,
        recommendedTime: item.recommendedTime || item.time || "09:00 - 11:00",
      });
    }
  }

  const candidatePlaces = Array.from(mergedMap.values());
  const citiesSet = new Set<string>([
    ...(trip.cities || []),
    ...candidatePlaces.map((c) => c.city || "").filter(Boolean),
    ...trip.days.map((d) => d.city || "").filter(Boolean),
  ]);

  return {
    ...trip,
    cities: Array.from(citiesSet),
    candidatePlaces,
  };
}

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
  badgeTone?: string
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
  const [activeDay, setActiveDay] = useState<number | "all">(1);
  const [focusedStop, setFocusedStop] = useState<FocusedStop | null>(null);
  const [activeStopIdx, setActiveStopIdx] = useState<number | null>(null);

  // History state loaded from localStorage + DB
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [historyDropdownOpen, setHistoryDropdownOpen] =
    useState<boolean>(false);

  // Start Screen Input Mode ("multi" | "single")
  const [inputMode, setInputMode] = useState<"multi" | "single">("multi");
  const [countryInput, setCountryInput] = useState<string>("");
  const [cityGroups, setCityGroups] = useState<CityGroupForm[]>(() => [
    createEmptyCityGroup(""),
  ]);

  // Single Link Input State
  const [urlInput, setUrlInput] = useState("");
  const [rawCaption, setRawCaption] = useState("");
  const [showManualCaption, setShowManualCaption] = useState(false);

  // AI Loading & Error State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSharedId, setIsLoadingSharedId] = useState(false);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(12);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Candidate Pool UI State (Inside Workspace)
  const [poolOpen, setPoolOpen] = useState<boolean>(true);
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>("all");
  const [poolFilterStatus, setPoolFilterStatus] = useState<"all" | "unadded">(
    "all"
  );

  // Add More Links Modal (Inside Workspace)
  const [addLinksModalOpen, setAddLinksModalOpen] = useState<boolean>(false);
  const [appendCityName, setAppendCityName] = useState<string>("");
  const [appendLinksText, setAppendLinksText] = useState<string>("");
  const [appendCaptionText, setAppendCaptionText] = useState<string>("");
  const [isAppendingLinks, setIsAppendingLinks] = useState<boolean>(false);

  // Add Custom Place Form State
  const [showCustomPlaceForm, setShowCustomPlaceForm] =
    useState<boolean>(false);
  const [customPlaceName, setCustomPlaceName] = useState<string>("");
  const [customPlaceCity, setCustomPlaceCity] = useState<string>("");
  const [customPlaceCategory, setCustomPlaceCategory] =
    useState<ActivityCategory>("sightseeing");
  const [customPlaceTime, setCustomPlaceTime] = useState<string>("");
  const [customPlaceDesc, setCustomPlaceDesc] = useState<string>("");
  const [isAddingCustomPlace, setIsAddingCustomPlace] =
    useState<boolean>(false);

  // Drag and Drop Reordering State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Day Title Inline Edit State
  const [editingDayTitle, setEditingDayTitle] = useState<boolean>(false);

  // Mobile View Toggle ("timeline" | "map")
  const [mobileView, setMobileView] = useState<"timeline" | "map">("timeline");

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const normalizedTrip = ensureCandidatePool(newTrip);
      setItinerary(normalizedTrip);
      const finalId = recordId || normalizedTrip.id || null;
      setActiveRecordId(finalId);
      saveActiveIdToLocalStorage(finalId);

      const targetDay =
        preferredDay && normalizedTrip.days.some((d) => d.day === preferredDay)
          ? preferredDay
          : normalizedTrip.days[0]?.day || 1;
      setActiveDay(targetDay);
      setActiveStopIdx(null);
      setFocusedStop(null);
      setHistoryDropdownOpen(false);
      setSelectedCityFilter("all");
      setMobileView("timeline");

      // Open candidate pool automatically if any day is empty or candidatePlaces exist
      setPoolOpen(true);

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

  // Persist user modifications to LocalStorage immediately & debounce DB PUT
  const updateItineraryAndPersist = useCallback(
    (updater: (prev: ItineraryData) => ItineraryData) => {
      setItinerary((prev) => {
        if (!prev) return prev;
        const updated = ensureCandidatePool(updater(prev));
        const recId = activeRecordId || updated.id || `cw_${Date.now()}`;
        const updatedRecord: HistoryRecord = {
          id: recId,
          createdAt: new Date().toISOString(),
          itinerary: { ...updated, id: recId },
        };

        const currentCache = getCachedRecordsFromLocalStorage();
        const nextCache = [
          updatedRecord,
          ...currentCache.filter((r) => r.id !== recId),
        ].slice(0, 25);
        saveCachedRecordsToLocalStorage(nextCache);
        setHistoryRecords(nextCache);

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          fetch("/api/itineraries", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itinerary: updatedRecord.itinerary }),
          }).catch(() => {
            // ignore network error
          });
        }, 500);

        return updatedRecord.itinerary;
      });
    },
    [activeRecordId]
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
        const serverRecords: HistoryRecord[] = Array.isArray(data.records)
          ? (data.records as HistoryRecord[])
          : [];
        const serverIdSet = new Set(serverRecords.map((r) => r.id));

        // Sync any localStorage records that are not yet stored on the server DB
        // so that their ?id=cw_... link can be shared and opened on other devices
        const missingOnServer = cachedRecords.filter(
          (rec) => rec.id && !serverIdSet.has(rec.id)
        );
        if (missingOnServer.length > 0) {
          Promise.allSettled(
            missingOnServer.slice(0, 10).map((rec) =>
              fetch("/api/itineraries", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  itinerary: { ...rec.itinerary, id: rec.id },
                }),
              })
            )
          );
        }

        if (serverRecords.length > 0 || cachedRecords.length > 0) {
          const recordMap = new Map<string, HistoryRecord>();
          for (const rec of cachedRecords) {
            recordMap.set(rec.id, rec);
          }
          for (const rec of serverRecords) {
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
      const urlId = params?.get("id")?.trim() || null;
      const targetId = urlId || getActiveIdFromLocalStorage();

      if (targetId) {
        const cachedMatch = localCache.find((r) => r.id === targetId);
        if (cachedMatch && isMounted) {
          applyItinerary(cachedMatch.itinerary, cachedMatch.id, 1);
          // Also ensure this active itinerary is synced to server DB so its ?id= link works for others
          fetch("/api/itineraries", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itinerary: { ...cachedMatch.itinerary, id: cachedMatch.id },
            }),
          }).catch(() => {
            // ignore
          });
        } else {
          if (urlId && isMounted) {
            setIsLoadingSharedId(true);
          }
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
            } else if (urlId && isMounted) {
              setErrorMsg(
                `Itinerary dengan ID "${urlId}" belum ditemukan di server. Jika ini itinerary lama Anda, buka dari browser pembuatnya terlebih dahulu agar tersinkronisasi otomatis.`
              );
            }
          } catch {
            if (urlId && isMounted) {
              setErrorMsg("Gagal memuat itinerary dari link yang dibagikan.");
            }
          } finally {
            if (isMounted) {
              setIsLoadingSharedId(false);
            }
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

  const registerSavedRecord = useCallback(
    (record: HistoryRecord, preferredDay?: number) => {
      const normalizedRecord: HistoryRecord = {
        ...record,
        itinerary: ensureCandidatePool(record.itinerary),
      };
      const currentIds = getSavedIdsFromLocalStorage();
      const updatedIds = [
        normalizedRecord.id,
        ...currentIds.filter((existingId) => existingId !== normalizedRecord.id),
      ].slice(0, 25);
      saveIdsToLocalStorage(updatedIds);

      const currentCache = getCachedRecordsFromLocalStorage();
      const updatedCache = [
        normalizedRecord,
        ...currentCache.filter((r) => r.id !== normalizedRecord.id),
      ].slice(0, 25);
      saveCachedRecordsToLocalStorage(updatedCache);

      setHistoryRecords(updatedCache);
      applyItinerary(
        normalizedRecord.itinerary,
        normalizedRecord.id,
        preferredDay
      );
    },
    [applyItinerary]
  );

  // ==================== MULTI-CITY & MULTI-LINK FORM HANDLERS ====================
  const handleAddCityGroup = () => {
    setCityGroups((prev) => [...prev, createEmptyCityGroup("")]);
  };

  const handleRemoveCityGroup = (cityId: string) => {
    setCityGroups((prev) =>
      prev.length > 1 ? prev.filter((c) => c.id !== cityId) : prev
    );
  };

  const handleCityNameChange = (cityId: string, newName: string) => {
    setCityGroups((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, cityName: newName } : c))
    );
  };

  const handleAddLinkToCity = (cityId: string) => {
    setCityGroups((prev) =>
      prev.map((c) =>
        c.id === cityId
          ? { ...c, links: [...c.links, createEmptyLinkSlot()] }
          : c
      )
    );
  };

  const handleRemoveLinkFromCity = (cityId: string, linkId: string) => {
    setCityGroups((prev) =>
      prev.map((c) =>
        c.id === cityId && c.links.length > 1
          ? { ...c, links: c.links.filter((l) => l.id !== linkId) }
          : c
      )
    );
  };

  const handleLinkFieldChange = (
    cityId: string,
    linkId: string,
    field: "url" | "caption" | "showCaption",
    value: string | boolean
  ) => {
    setCityGroups((prev) =>
      prev.map((c) => {
        if (c.id !== cityId) return c;

        // If user pastes multiple URLs separated by newline into the URL field, split them into multiple link slots automatically!
        if (
          field === "url" &&
          typeof value === "string" &&
          value.includes("\n")
        ) {
          const lines = value
            .split(/[\r\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          if (lines.length > 1) {
            const nextLinks: LinkSlotForm[] = [];
            for (const existing of c.links) {
              if (existing.id === linkId) {
                lines.forEach((lineUrl, idx) => {
                  nextLinks.push({
                    id:
                      idx === 0
                        ? existing.id
                        : `link-${Date.now()}-${idx}-${Math.random()
                            .toString(36)
                            .slice(2, 5)}`,
                    url: lineUrl,
                    caption: idx === 0 ? existing.caption : "",
                    showCaption: idx === 0 ? existing.showCaption : false,
                  });
                });
              } else {
                nextLinks.push(existing);
              }
            }
            return { ...c, links: nextLinks };
          }
        }

        return {
          ...c,
          links: c.links.map((l) =>
            l.id === linkId ? { ...l, [field]: value } : l
          ),
        };
      })
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMode === "single") {
      if (!urlInput.trim() && !rawCaption.trim()) {
        setErrorMsg(
          "Tempel link TikTok, Instagram, atau YouTube terlebih dahulu."
        );
        return;
      }
    } else {
      const hasAnyInput = cityGroups.some(
        (cg) =>
          cg.cityName.trim().length > 0 ||
          cg.links.some((l) => l.url.trim().length > 0 || l.caption.trim().length > 0)
      );
      if (!hasAnyInput) {
        setErrorMsg(
          "Masukkan minimal satu nama kota atau satu link video TikTok, Instagram, atau YouTube."
        );
        return;
      }
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const payload =
        inputMode === "multi"
          ? {
              country: countryInput.replace(/^[^\w]+/, "").trim(),
              cityGroups: cityGroups.map((cg) => ({
                cityName: cg.cityName.trim(),
                links: cg.links.map((l) => ({
                  url: l.url.trim(),
                  caption: l.caption.trim(),
                })),
              })),
              startWithEmptyDays: true,
            }
          : {
              url: urlInput.trim(),
              rawCaption: rawCaption.trim(),
              startWithEmptyDays: true,
            };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      if (msg.toLowerCase().includes("caption") && inputMode === "single") {
        setShowManualCaption(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Append more video links to the currently active itinerary
  const handleAppendMoreLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary) return;
    const urls = appendLinksText
      .split(/[\r\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (urls.length === 0 && !appendCaptionText.trim() && !appendCityName.trim()) {
      return;
    }

    setIsAppendingLinks(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: itinerary.country,
          cityGroups: [
            {
              cityName: appendCityName.trim(),
              links:
                urls.length > 0
                  ? urls.map((u, idx) => ({
                      url: u,
                      caption: idx === 0 ? appendCaptionText.trim() : "",
                    }))
                  : [{ url: "", caption: appendCaptionText.trim() }],
            },
          ],
          startWithEmptyDays: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.itinerary) {
        const newlyExtracted: ActivityItem[] =
          data.itinerary.candidatePlaces || [];
        const newLinks = data.itinerary.sourceLinks || [];

        updateItineraryAndPersist((prev) => {
          const existingPool = prev.candidatePlaces || [];
          const existingNames = new Set(
            existingPool.map((p) => p.placeName.toLowerCase().trim())
          );
          const mergedPool = [
            ...existingPool,
            ...newlyExtracted.filter(
              (np) => !existingNames.has(np.placeName.toLowerCase().trim())
            ),
          ];
          const mergedCities = Array.from(
            new Set([
              ...(prev.cities || []),
              ...(data.itinerary.cities || []),
              ...(appendCityName.trim() ? [appendCityName.trim()] : []),
            ])
          );

          return {
            ...prev,
            cities: mergedCities,
            sourceLinks: [...(prev.sourceLinks || []), ...newLinks],
            candidatePlaces: mergedPool,
          };
        });

        if (appendCityName.trim()) {
          setSelectedCityFilter(appendCityName.trim());
        }
        setAppendCityName("");
        setAppendLinksText("");
        setAppendCaptionText("");
        setAddLinksModalOpen(false);
        setPoolOpen(true);
      }
    } catch {
      // ignore
    } finally {
      setIsAppendingLinks(false);
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
          1
        );
      }
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
    }
  };

  // ==================== INTERACTIVE BUILDER HANDLERS (ADD, REORDER, TIME, DAYS) ====================
  const targetDayNumber =
    typeof activeDay === "number"
      ? activeDay
      : itinerary?.days[0]?.day || 1;

  const handleAddCandidateToDay = useCallback(
    (candidate: ActivityItem, dayNumberToAdd?: number) => {
      const dayNum = dayNumberToAdd ?? targetDayNumber;
      updateItineraryAndPersist((prev) => {
        const nextDays = prev.days.map((d) => {
          if (d.day !== dayNum) return d;
          const newAct: ActivityItem = {
            ...candidate,
            id: `${candidate.id || "act"}-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 5)}`,
            // Time is optional by default — user can fill or click recommended time
            time: candidate.time || "",
            recommendedTime:
              candidate.recommendedTime || candidate.time || "09:00 - 11:00",
          };
          const updatedActivities = recalculateDayTransits([
            ...d.activities,
            newAct,
          ]);
          return {
            ...d,
            city: d.city || candidate.city,
            activities: updatedActivities,
          };
        });
        return {
          ...prev,
          days: nextDays,
        };
      });
    },
    [targetDayNumber, updateItineraryAndPersist]
  );

  const handleRemoveActivityFromDay = (dayNum: number, actIdx: number) => {
    updateItineraryAndPersist((prev) => {
      const nextDays = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        const filtered = d.activities.filter((_, idx) => idx !== actIdx);
        return {
          ...d,
          activities: recalculateDayTransits(filtered),
        };
      });
      return {
        ...prev,
        days: nextDays,
      };
    });
    if (activeStopIdx === actIdx) {
      setActiveStopIdx(null);
    }
  };

  const handleMoveActivityOrder = (
    dayNum: number,
    fromIdx: number,
    toIdx: number
  ) => {
    updateItineraryAndPersist((prev) => {
      const nextDays = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        if (
          fromIdx < 0 ||
          toIdx < 0 ||
          fromIdx >= d.activities.length ||
          toIdx >= d.activities.length ||
          fromIdx === toIdx
        ) {
          return d;
        }
        const clone = [...d.activities];
        const [moved] = clone.splice(fromIdx, 1);
        clone.splice(toIdx, 0, moved);
        return {
          ...d,
          activities: recalculateDayTransits(clone),
        };
      });
      return {
        ...prev,
        days: nextDays,
      };
    });
    setActiveStopIdx(toIdx);
  };

  const handleMoveActivityToAnotherDay = (
    fromDayNum: number,
    actIdx: number,
    toDayNum: number
  ) => {
    if (fromDayNum === toDayNum) return;
    updateItineraryAndPersist((prev) => {
      let itemToMove: ActivityItem | null = null;
      const afterRemove = prev.days.map((d) => {
        if (d.day !== fromDayNum) return d;
        itemToMove = d.activities[actIdx] || null;
        const remaining = d.activities.filter((_, idx) => idx !== actIdx);
        return {
          ...d,
          activities: recalculateDayTransits(remaining),
        };
      });
      if (!itemToMove) return prev;
      const finalDays = afterRemove.map((d) => {
        if (d.day !== toDayNum || !itemToMove) return d;
        return {
          ...d,
          activities: recalculateDayTransits([...d.activities, itemToMove]),
        };
      });
      return {
        ...prev,
        days: finalDays,
      };
    });
  };

  const handleUpdateActivityTime = (
    dayNum: number,
    actIdx: number,
    newTime: string
  ) => {
    updateItineraryAndPersist((prev) => {
      const nextDays = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        const updatedActs = d.activities.map((a, idx) =>
          idx === actIdx ? { ...a, time: newTime } : a
        );
        return {
          ...d,
          activities: updatedActs,
        };
      });
      return {
        ...prev,
        days: nextDays,
      };
    });
  };

  const handleAddNewDay = (cityForNewDay?: string) => {
    if (!itinerary) return;
    const nextDayNum = itinerary.days.length + 1;
    const defaultCity =
      cityForNewDay ||
      (selectedCityFilter !== "all"
        ? selectedCityFilter
        : itinerary.cities?.[nextDayNum - 1] ||
          itinerary.cities?.[0] ||
          "");

    updateItineraryAndPersist((prev) => {
      const newDay: DayPlan = {
        day: prev.days.length + 1,
        city: defaultCity || undefined,
        dateLabel: defaultCity
          ? `Hari ${prev.days.length + 1} • ${defaultCity}`
          : `Hari ${prev.days.length + 1}`,
        fullDateLabel: defaultCity
          ? `Hari ke-${prev.days.length + 1} • ${defaultCity}`
          : `Hari ke-${prev.days.length + 1}`,
        weatherLabel: "Cerah",
        efficiencyLabel: "Rute Kustom",
        title: defaultCity
          ? `Eksplorasi ${defaultCity}`
          : `Rencana Perjalanan Hari ${prev.days.length + 1}`,
        activities: [],
      };
      const nextDays = [...prev.days, newDay];
      return {
        ...prev,
        durationDays: nextDays.length,
        days: nextDays,
      };
    });
    setActiveDay(nextDayNum);
  };

  const handleDeleteDay = (dayNumToDelete: number) => {
    if (!itinerary || itinerary.days.length <= 1) return;
    updateItineraryAndPersist((prev) => {
      const filtered = prev.days
        .filter((d) => d.day !== dayNumToDelete)
        .map((d, idx) => ({
          ...d,
          day: idx + 1,
          dateLabel: d.city ? `Hari ${idx + 1} • ${d.city}` : `Hari ${idx + 1}`,
          fullDateLabel: d.city
            ? `Hari ke-${idx + 1} • ${d.city}`
            : `Hari ke-${idx + 1}`,
        }));
      return {
        ...prev,
        durationDays: filtered.length,
        days: filtered,
      };
    });
    setActiveDay(1);
  };

  const handleUpdateDayMeta = (
    dayNum: number,
    fields: { title?: string; city?: string }
  ) => {
    updateItineraryAndPersist((prev) => {
      const nextDays = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        const nextCity = fields.city !== undefined ? fields.city : d.city;
        const nextTitle = fields.title !== undefined ? fields.title : d.title;
        return {
          ...d,
          city: nextCity,
          title: nextTitle,
          dateLabel: nextCity ? `Hari ${d.day} • ${nextCity}` : `Hari ${d.day}`,
          fullDateLabel: nextCity
            ? `Hari ke-${d.day} • ${nextCity}`
            : `Hari ke-${d.day}`,
        };
      });
      return {
        ...prev,
        days: nextDays,
      };
    });
  };

  // Geographical Nearest-Neighbor Route Sort for Active Day
  const handleOptimizeDayRouteOrder = (dayNum: number) => {
    updateItineraryAndPersist((prev) => {
      const nextDays = prev.days.map((d) => {
        if (d.day !== dayNum || d.activities.length <= 2) return d;
        const remaining = [...d.activities];
        const ordered: ActivityItem[] = [];
        // Start with the first stop selected by the user
        let current = remaining.shift()!;
        ordered.push(current);

        while (remaining.length > 0) {
          let bestIdx = 0;
          let bestDist = Infinity;
          for (let i = 0; i < remaining.length; i++) {
            const dist = haversineKm(
              current.location.lat,
              current.location.lng,
              remaining[i].location.lat,
              remaining[i].location.lng
            );
            if (dist < bestDist) {
              bestDist = dist;
              bestIdx = i;
            }
          }
          current = remaining.splice(bestIdx, 1)[0];
          ordered.push(current);
        }

        return {
          ...d,
          efficiencyLabel: "Rute Searah Optimal",
          activities: recalculateDayTransits(ordered),
        };
      });
      return {
        ...prev,
        days: nextDays,
      };
    });
  };

  // Auto-Arrange ALL Candidate Places into Days (Grouped by City, max 4 per day)
  const handleAutoArrangeAllCandidates = () => {
    updateItineraryAndPersist((prev) => {
      const candidates = prev.candidatePlaces || [];
      if (candidates.length === 0) return prev;

      const byCity = new Map<string, ActivityItem[]>();
      for (const cand of candidates) {
        const cName = cand.city?.trim() || prev.destination || "Utama";
        const group = byCity.get(cName) || [];
        group.push(cand);
        byCity.set(cName, group);
      }

      const newDays: DayPlan[] = [];
      let dayCounter = 1;

      for (const [cityName, cityItems] of byCity.entries()) {
        // Chunk into groups of up to 4 places per day
        const chunkSize = 4;
        for (let i = 0; i < cityItems.length; i += chunkSize) {
          const slice = cityItems.slice(i, i + chunkSize).map((item) => ({
            ...item,
            id: `${item.id || "act"}-${dayCounter}-${i}`,
            time: item.time || item.recommendedTime || "",
          }));
          const partNum = Math.floor(i / chunkSize) + 1;
          const totalParts = Math.ceil(cityItems.length / chunkSize);
          newDays.push({
            day: dayCounter,
            city: cityName,
            dateLabel: `Hari ${dayCounter} • ${cityName}`,
            fullDateLabel: `Hari ke-${dayCounter} • ${cityName}`,
            weatherLabel: "Cerah",
            efficiencyLabel: "Rute Searah AI",
            title:
              totalParts > 1
                ? `Eksplorasi ${cityName} (Bagian ${partNum})`
                : `Eksplorasi ${cityName}`,
            activities: recalculateDayTransits(slice),
          });
          dayCounter++;
        }
      }

      return {
        ...prev,
        durationDays: newDays.length,
        days: newDays,
      };
    });
    setActiveDay(1);
  };

  // Add all unadded candidates from current city filter to active day
  const handleAddAllFilteredToActiveDay = (candidatesToAdd: ActivityItem[]) => {
    if (candidatesToAdd.length === 0) return;
    const dayNum = targetDayNumber;
    updateItineraryAndPersist((prev) => {
      const nextDays = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        const existingNames = new Set(
          d.activities.map((a) => a.placeName.toLowerCase().trim())
        );
        const newItems = candidatesToAdd
          .filter((c) => !existingNames.has(c.placeName.toLowerCase().trim()))
          .map((c, idx) => ({
            ...c,
            id: `${c.id || "act"}-${Date.now()}-${idx}`,
            time: c.time || "",
          }));
        return {
          ...d,
          activities: recalculateDayTransits([...d.activities, ...newItems]),
        };
      });
      return {
        ...prev,
        days: nextDays,
      };
    });
  };

  // Add custom manual place with Nominatim geocoding
  const handleAddCustomPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPlaceName.trim() || !itinerary) return;
    setIsAddingCustomPlace(true);

    const dayNum = targetDayNumber;
    const currentDayObj =
      itinerary.days.find((d) => d.day === dayNum) || itinerary.days[0];
    const cityVal =
      customPlaceCity.trim() ||
      currentDayObj?.city ||
      itinerary.cities?.[0] ||
      itinerary.destination;

    let lat =
      currentDayObj?.activities[currentDayObj.activities.length - 1]?.location
        .lat ??
      itinerary.candidatePlaces?.[0]?.location.lat ??
      -7.7956;
    let lng =
      currentDayObj?.activities[currentDayObj.activities.length - 1]?.location
        .lng ??
      itinerary.candidatePlaces?.[0]?.location.lng ??
      110.3695;
    let address = `${customPlaceName.trim()}, ${cityVal}`;

    try {
      const query = `${customPlaceName.trim()} ${cityVal}`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          query
        )}`
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json[0]?.lat && json[0]?.lon) {
          lat = parseFloat(json[0].lat);
          lng = parseFloat(json[0].lon);
          address = json[0].display_name || address;
        }
      }
    } catch {
      // use fallback coordinates near current city
      lat += (Math.random() - 0.5) * 0.01;
      lng += (Math.random() - 0.5) * 0.01;
    }

    const newPlace: ActivityItem = {
      id: `custom-${Date.now()}`,
      city: cityVal,
      time: customPlaceTime.trim(),
      recommendedTime: customPlaceTime.trim() || "10:00 - 12:00",
      placeName: customPlaceName.trim(),
      category: customPlaceCategory,
      description:
        customPlaceDesc.trim() || `Destinasi tambahan di ${cityVal}`,
      tips: customPlaceDesc.trim() || "Ditambahkan secara manual oleh pengguna.",
      badgeLabel: "Manual",
      badgeTone: customPlaceCategory === "food" ? "orange" : "neutral",
      sourcePlatform: "custom",
      location: { lat, lng, address },
    };

    updateItineraryAndPersist((prev) => {
      const nextDays = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        return {
          ...d,
          activities: recalculateDayTransits([...d.activities, newPlace]),
        };
      });
      return {
        ...prev,
        candidatePlaces: [...(prev.candidatePlaces || []), newPlace],
        days: nextDays,
      };
    });

    setCustomPlaceName("");
    setCustomPlaceTime("");
    setCustomPlaceDesc("");
    setShowCustomPlaceForm(false);
    setIsAddingCustomPlace(false);
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

  const handleFocusCandidateOnMap = (candidateId: string) => {
    setFocusedStop({
      day: targetDayNumber,
      activityIndex: -1,
      candidateId,
      timestamp: Date.now(),
    });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileView("map");
    }
  };

  const handleOpenGoogleMapsRoute = () => {
    if (!itinerary) return;
    const currentDayObj =
      itinerary.days.find((d) => d.day === targetDayNumber) ||
      itinerary.days[0];
    const stops =
      activeDay === "all"
        ? itinerary.days.flatMap((d) => d.activities)
        : currentDayObj
        ? currentDayObj.activities
        : [];
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

  const handleShareItinerary = async (
    targetId?: string,
    targetTrip?: ItineraryData,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }
    const idToShare = targetId || activeRecordId || itinerary?.id;
    const tripToSync = targetTrip || itinerary;
    if (!idToShare || typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}/?id=${encodeURIComponent(
      idToShare
    )}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareId(idToShare);
      setTimeout(() => {
        setCopiedShareId((prev) => (prev === idToShare ? null : prev));
      }, 2500);
    } catch {
      // Fallback prompt if clipboard permission denied
      window.prompt("Salin link itinerary ini:", shareUrl);
    }

    // Ensure the itinerary is persisted to the cloud DB so anyone opening ?id= can view it
    if (tripToSync) {
      fetch("/api/itineraries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary: { ...tripToSync, id: idToShare },
        }),
      }).catch(() => {
        // ignore
      });
    }
  };

  if (isLoadingSharedId && !itinerary) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f8fafc] text-on-surface p-4 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-bold text-slate-700">
          Memuat Itinerary dari Link...
        </p>
      </div>
    );
  }

  // ==================== HYBRID AI LOADING STATE (PROGRESS BAR + SKELETON WORKSPACE) ====================
  if (isGenerating) {
    const activeStepInfo =
      AI_LOADING_STEPS[loadingStep] || AI_LOADING_STEPS[0];

    return (
      <div className="min-h-dvh lg:h-dvh lg:overflow-hidden flex flex-col bg-[#f8fafc] text-on-surface">
        {/* Clean Header with icon.png */}
        <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/icon.png"
              alt="Cool Wanderer"
              className="w-8 h-8 rounded-full object-contain shrink-0 shadow-sm"
            />
            <span className="font-bold text-sm tracking-tight text-primary uppercase whitespace-nowrap">
              Cool Wanderer
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 truncate">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
              <span className="truncate">Mengekstrak Destinasi Video AI...</span>
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary-fixed/60 text-primary text-xs font-bold shrink-0">
            {Math.round(loadingProgress)}%
          </div>
        </header>

        {/* Split-View Hybrid Loading */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden">
          <div className="w-full lg:w-[480px] xl:w-[520px] lg:h-full bg-white border-r border-slate-200/80 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-5 gap-5">
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

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-teal-500 to-secondary-container transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeStepInfo.desc}
              </p>

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

            {/* Skeleton Shimmer Destination Items */}
            <div className="flex flex-col gap-3 shrink-0">
              <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-24 rounded-xl bg-slate-200 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-1 h-full bg-slate-100 relative items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(#94a3b8 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10 bg-white/90 backdrop-blur-md px-6 py-5 rounded-3xl shadow-md border border-slate-200/80 flex flex-col items-center gap-3 max-w-sm text-center">
              <img
                src="/icon.png"
                alt="Cool Wanderer"
                className="w-12 h-12 rounded-full object-contain animate-pulse"
              />
              <h3 className="font-bold text-sm text-slate-900">
                Menyiapkan Peta &amp; Item Destinasi...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mengekstrak titik koordinat tempat wisata dan kuliner dari setiap
                video agar siap Anda pilih ke jadwal harian.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== EMPTY INITIAL STATE (MULTI-CITY & MULTI-LINK BUILDER + HISTORY) ====================
  if (!itinerary) {
    const totalLinksCount = cityGroups.reduce(
      (acc, cg) => acc + cg.links.length,
      0
    );

    return (
      <div className="min-h-dvh flex flex-col bg-[#f8fafc] text-on-surface">
        {/* Header with icon.png */}
        <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/icon.png"
              alt="Cool Wanderer"
              className="w-8 h-8 rounded-full object-contain shadow-sm shrink-0"
            />
            <span className="font-bold text-sm tracking-tight text-primary uppercase whitespace-nowrap">
              Cool Wanderer
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 truncate">
            AI Multi-Link Social Media Itinerary Builder
          </span>
        </header>

        {/* Main Start Container */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 gap-6">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.05)] p-5 sm:p-7 flex flex-col gap-5">
            {/* Hero Title with icon.png */}
            <div className="text-center flex flex-col items-center gap-2">
              <img
                src="/icon.png"
                alt="Cool Wanderer"
                className="w-14 h-14 rounded-full object-contain mb-0.5 shadow-sm"
              />
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Susun Itinerary dari Video Sosial Media
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg leading-relaxed">
                Masukkan beberapa link video sekaligus (1 negara beberapa kota,
                1 kota beberapa link). AI akan mengekstrak seluruh destinasi
                agar bisa Anda pilih, atur urutannya, sesuaikan jam, &amp; bagi
                per hari.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setInputMode("multi");
                  setErrorMsg(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  inputMode === "multi"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>Multi-Kota &amp; Multi-Link</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode("single");
                  setErrorMsg(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  inputMode === "single"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Link2 className="w-3.5 h-3.5 shrink-0" />
                <span>Single Link Cepat</span>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              {inputMode === "multi" ? (
                <>
                  {/* Step 1: Country Input */}
                  <div className="flex flex-col gap-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>1. Negara / Wilayah Tujuan (Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      placeholder="Contoh: Jepang, Indonesia, Korea Selatan..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-on-surface placeholder:text-slate-400 focus:outline-none focus:border-primary"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-400 mr-1">
                        Pilih cepat:
                      </span>
                      {QUICK_COUNTRIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCountryInput(c)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            countryInput === c
                              ? "bg-primary text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Multiple Cities & Multiple Links per City */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          2. Daftar Kota &amp; Link Video ({cityGroups.length}{" "}
                          Kota • {totalLinksCount} Link)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCityGroup}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-fixed/60 hover:bg-primary-fixed text-primary text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>Tambah Kota</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {cityGroups.map((cityGroup, cityIdx) => (
                        <div
                          key={cityGroup.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 flex flex-col gap-3"
                        >
                          {/* City Header */}
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold shrink-0">
                              Kota {cityIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={cityGroup.cityName}
                              onChange={(e) =>
                                handleCityNameChange(
                                  cityGroup.id,
                                  e.target.value
                                )
                              }
                              placeholder="Nama Kota (Contoh: Tokyo, Kyoto, Jogja, Bandung...)"
                              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-on-surface placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-primary min-w-0"
                            />
                            {cityGroups.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveCityGroup(cityGroup.id)
                                }
                                className="p-2 rounded-xl text-slate-400 hover:text-error hover:bg-red-50 transition-colors shrink-0"
                                title="Hapus Kota ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Links in this City */}
                          <div className="flex flex-col gap-2 pl-2 border-l-2 border-primary/20">
                            {cityGroup.links.map((linkItem, linkIdx) => (
                              <div
                                key={linkItem.id}
                                className="flex flex-col gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200/80"
                              >
                                <div className="flex items-center gap-2">
                                  <Link2 className="w-4 h-4 text-primary shrink-0" />
                                  <input
                                    type="text"
                                    value={linkItem.url}
                                    onChange={(e) =>
                                      handleLinkFieldChange(
                                        cityGroup.id,
                                        linkItem.id,
                                        "url",
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Link video #${
                                      linkIdx + 1
                                    } (TikTok / IG Reels / YouTube)...`}
                                    className="flex-1 text-xs sm:text-sm bg-transparent text-on-surface placeholder:text-slate-400 focus:outline-none min-w-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleLinkFieldChange(
                                        cityGroup.id,
                                        linkItem.id,
                                        "showCaption",
                                        !linkItem.showCaption
                                      )
                                    }
                                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                                      linkItem.showCaption || linkItem.caption
                                        ? "bg-primary-fixed/60 text-primary"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                    title="Tambah catatan / caption manual untuk link ini"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span className="hidden sm:inline">
                                      Catatan
                                    </span>
                                  </button>
                                  {cityGroup.links.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveLinkFromCity(
                                          cityGroup.id,
                                          linkItem.id
                                        )
                                      }
                                      className="p-1 text-slate-400 hover:text-error rounded-lg shrink-0"
                                      title="Hapus link ini"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {linkItem.showCaption && (
                                  <input
                                    type="text"
                                    value={linkItem.caption}
                                    onChange={(e) =>
                                      handleLinkFieldChange(
                                        cityGroup.id,
                                        linkItem.id,
                                        "caption",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Opsional: ketik topik video / nama tempat jika video diprivat (misal: Ramen Shinjuku, Sensoji, Shibuya Sky)..."
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-on-surface focus:outline-none focus:border-primary"
                                  />
                                )}
                              </div>
                            ))}

                            <div className="flex items-center justify-between pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleAddLinkToCity(cityGroup.id)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                              >
                                <Plus className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  Tambah Link Video di{" "}
                                  {cityGroup.cityName.trim() ||
                                    `Kota ${cityIdx + 1}`}
                                </span>
                              </button>
                              <span className="text-[10px] text-slate-400">
                                {cityGroup.links.length} link di kota ini
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCityGroup}
                      className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-primary/40 hover:border-primary bg-primary-fixed/20 hover:bg-primary-fixed/40 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>
                        + Tambah Kota Lainnya (1 Negara Beberapa Kota)
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* Single Link Quick Mode */
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:bg-white focus-within:border-primary transition-all min-w-0">
                    <Link2 className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Tempel link TikTok, Instagram Reels, atau YouTube Shorts..."
                      className="w-full text-sm bg-transparent text-on-surface placeholder:text-slate-400 focus:outline-none min-w-0"
                    />
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
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-error font-medium leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-container text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 transition-all"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Proses Video &amp; Tampilkan Pilihan Destinasi (AI)
                </span>
              </button>
            </form>

            {/* Quick Presets to Test */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5">
              <span className="text-xs text-slate-400 font-medium text-center">
                Belum punya link? Coba simulasi multi-kota &amp; pilih destinasi:
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

          {/* SAVED HISTORY SECTION */}
          {!isLoadingHistory && historyRecords.length > 0 && (
            <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-4 sm:p-6 flex flex-col gap-3">
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
                  const poolCount = rec.itinerary.candidatePlaces?.length || 0;
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
                          {rec.itinerary.days.length}H
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
                              {totalPlaces} Di Jadwal
                              {poolCount > 0 ? ` (${poolCount} Ekstraksi)` : ""}
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
                          onClick={(e) =>
                            handleShareItinerary(rec.id, rec.itinerary, e)
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-teal-50 transition-colors"
                          title="Salin link share itinerary ini"
                        >
                          {copiedShareId === rec.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
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

  // ==================== GENERATED ITINERARY BUILDER VIEW ====================
  const currentDayPlan =
    itinerary.days.find((d) => d.day === targetDayNumber) || itinerary.days[0];

  const candidatePlaces = itinerary.candidatePlaces || [];

  // Map each normalized placeName to the day numbers where it has been added
  const placeToAddedDaysMap = new Map<string, number[]>();
  itinerary.days.forEach((d) => {
    d.activities.forEach((act) => {
      const key = act.placeName.toLowerCase().trim();
      const arr = placeToAddedDaysMap.get(key) || [];
      if (!arr.includes(d.day)) {
        arr.push(d.day);
      }
      placeToAddedDaysMap.set(key, arr);
    });
  });

  // Extract unique cities across candidatePlaces and itinerary.cities
  const availableCities = Array.from(
    new Set([
      ...(itinerary.cities || []),
      ...candidatePlaces.map((c) => c.city?.trim() || "").filter(Boolean),
    ])
  );

  // Filter candidatePlaces by selected city & status
  const filteredCandidates = candidatePlaces.filter((cand) => {
    const matchesCity =
      selectedCityFilter === "all" ||
      (cand.city || "").toLowerCase().trim() ===
        selectedCityFilter.toLowerCase().trim();
    if (!matchesCity) return false;

    if (poolFilterStatus === "unadded") {
      const addedDays =
        placeToAddedDaysMap.get(cand.placeName.toLowerCase().trim()) || [];
      return addedDays.length === 0;
    }
    return true;
  });

  const totalScheduledStops = itinerary.days.reduce(
    (sum, d) => sum + d.activities.length,
    0
  );

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden flex flex-col bg-[#f8fafc] text-on-surface">
      {/* ==================== SIMPLE CLEAN HEADER WITH ICON.PNG ==================== */}
      <header className="relative h-14 px-3 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0 z-40">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleResetEmpty}
            className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm cursor-pointer"
            title="Kembali ke halaman awal"
          >
            <img
              src="/icon.png"
              alt="Cool Wanderer"
              className="w-full h-full object-contain"
            />
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
              {itinerary.country && (
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-primary-fixed/60 text-primary text-[10px] font-bold shrink-0">
                  {itinerary.country}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
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
            onClick={() => setAddLinksModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary-fixed/70 hover:bg-primary-fixed text-primary text-xs font-bold flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap"
            title="Tambah link video atau kota baru ke itinerary ini"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Tambah Link</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShareItinerary(
                activeRecordId || itinerary.id,
                itinerary
              )
            }
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap ${
              copiedShareId &&
              copiedShareId === (activeRecordId || itinerary.id)
                ? "bg-emerald-600 text-white"
                : "bg-teal-50 hover:bg-teal-100 text-primary border border-primary/20"
            }`}
            title="Salin link langsung (?id=...) untuk dibagikan"
          >
            {copiedShareId &&
            copiedShareId === (activeRecordId || itinerary.id) ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Share Link</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetEmpty}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap"
          >
            <span>Trip Baru</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleMapsRoute}
            disabled={totalScheduledStops === 0}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0 whitespace-nowrap"
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
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) =>
                            handleShareItinerary(rec.id, rec.itinerary, e)
                          }
                          className="p-1.5 text-slate-400 hover:text-primary rounded-lg shrink-0"
                          title="Salin link share"
                        >
                          {copiedShareId === rec.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryItem(rec.id, e)}
                          className="p-1.5 text-slate-400 hover:text-error rounded-lg shrink-0"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </header>

      {/* ==================== MODAL: TAMBAH LINK VIDEO / KOTA BARU ==================== */}
      {addLinksModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">
                    Tambah Link Video / Kota Baru
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    AI akan mengekstrak destinasi baru ke daftar pilihan Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddLinksModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAppendMoreLinks} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Kota Tujuan (Bisa kota yang sudah ada atau kota baru)
                </label>
                <input
                  type="text"
                  value={appendCityName}
                  onChange={(e) => setAppendCityName(e.target.value)}
                  placeholder="Contoh: Osaka, Kyoto, Bandung..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-primary"
                />
                {availableCities.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400">
                      Kota saat ini:
                    </span>
                    {availableCities.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAppendCityName(c)}
                        className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Link Video (Bisa lebih dari 1 link, pisahkan dengan baris baru)
                </label>
                <textarea
                  rows={3}
                  value={appendLinksText}
                  onChange={(e) => setAppendLinksText(e.target.value)}
                  placeholder={
                    "https://www.tiktok.com/@...\nhttps://www.instagram.com/reel/..."
                  }
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan / Caption Manual (Opsional)
                </label>
                <input
                  type="text"
                  value={appendCaptionText}
                  onChange={(e) => setAppendCaptionText(e.target.value)}
                  placeholder="Opsional: ketik rekomendasi tempat dari video..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddLinksModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAppendingLinks}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary-container disabled:opacity-60"
                >
                  {isAppendingLinks ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengekstrak...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ekstrak &amp; Tambahkan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MAIN SPLIT VIEW ==================== */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden relative">
        {/* LEFT COLUMN: AI CANDIDATE DESTINATION POOL + DAY-BY-DAY INTERACTIVE BUILDER */}
        <div
          className={`w-full lg:w-[500px] xl:w-[540px] lg:h-full bg-white border-r border-slate-200/80 flex flex-col min-h-0 shrink-0 ${
            mobileView === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Trip Summary Header */}
          <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 bg-slate-50/60 flex flex-col gap-1 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-fixed/70 text-primary text-[10px] font-bold uppercase tracking-wide shrink-0">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>
                    {itinerary.sourceLinks && itinerary.sourceLinks.length > 1
                      ? `${itinerary.sourceLinks.length} Video Links`
                      : itinerary.sourcePlatform || "AI Video"}
                  </span>
                </span>
                {availableCities.length > 0 && (
                  <span className="text-[11px] font-semibold text-slate-600 truncate">
                    {availableCities.join(" • ")}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-primary shrink-0">
                {candidatePlaces.length} Diekstrak • {totalScheduledStops} Di
                Jadwal
              </span>
            </div>
            <h2 className="font-bold text-sm text-on-surface leading-snug break-words">
              {itinerary.tripTitle}
            </h2>
          </div>

          {/* ==================== DAY SELECTOR PILLS + "+ TAMBAH HARI" ==================== */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {itinerary.days.map((dayObj) => {
              const isSelected = activeDay === dayObj.day;
              const cityLabel = dayObj.city ? ` • ${dayObj.city}` : "";
              return (
                <button
                  key={dayObj.day}
                  type="button"
                  onClick={() => {
                    setActiveDay(dayObj.day);
                    setEditingDayTitle(false);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm font-bold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Hari {dayObj.day}
                    {cityLabel} ({dayObj.activities.length})
                  </span>
                </button>
              );
            })}

            {/* "+ Tambah Hari" Button */}
            <button
              type="button"
              onClick={() => handleAddNewDay()}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-fixed/60 hover:bg-primary-fixed text-primary transition-colors whitespace-nowrap inline-flex items-center gap-1"
              title="Tambahkan Hari Baru"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Tambah Hari</span>
            </button>

            {itinerary.days.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveDay("all")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeDay === "all"
                    ? "bg-slate-800 text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua Hari
              </button>
            )}
          </div>

          {/* Scrollable Main Left Area */}
          <div className="flex-1 min-h-0 lg:overflow-y-auto">
            <div className="p-4 pb-28 lg:pb-8 flex flex-col gap-5">
              {/* ==================== SECTION 1: SELECTABLE AI EXTRACTED DESTINATIONS POOL ==================== */}
              <div className="rounded-2xl border border-primary/25 bg-gradient-to-b from-[#f0fdfa]/70 to-white shadow-xs overflow-hidden">
                {/* Pool Header Bar */}
                <div
                  onClick={() => setPoolOpen((prev) => !prev)}
                  className="px-3.5 py-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-teal-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs sm:text-sm text-on-surface truncate">
                          Pilih Destinasi Hasil Ekstraksi AI
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-extrabold shrink-0">
                          {candidatePlaces.length} Item
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Klik <strong>+ Add</strong> untuk memasukkan tujuan ke{" "}
                        <strong>Hari {targetDayNumber}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
                  >
                    {poolOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {poolOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 flex flex-col gap-3">
                    {/* City Filter Pills & Auto-Arrange Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCityFilter("all")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                            selectedCityFilter === "all"
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Semua Kota ({candidatePlaces.length})
                        </button>
                        {availableCities.map((city) => {
                          const countInCity = candidatePlaces.filter(
                            (c) =>
                              (c.city || "").toLowerCase().trim() ===
                              city.toLowerCase().trim()
                          ).length;
                          return (
                            <button
                              key={city}
                              type="button"
                              onClick={() => setSelectedCityFilter(city)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                                selectedCityFilter.toLowerCase() ===
                                city.toLowerCase()
                                  ? "bg-primary text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {city} ({countInCity})
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPoolFilterStatus((prev) =>
                              prev === "all" ? "unadded" : "all"
                            )
                          }
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                            poolFilterStatus === "unadded"
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {poolFilterStatus === "unadded"
                            ? "Belum Di-add"
                            : "Semua Status"}
                        </button>

                        <button
                          type="button"
                          onClick={handleAutoArrangeAllCandidates}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary-fixed hover:bg-secondary-container hover:text-white text-on-secondary-fixed text-[11px] font-bold transition-colors"
                          title="Susun otomatis semua destinasi ke jadwal harian berdasarkan kota"
                        >
                          <Wand2 className="w-3 h-3 shrink-0" />
                          <span>Auto-Susun Semua</span>
                        </button>
                      </div>
                    </div>

                    {/* Batch Add Filtered City to Active Day */}
                    {filteredCandidates.length > 1 && (
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                        <span className="text-[11px] text-slate-600">
                          Menampilkan{" "}
                          <strong>{filteredCandidates.length}</strong> destinasi
                          {selectedCityFilter !== "all"
                            ? ` di ${selectedCityFilter}`
                            : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleAddAllFilteredToActiveDay(filteredCandidates)
                          }
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>
                            Add Semua ke Hari {targetDayNumber}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Candidate Destination Cards List */}
                    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                      {filteredCandidates.length === 0 ? (
                        <div className="text-center py-5 px-3 text-xs text-slate-400">
                          Semua destinasi pada filter ini sudah ditambahkan ke
                          jadwal harian.
                        </div>
                      ) : (
                        filteredCandidates.map((cand, cIdx) => {
                          const addedInDays =
                            placeToAddedDaysMap.get(
                              cand.placeName.toLowerCase().trim()
                            ) || [];
                          const isAddedToCurrentDay =
                            addedInDays.includes(targetDayNumber);
                          const candKey = cand.id || `cand-${cIdx}`;

                          return (
                            <div
                              key={candKey}
                              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                                isAddedToCurrentDay
                                  ? "bg-teal-50/40 border-primary/30"
                                  : "bg-white border-slate-200/90 hover:border-primary/50"
                              }`}
                            >
                              <div
                                onClick={() =>
                                  handleFocusCandidateOnMap(candKey)
                                }
                                className="min-w-0 flex-1 cursor-pointer"
                              >
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  {cand.city && (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                      {cand.city}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-fixed/50 text-primary text-[10px] font-semibold">
                                    {renderCategoryIcon(cand.category)}
                                    <span>
                                      {cand.category === "food"
                                        ? "Kuliner"
                                        : cand.category === "sightseeing"
                                        ? "Wisata"
                                        : cand.category === "stay"
                                        ? "Stay"
                                        : "Aktivitas"}
                                    </span>
                                  </span>
                                  {cand.estimatedCost && (
                                    <span className="text-[10px] font-semibold text-secondary">
                                      {cand.estimatedCost}
                                    </span>
                                  )}
                                  {cand.sourceAuthor && (
                                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                      {cand.sourceAuthor}
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-bold text-xs sm:text-sm text-on-surface leading-snug">
                                  {cand.placeName}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                  {cand.description}
                                </p>
                              </div>

                              {/* Add / Added Action Column */}
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddCandidateToDay(
                                      cand,
                                      targetDayNumber
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs ${
                                    isAddedToCurrentDay
                                      ? "bg-slate-100 hover:bg-primary hover:text-white text-slate-700"
                                      : "bg-primary hover:bg-primary-container text-white"
                                  }`}
                                  title={`Tambahkan ke Hari ${targetDayNumber}`}
                                >
                                  <Plus className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    {isAddedToCurrentDay
                                      ? `+ Lagi`
                                      : `Add Hari ${targetDayNumber}`}
                                  </span>
                                </button>

                                {addedInDays.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                    <Check className="w-2.5 h-2.5 shrink-0" />
                                    <span>
                                      Hari {addedInDays.join(", ")}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ==================== SECTION 2: ACTIVE DAY SCHEDULE & REORDERABLE TIMELINE ==================== */}
              {currentDayPlan && (
                <div className="flex flex-col gap-4">
                  {/* Day Header & Controls Card */}
                  <div className="bg-surface-container-low rounded-2xl p-3.5 flex flex-col gap-2.5 border border-slate-200/70">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold uppercase">
                            Hari {currentDayPlan.day}
                          </span>
                          <input
                            type="text"
                            value={currentDayPlan.city || ""}
                            onChange={(e) =>
                              handleUpdateDayMeta(currentDayPlan.day, {
                                city: e.target.value,
                              })
                            }
                            placeholder="Kota Fokus (misal: Tokyo)..."
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-primary w-36"
                          />
                        </div>

                        {editingDayTitle ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="text"
                              value={currentDayPlan.title}
                              onChange={(e) =>
                                handleUpdateDayMeta(currentDayPlan.day, {
                                  title: e.target.value,
                                })
                              }
                              onBlur={() => setEditingDayTitle(false)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingDayTitle(false);
                              }}
                              autoFocus
                              className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-primary text-sm font-bold text-on-surface focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingDayTitle(false)}
                              className="px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingDayTitle(true)}
                            className="group inline-flex items-center gap-1.5 cursor-pointer"
                            title="Klik untuk mengubah judul hari"
                          >
                            <h1 className="font-bold text-sm sm:text-base text-on-surface leading-snug break-words group-hover:text-primary transition-colors">
                              {currentDayPlan.title}
                            </h1>
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                          </div>
                        )}
                      </div>

                      {/* Day Actions: Optimize Order & Delete Day */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {currentDayPlan.activities.length >= 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOptimizeDayRouteOrder(currentDayPlan.day)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-primary hover:text-white text-primary border border-primary/25 text-[11px] font-bold transition-colors shadow-2xs"
                            title="Urutkan destinasi di hari ini agar searah & efisien"
                          >
                            <Route className="w-3.5 h-3.5 shrink-0" />
                            <span>Urutkan Searah</span>
                          </button>
                        )}
                        {itinerary.days.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDay(currentDayPlan.day)}
                            className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-400 hover:text-error border border-slate-200/80 transition-colors"
                            title={`Hapus Hari ${currentDayPlan.day}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant pt-1 border-t border-slate-200/60">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>
                            {currentDayPlan.activities.length} Tujuan Dipilih
                          </span>
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
                      </div>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Bisa geser urutan &amp; atur jam (opsional)</span>
                      </span>
                    </div>
                  </div>

                  {/* EMPTY DAY PROMPT IF NO STOPS ADDED YET */}
                  {currentDayPlan.activities.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center flex flex-col items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-xs">
                        <h3 className="font-bold text-sm text-slate-800">
                          Hari {currentDayPlan.day} Masih Kosong
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Pilih destinasi dari daftar hasil ekstraksi AI di atas
                          dengan klik tombol{" "}
                          <strong className="text-primary">
                            + Add Hari {currentDayPlan.day}
                          </strong>
                          , atau susun otomatis sekaligus.
                        </p>
                      </div>
                      {candidatePlaces.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setPoolOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-primary text-xs font-bold text-slate-700"
                          >
                            Lihat Daftar Destinasi ({candidatePlaces.length})
                          </button>
                          <button
                            type="button"
                            onClick={handleAutoArrangeAllCandidates}
                            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Auto-Susun Semua Hari</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* VERTICAL LINE ACTIVITY TRACKING FEED (REORDERABLE + OPTIONAL TIME) */
                    <div className="relative flex flex-col pl-1">
                      {currentDayPlan.activities.length > 1 && (
                        <div className="absolute top-5 bottom-8 left-[19px] w-[2px] bg-slate-200 -translate-x-1/2 z-0" />
                      )}

                      {currentDayPlan.activities.map((act, idx) => {
                        const isFirst = idx === 0;
                        const isLast =
                          idx === currentDayPlan.activities.length - 1;
                        const isOrange =
                          act.isHighlightOrange ||
                          (isLast && currentDayPlan.activities.length >= 4);

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

                        const transit = act.transitToNext;
                        const isCardSelected = activeStopIdx === idx;

                        return (
                          <React.Fragment
                            key={act.id || `${currentDayPlan.day}-${idx}`}
                          >
                            <div
                              draggable
                              onDragStart={() => setDraggedIdx(idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (
                                  draggedIdx !== null &&
                                  draggedIdx !== idx
                                ) {
                                  handleMoveActivityOrder(
                                    currentDayPlan.day,
                                    draggedIdx,
                                    idx
                                  );
                                }
                                setDraggedIdx(null);
                              }}
                              onDragEnd={() => setDraggedIdx(null)}
                              onClick={() =>
                                handleFocusStop(currentDayPlan.day, idx)
                              }
                              className={`relative z-10 flex items-start gap-3 sm:gap-3.5 cursor-pointer transition-opacity ${
                                draggedIdx === idx ? "opacity-50" : "opacity-100"
                              } ${isLast ? "" : "pb-3.5"}`}
                            >
                              {/* Numbered Node + Reorder Arrows */}
                              <div className="shrink-0 flex flex-col items-center gap-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm font-bold text-xs transition-transform ${
                                    isOrange
                                      ? "bg-secondary-container text-white"
                                      : "bg-primary text-white"
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                {currentDayPlan.activities.length > 1 && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex flex-col items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/70"
                                  >
                                    <button
                                      type="button"
                                      disabled={isFirst}
                                      onClick={() =>
                                        handleMoveActivityOrder(
                                          currentDayPlan.day,
                                          idx,
                                          idx - 1
                                        )
                                      }
                                      className="p-0.5 text-slate-500 hover:text-primary disabled:opacity-30"
                                      title="Geser urutan ke atas"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <GripVertical className="w-3 h-3 text-slate-300 my-0.5 cursor-grab" />
                                    <button
                                      type="button"
                                      disabled={isLast}
                                      onClick={() =>
                                        handleMoveActivityOrder(
                                          currentDayPlan.day,
                                          idx,
                                          idx + 1
                                        )
                                      }
                                      className="p-0.5 text-slate-500 hover:text-primary disabled:opacity-30"
                                      title="Geser urutan ke bawah"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Clean Activity Card */}
                              <div
                                className={`flex-1 min-w-0 bg-white rounded-2xl border p-3 sm:p-3.5 flex flex-col gap-2.5 transition-all ${
                                  isCardSelected
                                    ? "border-primary ring-2 ring-primary/15 shadow-md"
                                    : "border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:border-slate-300"
                                }`}
                              >
                                {/* Top Bar: Optional Time Editor + Category Badge + Delete */}
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex flex-wrap items-center justify-between gap-1.5"
                                >
                                  {/* Optional Time Input */}
                                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 focus-within:border-primary focus-within:bg-white rounded-lg px-2 py-1">
                                    <Clock
                                      className={`w-3 h-3 shrink-0 ${
                                        act.time?.trim()
                                          ? isOrange
                                            ? "text-secondary-container"
                                            : "text-primary"
                                          : "text-slate-400"
                                      }`}
                                    />
                                    <input
                                      type="text"
                                      value={act.time || ""}
                                      onChange={(e) =>
                                        handleUpdateActivityTime(
                                          currentDayPlan.day,
                                          idx,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Jam (Opsional, misal 09:00)"
                                      className="w-36 sm:w-40 text-[11px] font-semibold text-on-surface placeholder:text-slate-400 placeholder:font-normal bg-transparent focus:outline-none"
                                    />
                                    {act.time?.trim() ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateActivityTime(
                                            currentDayPlan.day,
                                            idx,
                                            ""
                                          )
                                        }
                                        className="text-slate-400 hover:text-slate-600"
                                        title="Kosongkan jam (opsional)"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    ) : act.recommendedTime ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateActivityTime(
                                            currentDayPlan.day,
                                            idx,
                                            act.recommendedTime || "09:00 - 11:00"
                                          )
                                        }
                                        className="text-[10px] font-bold text-primary hover:underline whitespace-nowrap"
                                        title={`Gunakan saran waktu AI: ${act.recommendedTime}`}
                                      >
                                        Saran: {act.recommendedTime.split(" ")[0]}
                                      </button>
                                    ) : null}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {act.city && (
                                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                        {act.city}
                                      </span>
                                    )}
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold max-w-full truncate ${
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

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveActivityFromDay(
                                          currentDayPlan.day,
                                          idx
                                        )
                                      }
                                      className="p-1 rounded-lg text-slate-400 hover:text-error hover:bg-red-50 transition-colors"
                                      title="Hapus dari hari ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Main Details */}
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                    <img
                                      alt={act.placeName}
                                      className="w-full h-full object-cover"
                                      src={imgSrc}
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                                    <h3 className="font-bold text-sm text-on-surface leading-snug line-clamp-2 break-words">
                                      {act.placeName}
                                    </h3>
                                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed break-words">
                                      {act.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Footer Line: Tips + Move Day Dropdown + Petunjuk */}
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                                  <div className="text-slate-500 flex items-start gap-1.5 min-w-0 flex-1">
                                    <Lightbulb className="w-3.5 h-3.5 text-secondary-container shrink-0 mt-0.5" />
                                    <span className="line-clamp-1 leading-snug break-words">
                                      {act.footerText || act.tips}
                                    </span>
                                  </div>

                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 shrink-0"
                                  >
                                    {itinerary.days.length > 1 && (
                                      <select
                                        value={currentDayPlan.day}
                                        onChange={(e) =>
                                          handleMoveActivityToAnotherDay(
                                            currentDayPlan.day,
                                            idx,
                                            Number(e.target.value)
                                          )
                                        }
                                        className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold focus:outline-none cursor-pointer"
                                        title="Pindahkan ke hari lain"
                                      >
                                        {itinerary.days.map((d) => (
                                          <option key={d.day} value={d.day}>
                                            Hari {d.day}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
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
                  )}

                  {/* ==================== ADD CUSTOM MANUAL DESTINATION TO DAY ==================== */}
                  {showCustomPlaceForm ? (
                    <form
                      onSubmit={handleAddCustomPlace}
                      className="rounded-2xl border border-primary/30 bg-white p-3.5 flex flex-col gap-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          + Tambah Tujuan Manual ke Hari {currentDayPlan.day}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCustomPlaceForm(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={customPlaceName}
                          onChange={(e) => setCustomPlaceName(e.target.value)}
                          placeholder="Nama Tempat / Hotel / Restoran..."
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={customPlaceCity}
                          onChange={(e) => setCustomPlaceCity(e.target.value)}
                          placeholder={`Kota (Default: ${
                            currentDayPlan.city || itinerary.destination
                          })`}
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={customPlaceCategory}
                          onChange={(e) =>
                            setCustomPlaceCategory(
                              e.target.value as ActivityCategory
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-primary"
                        >
                          <option value="sightseeing">Wisata</option>
                          <option value="food">Kuliner</option>
                          <option value="activity">Aktivitas</option>
                          <option value="stay">Hotel / Stay</option>
                        </select>
                        <input
                          type="text"
                          value={customPlaceTime}
                          onChange={(e) => setCustomPlaceTime(e.target.value)}
                          placeholder="Jam (Opsional, misal 10:00)"
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      <input
                        type="text"
                        value={customPlaceDesc}
                        onChange={(e) => setCustomPlaceDesc(e.target.value)}
                        placeholder="Catatan singkat (opsional)..."
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-primary"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCustomPlaceForm(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isAddingCustomPlace}
                          className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1"
                        >
                          {isAddingCustomPlace ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Tambahkan ke Hari {currentDayPlan.day}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomPlaceForm(true)}
                        className="flex-1 py-2.5 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-primary text-slate-600 hover:text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Tujuan Manual ke Hari {currentDayPlan.day}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddNewDay()}
                        className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-primary-fixed/60 text-slate-700 hover:text-primary text-xs font-bold flex items-center justify-center gap-1 transition-colors shrink-0"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>+ Hari {itinerary.days.length + 1}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
            onAddCandidate={(cand) => {
              handleAddCandidateToDay(cand, targetDayNumber);
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
          <span>Builder &amp; Rute</span>
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
