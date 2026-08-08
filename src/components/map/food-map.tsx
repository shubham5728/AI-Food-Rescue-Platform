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
  type: "donor" | "recipient" | "donation" | "metro";
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

// Tile layers definitions
const TILE_LAYERS = {
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    name: "Light Voyager",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    name: "Dark Dispatch",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    name: "Satellite HD",
  },
};

// Ahmedabad Metro Line 1 (East-West / Red Line) Stations
const METRO_LINE_1: [number, number][] = [
  [23.0510, 72.5020], // Thaltej Gam
  [23.0460, 72.5250], // Drive-In
  [23.0420, 72.5350], // Gurukul Road
  [23.0370, 72.5510], // Commerce Six Roads / GU
  [23.0360, 72.5620], // Navrangpura
  [23.0340, 72.5710], // Old High Court (Interchange)
  [23.0330, 72.5800], // Shahpur
  [23.0300, 72.5870], // Gheekanta
  [23.0250, 72.5990], // Kalupur Railway Station
  [23.0110, 72.6050], // Kankaria East
  [23.0070, 72.6180], // Apparel Park
  [22.9980, 72.6560], // Vastral Gam
];

// Ahmedabad Metro Line 2 (North-South / Blue Line) Stations
const METRO_LINE_2: [number, number][] = [
  [23.1070, 72.5930], // Motera Stadium
  [23.0820, 72.5900], // Sabarmati
  [23.0710, 72.5820], // Ranip
  [23.0560, 72.5740], // Vadaj
  [23.0470, 72.5720], // Vijay Nagar
  [23.0400, 72.5715], // Usmanpura
  [23.0340, 72.5710], // Old High Court (Interchange)
  [23.0240, 72.5680], // Gandhigram
  [23.0130, 72.5620], // Paldi
  [23.0060, 72.5530], // Shreyas
  [22.9980, 72.5450], // Vasna
  [22.9890, 72.5390], // APMC Market
];

const METRO_STATIONS = [
  { name: "Thaltej Gam Metro", lat: 23.0510, lng: 72.5020, line: "Line 1 (East-West)" },
  { name: "Commerce Six Roads Metro", lat: 23.0370, lng: 72.5510, line: "Line 1 (East-West)" },
  { name: "Old High Court Interchange Metro", lat: 23.0340, lng: 72.5710, line: "Line 1 & 2 Interchange" },
  { name: "Kalupur Railway Station Metro", lat: 23.0250, lng: 72.5990, line: "Line 1 (East-West)" },
  { name: "Paldi Metro Station", lat: 23.0130, lng: 72.5620, line: "Line 2 (North-South)" },
  { name: "Motera Stadium Metro", lat: 23.1070, lng: 72.5930, line: "Line 2 (North-South)" },
];

function createPinIcon(color: string, symbol: string, isUrgent = false) {
  const pulseHtml = isUrgent ? '<div class="marker-radar-pulse"></div>' : "";
  const svg = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="44" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="12" r="7.5" fill="#ffffff"/>
        <text x="12" y="15.5" font-size="10" font-weight="bold" text-anchor="middle">${symbol}</text>
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-leaflet-marker",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  });
}

const DONOR_ICON = createPinIcon("#16a34a", "🏪");
const RECIPIENT_ICON = createPinIcon("#2563eb", "🏢");
const URGENT_ICON = createPinIcon("#dc2626", "🔥", true);
const METRO_ICON = createPinIcon("#9333ea", "🚊");

export function FoodMap({
  markers = [],
  routes = [],
  center = [23.0225, 72.5714],
  zoom = 12,
  height = "460px",
  className = "",
}: FoodMapProps) {
  const { t } = useLanguage();
  const [tileMode, setTileMode] = useState<"voyager" | "dark" | "satellite">("voyager");
  const [showMetro, setShowMetro] = useState(true);

  const mapId = "foodbridge-real-map-v2";

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

    // Active Tile Layer
    const selectedTile = TILE_LAYERS[tileMode];
    L.tileLayer(selectedTile.url, {
      maxZoom: 19,
      attribution: selectedTile.attribution,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    // 1. Add Metro Rail Network (Lines & Stations) if enabled
    if (showMetro) {
      // Line 1: Red Corridor
      const line1 = L.polyline(METRO_LINE_1, {
        color: "#e11d48",
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      line1.bindTooltip("Ahmedabad Metro Line 1 (Thaltej ↔ Vastral)", { sticky: true });

      // Line 2: Blue Corridor
      const line2 = L.polyline(METRO_LINE_2, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      line2.bindTooltip("Ahmedabad Metro Line 2 (Motera ↔ APMC)", { sticky: true });

      // Metro Station Markers
      METRO_STATIONS.forEach((st) => {
        const stationMarker = L.marker([st.lat, st.lng], { icon: METRO_ICON }).addTo(map);
        stationMarker.bindPopup(`
          <div style="padding: 10px; font-family: system-ui;">
            <div style="display: flex; items-center; gap: 6px; color: #7e22ce; font-weight: 700; font-size: 13px;">
              🚊 ${st.name}
            </div>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">${st.line}</p>
          </div>
        `);
      });
    }

    // 2. Add Donors & Recipient Markers
    markers.forEach((m) => {
      let icon = DONOR_ICON;
      if (m.type === "recipient") icon = RECIPIENT_ICON;
      if (m.type === "donation" && m.riskLevel === "HIGH") icon = URGENT_ICON;

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      bounds.extend([m.lat, m.lng]);

      const popupHtml = `
        <div style="padding: 12px; font-family: system-ui; min-width: 200px;">
          <div style="display: flex; items-center; justify-content: space-between; gap: 8px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${m.title}</h4>
          </div>
          ${m.subtitle ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">${m.subtitle}</p>` : ""}
          ${m.address ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">📍 ${m.address}</p>` : ""}
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${m.meals ? `<span style="background: #10b98115; color: #047857; border: 1px solid #10b98130; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🍲 ${m.meals} meals</span>` : ""}
            ${m.riskLevel === "HIGH" ? `<span style="background: #ef444415; color: #b91c1c; border: 1px solid #ef444430; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🔥 Urgent Rescue</span>` : ""}
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    // 3. Add Rescue Delivery Routes with Animated Vehicle Marker
    routes.forEach((r) => {
      const polyline = L.polyline(
        [
          [r.fromLat, r.fromLng],
          [r.toLat, r.toLng],
        ],
        {
          color: "#10b981",
          weight: 4,
          opacity: 0.9,
          dashArray: "8, 10",
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
  }, [markers, routes, center, zoom, tileMode, showMetro, t]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border/80 shadow-md ${className}`}>
      {/* Top Floating Control Toolbar */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-1.5 rounded-xl bg-background/90 p-1.5 backdrop-blur border border-border shadow-sm">
        <button
          type="button"
          onClick={() => setTileMode("voyager")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            tileMode === "voyager" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          🗺️ Voyager Light
        </button>
        <button
          type="button"
          onClick={() => setTileMode("dark")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            tileMode === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          🌙 Dark Dispatch
        </button>
        <button
          type="button"
          onClick={() => setTileMode("satellite")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            tileMode === "satellite" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          🛰️ Satellite HD
        </button>

        <span className="h-4 w-px bg-border mx-1" />

        <button
          type="button"
          onClick={() => setShowMetro(!showMetro)}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors flex items-center gap-1 ${
            showMetro ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          🚈 Ahmedabad Metro {showMetro ? "ON" : "OFF"}
        </button>
      </div>

      {/* Map Container */}
      <div id={mapId} style={{ height }} className="w-full z-10" />
    </div>
  );
}
