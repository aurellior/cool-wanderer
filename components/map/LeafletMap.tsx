"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ActivityCategory, ActivityItem, ItineraryData } from "@/lib/schema";
import { Maximize2 } from "lucide-react";

export interface FocusedStop {
  day: number;
  activityIndex: number;
  candidateId?: string;
  timestamp: number;
}

interface LeafletMapProps {
  itinerary: ItineraryData;
  selectedDay: number | "all";
  focusedStop: FocusedStop | null;
  onSelectActivity?: (day: number, activityIndex: number) => void;
  onAddCandidate?: (candidate: ActivityItem) => void;
  onOpenGoogleMapsRoute?: () => void;
}

const CATEGORY_CONFIG: Record<
  ActivityCategory,
  { label: string; color: string }
> = {
  food: { label: "Kuliner", color: "#f97316" },
  sightseeing: { label: "Wisata", color: "#0d9488" },
  activity: { label: "Aktivitas", color: "#6366f1" },
  stay: { label: "Stay", color: "#2563eb" },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function LeafletMap({
  itinerary,
  selectedDay,
  focusedStop,
  onSelectActivity,
  onAddCandidate,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const onAddCandidateRef = useRef(onAddCandidate);

  useEffect(() => {
    onAddCandidateRef.current = onAddCandidate;
  }, [onAddCandidate]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [-7.7956, 110.3695],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Official OpenStreetMap Standard Tile Server
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markersMapRef.current.clear();

    const filteredDays =
      selectedDay === "all"
        ? itinerary.days
        : itinerary.days.filter((d) => d.day === selectedDay);

    const allBoundsPoints: L.LatLngExpression[] = [];
    const placedPositions: { lat: number; lng: number }[] = [];
    const addedPlaceNames = new Set<string>();
    let globalOrder = 1;

    // 1. Plot Added Activities in Days (Numbered Route Pins + Polyline)
    filteredDays.forEach((dayPlan) => {
      const dayCoords: L.LatLngExpression[] = [];

      dayPlan.activities.forEach((act: ActivityItem, actIdx: number) => {
        addedPlaceNames.add(act.placeName.toLowerCase().trim());
        const rawLat = act.location.lat;
        const rawLng = act.location.lng;
        const { address } = act.location;
        if (typeof rawLat !== "number" || typeof rawLng !== "number") return;

        let displayLat = rawLat;
        let displayLng = rawLng;
        const nearbyCount = placedPositions.filter(
          (pos) =>
            Math.abs(pos.lat - rawLat) < 0.00035 &&
            Math.abs(pos.lng - rawLng) < 0.00035
        ).length;

        if (nearbyCount > 0) {
          const angle = (nearbyCount * 2 * Math.PI) / 6;
          const offsetRadius = 0.00045 * Math.ceil(nearbyCount / 6);
          displayLat = rawLat + Math.sin(angle) * offsetRadius;
          displayLng = rawLng + Math.cos(angle) * offsetRadius;
        }
        placedPositions.push({ lat: rawLat, lng: rawLng });

        const latLng: L.LatLngExpression = [displayLat, displayLng];
        dayCoords.push(latLng);
        allBoundsPoints.push(latLng);

        const catConfig =
          CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.sightseeing;
        const stopNumber = selectedDay === "all" ? globalOrder : actIdx + 1;
        globalOrder++;

        const pinColor = act.isHighlightOrange ? "#fd761a" : catConfig.color;

        const customIcon = L.divIcon({
          className: "socialtrip-clean-pin",
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 9999px;
              background: ${pinColor};
              color: #ffffff;
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              font-weight: 800;
              font-size: 13px;
              border: 2.5px solid #ffffff;
              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.32);
              cursor: pointer;
            ">${stopNumber}</div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${act.placeName} ${address}`
        )}`;

        const timeMetaText = act.time?.trim()
          ? escapeHtml(act.time.trim())
          : `Urutan #${stopNumber}`;
        const cityMetaText = act.city ? ` • ${escapeHtml(act.city)}` : "";

        const popupHtml = `
          <div style="font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; min-width: 190px; max-width: 240px; padding: 2px;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 3px; font-weight: 600;">
              Hari ${dayPlan.day}${cityMetaText} • ${timeMetaText}
            </div>
            <div style="font-weight: 700; font-size: 13.5px; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">
              ${stopNumber}. ${escapeHtml(act.placeName)}
            </div>
            <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; line-height: 1.45;">
              ${escapeHtml(act.description)}
            </p>
            <a
              href="${gmapsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: inline-block;
                font-weight: 700;
                font-size: 11.5px;
                color: #005c55;
                text-decoration: none;
              "
            >
              Buka di Google Maps ↗
            </a>
          </div>
        `;

        const marker = L.marker(latLng, {
          icon: customIcon,
          zIndexOffset: stopNumber * 20 + 100,
        }).bindPopup(popupHtml, { maxWidth: 250 });

        marker.on("click", () => {
          onSelectActivity?.(dayPlan.day, actIdx);
        });

        marker.addTo(layerGroup);
        markersMapRef.current.set(`${dayPlan.day}-${actIdx}`, marker);
      });

      if (dayCoords.length > 1) {
        L.polyline(dayCoords, {
          color: "#005c55",
          weight: 3.5,
          opacity: 0.85,
          dashArray: "6, 8",
        }).addTo(layerGroup);
      }
    });

    // 2. Also plot Unadded Candidate Destinations from candidatePlaces as Preview (+) Markers
    const allDaysAddedNames = new Set(
      itinerary.days.flatMap((d) =>
        d.activities.map((a) => a.placeName.toLowerCase().trim())
      )
    );

    const candidates = itinerary.candidatePlaces || [];
    const activeDayNumber =
      typeof selectedDay === "number"
        ? selectedDay
        : itinerary.days[0]?.day || 1;

    candidates.forEach((cand, candIdx) => {
      const normalizedName = cand.placeName.toLowerCase().trim();
      if (
        addedPlaceNames.has(normalizedName) ||
        allDaysAddedNames.has(normalizedName)
      ) {
        return;
      }

      const rawLat = cand.location?.lat;
      const rawLng = cand.location?.lng;
      if (typeof rawLat !== "number" || typeof rawLng !== "number") return;

      let displayLat = rawLat;
      let displayLng = rawLng;
      const nearbyCount = placedPositions.filter(
        (pos) =>
          Math.abs(pos.lat - rawLat) < 0.00035 &&
          Math.abs(pos.lng - rawLng) < 0.00035
      ).length;

      if (nearbyCount > 0) {
        const angle = (nearbyCount * 2 * Math.PI) / 6;
        const offsetRadius = 0.00045 * Math.ceil(nearbyCount / 6);
        displayLat = rawLat + Math.sin(angle) * offsetRadius;
        displayLng = rawLng + Math.cos(angle) * offsetRadius;
      }
      placedPositions.push({ lat: rawLat, lng: rawLng });

      const latLng: L.LatLngExpression = [displayLat, displayLng];
      // Include candidate points in bounds if current day has 0 added activities or viewing all
      if (allBoundsPoints.length === 0 || selectedDay === "all") {
        allBoundsPoints.push(latLng);
      }

      const catConfig =
        CATEGORY_CONFIG[cand.category] || CATEGORY_CONFIG.sightseeing;

      const candidateIcon = L.divIcon({
        className: "socialtrip-candidate-pin",
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 9999px;
            background: #ffffff;
            color: ${catConfig.color};
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-weight: 800;
            font-size: 15px;
            border: 2.5px dashed ${catConfig.color};
            box-shadow: 0 3px 10px rgba(15, 23, 42, 0.22);
            cursor: pointer;
          ">+</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const popupContainer = document.createElement("div");
      popupContainer.style.fontFamily =
        "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
      popupContainer.style.minWidth = "195px";
      popupContainer.style.maxWidth = "240px";
      popupContainer.style.padding = "2px";

      popupContainer.innerHTML = `
        <div style="font-size: 10.5px; color: #0d9488; margin-bottom: 3px; font-weight: 700; text-transform: uppercase;">
          Kandidat AI${cand.city ? ` • ${escapeHtml(cand.city)}` : ""}
        </div>
        <div style="font-weight: 700; font-size: 13.5px; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">
          ${escapeHtml(cand.placeName)}
        </div>
        <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; line-height: 1.45;">
          ${escapeHtml(cand.description)}
        </p>
      `;

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.textContent = `+ Add ke Hari ${activeDayNumber}`;
      addBtn.style.cssText = `
        width: 100%;
        padding: 6px 10px;
        border-radius: 8px;
        background: #005c55;
        color: #ffffff;
        font-weight: 700;
        font-size: 11.5px;
        border: none;
        cursor: pointer;
      `;
      addBtn.onclick = () => {
        onAddCandidateRef.current?.(cand);
        map.closePopup();
      };
      popupContainer.appendChild(addBtn);

      const candKey = cand.id || `cand-${candIdx}`;
      const marker = L.marker(latLng, {
        icon: candidateIcon,
        zIndexOffset: 10,
      }).bindPopup(popupContainer, { maxWidth: 250 });

      marker.addTo(layerGroup);
      markersMapRef.current.set(`cand-${candKey}`, marker);
    });

    // If current day was empty, ensure bounds cover all placed markers
    const pointsToFit =
      allBoundsPoints.length > 0
        ? allBoundsPoints
        : placedPositions.map(
            (p): L.LatLngExpression => [p.lat, p.lng]
          );

    if (pointsToFit.length > 0) {
      const bounds = L.latLngBounds(pointsToFit);
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15 });
      }, 120);
    }
  }, [itinerary, selectedDay, onSelectActivity]);

  useEffect(() => {
    if (!focusedStop || !mapInstanceRef.current) return;
    const key = focusedStop.candidateId
      ? `cand-${focusedStop.candidateId}`
      : `${focusedStop.day}-${focusedStop.activityIndex}`;
    const marker = markersMapRef.current.get(key);
    if (marker) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.flyTo(marker.getLatLng(), 16, { duration: 0.85 });
      marker.openPopup();
    }
  }, [focusedStop]);

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const points: L.LatLng[] = [];
    markersMapRef.current.forEach((m) => points.push(m.getLatLng()));
    if (points.length > 0) {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 15 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[360px] bg-slate-100 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Overlay Bar: Category Legend (Left) + Reset Map Button (Right) */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2 pointer-events-none">
        {/* Category Legend Pill */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-slate-200/90 flex flex-wrap items-center gap-x-3 gap-y-1 max-w-[calc(100%-115px)]">
          {(
            Object.entries(CATEGORY_CONFIG) as [
              ActivityCategory,
              { label: string; color: string }
            ][]
          ).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="text-[11px] text-slate-700 font-semibold whitespace-nowrap">
                {cfg.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
            <span className="w-3.5 h-3.5 rounded-full border border-dashed border-primary text-primary text-[10px] font-extrabold inline-flex items-center justify-center shrink-0">
              +
            </span>
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
              Kandidat AI
            </span>
          </div>
        </div>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={handleFitBounds}
          className="pointer-events-auto shrink-0 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 text-xs font-semibold shadow-sm border border-slate-200/90 flex items-center gap-1.5 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Reset Peta</span>
        </button>
      </div>
    </div>
  );
}
