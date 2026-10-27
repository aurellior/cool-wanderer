"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ActivityCategory, ActivityItem, ItineraryData } from "@/lib/schema";
import { Maximize2 } from "lucide-react";

export interface FocusedStop {
  day: number;
  activityIndex: number;
  timestamp: number;
}

interface LeafletMapProps {
  itinerary: ItineraryData;
  selectedDay: number | "all";
  focusedStop: FocusedStop | null;
  onSelectActivity?: (day: number, activityIndex: number) => void;
  onOpenGoogleMapsRoute?: () => void;
}

const CATEGORY_CONFIG: Record<
  ActivityCategory,
  { label: string; color: string }
> = {
  food: { label: "Food", color: "#f97316" },
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
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [35.6762, 139.6503],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Official OpenStreetMap Standard Tile Server (100% Free, No API Key Required)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Keep map size synced when container resizes or toggles visibility
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
    let globalOrder = 1;

    filteredDays.forEach((dayPlan) => {
      const dayCoords: L.LatLngExpression[] = [];

      dayPlan.activities.forEach((act: ActivityItem, actIdx: number) => {
        const { lat, lng, address } = act.location;
        if (typeof lat !== "number" || typeof lng !== "number") return;

        const latLng: L.LatLngExpression = [lat, lng];
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
              width: 30px;
              height: 30px;
              border-radius: 9999px;
              background: ${pinColor};
              color: #ffffff;
              font-family: system-ui, -apple-system, sans-serif;
              font-weight: 700;
              font-size: 12px;
              border: 2.5px solid #ffffff;
              box-shadow: 0 3px 10px rgba(15, 23, 42, 0.3);
              cursor: pointer;
            ">${stopNumber}</div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        });

        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${act.placeName} ${address}`
        )}`;

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; max-width: 240px;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">
              Hari ${dayPlan.day} • ${escapeHtml(act.time)}
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
              ${stopNumber}. ${escapeHtml(act.placeName)}
            </div>
            <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">
              ${escapeHtml(act.description)}
            </p>
            <a
              href="${gmapsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: inline-block;
                font-weight: 600;
                font-size: 12px;
                color: #005c55;
                text-decoration: none;
              "
            >
              Buka di Google Maps ↗
            </a>
          </div>
        `;

        const marker = L.marker(latLng, { icon: customIcon }).bindPopup(
          popupHtml,
          { maxWidth: 260 }
        );

        marker.on("click", () => {
          onSelectActivity?.(dayPlan.day, actIdx);
        });

        marker.addTo(layerGroup);
        markersMapRef.current.set(`${dayPlan.day}-${actIdx}`, marker);
      });

      if (dayCoords.length > 1) {
        L.polyline(dayCoords, {
          color: "#005c55",
          weight: 3,
          opacity: 0.75,
          dashArray: "6, 6",
        }).addTo(layerGroup);
      }
    });

    if (allBoundsPoints.length > 0) {
      const bounds = L.latLngBounds(allBoundsPoints);
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }, 100);
    }
  }, [itinerary, selectedDay, onSelectActivity]);

  useEffect(() => {
    if (!focusedStop || !mapInstanceRef.current) return;
    const key = `${focusedStop.day}-${focusedStop.activityIndex}`;
    const marker = markersMapRef.current.get(key);
    if (marker) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.flyTo(marker.getLatLng(), 16, { duration: 0.9 });
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
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Minimal Reset View Button */}
      <button
        type="button"
        onClick={handleFitBounds}
        className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 flex items-center gap-1.5 transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5 text-primary" />
        <span>Reset Peta</span>
      </button>

      {/* Minimal Category Legend Pill */}
      <div className="absolute bottom-4 left-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-3">
        {(
          Object.entries(CATEGORY_CONFIG) as [
            ActivityCategory,
            { label: string; color: string }
          ][]
        ).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: cfg.color }}
            />
            <span className="text-[11px] text-slate-600 font-medium">
              {cfg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
