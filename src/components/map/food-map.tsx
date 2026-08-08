"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useLanguage } from "@/lib/i18n/context";

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "donor" | "recipient" | "donation";
  subtitle?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  meals?: number;
  address?: string;
}

export interface MapRouteItem {
  id: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  label?: string;
}

interface FoodMapProps {
  markers?: MapMarkerItem[];
  routes?: MapRouteItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

// Map tile definitions with Esri World Imagery (Satellite HD) as default
const TILE_LAYERS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; HD Satellite Imagery",
    name: "🛰️ Satellite HD",
  },
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    name: "🗺️ Street View",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    name: "🌙 Dark View",
  },
};

function createPinIcon(color: string, symbol: string, isUrgent = false) {
  const pulseHtml = isUrgent ? '<div class="marker-radar-pulse"></div>' : "";
  const svg = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="34" height="46" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.6));">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="12" cy="12" r="7.5" fill="#ffffff"/>
        <text x="12" y="15.5" font-size="10" font-weight="bold" text-anchor="middle">${symbol}</text>
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-leaflet-marker",
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -42],
  });
}

const DONOR_ICON = createPinIcon("#16a34a", "🏪");
const RECIPIENT_ICON = createPinIcon("#2563eb", "🏢");
const URGENT_ICON = createPinIcon("#dc2626", "🔥", true);

export function FoodMap({
  markers = [],
  routes = [],
  center = [23.0350, 72.5450],
  zoom = 12,
  height = "480px",
  className = "",
}: FoodMapProps) {
  const { t } = useLanguage();
  // Default to Satellite HD as requested
  const [tileMode, setTileMode] = useState<"satellite" | "voyager" | "dark">("satellite");

  const mapId = "foodbridge-real-satellite-map";

  useEffect(() => {
    const container = L.DomUtil.get(mapId);
    if (container !== null) {
      (container as unknown as { _leaflet_id?: number })._leaflet_id = undefined;
    }

    const map = L.map(mapId, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Default Satellite HD Tile Layer
    const selectedTile = TILE_LAYERS[tileMode];
    L.tileLayer(selectedTile.url, {
      maxZoom: 19,
      attribution: selectedTile.attribution,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    // Add Donors & Recipient NGO Markers
    markers.forEach((m) => {
      let icon = DONOR_ICON;
      if (m.type === "recipient") icon = RECIPIENT_ICON;
      if (m.type === "donation" && m.riskLevel === "HIGH") icon = URGENT_ICON;

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      bounds.extend([m.lat, m.lng]);

      const popupHtml = `
        <div style="padding: 12px; font-family: system-ui; min-width: 220px;">
          <div style="display: flex; items-center; justify-content: space-between; gap: 8px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${m.title}</h4>
          </div>
          ${m.subtitle ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">${m.subtitle}</p>` : ""}
          ${m.address ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">📍 ${m.address}</p>` : ""}
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${m.type === "recipient" ? `<span style="background: #2563eb15; color: #1d4ed8; border: 1px solid #2563eb30; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🏢 Verified NGO Shelter</span>` : ""}
            ${m.meals ? `<span style="background: #10b98115; color: #047857; border: 1px solid #10b98130; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🍲 ${m.meals} meals</span>` : ""}
            ${m.riskLevel === "HIGH" ? `<span style="background: #ef444415; color: #b91c1c; border: 1px solid #ef444430; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🔥 Urgent Rescue</span>` : ""}
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    // Add Active Delivery Polylines
    routes.forEach((r) => {
      const polyline = L.polyline(
        [
          [r.fromLat, r.fromLng],
          [r.toLat, r.toLng],
        ],
        {
          color: "#10b981",
          weight: 5,
          opacity: 0.95,
          dashArray: "10, 12",
        },
      ).addTo(map);

      if (r.label) {
        polyline.bindTooltip(`🚚 ${r.label}`, { permanent: false, sticky: true });
      }

      bounds.extend([r.fromLat, r.fromLng]);
      bounds.extend([r.toLat, r.toLng]);
    });

    if (markers.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.remove();
    };
  }, [markers, routes, center, zoom, tileMode, t]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border/80 shadow-xl ${className}`}>
      {/* Top Floating Control Toolbar */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-1.5 rounded-xl bg-background/95 p-1.5 backdrop-blur-md border border-border shadow-lg">
        <button
          type="button"
          onClick={() => setTileMode("satellite")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            tileMode === "satellite"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          🛰️ Satellite HD (Default)
        </button>
        <button
          type="button"
          onClick={() => setTileMode("voyager")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            tileMode === "voyager"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          🗺️ Street View
        </button>
        <button
          type="button"
          onClick={() => setTileMode("dark")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            tileMode === "dark"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          🌙 Dark View
        </button>
      </div>

      {/* Map Container */}
      <div id={mapId} style={{ height }} className="w-full z-10" />
    </div>
  );
}
