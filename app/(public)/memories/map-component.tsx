"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Memory } from "./page";

// GIKI campus — Topi, Swabi, KPK (academic block near Helipad & Medical Center)
const GIKI_CENTER: [number, number] = [34.0725, 72.6445];

// Strict campus bounds — pins outside this box are rejected
const CAMPUS_BOUNDS = {
  south: 34.058,
  north: 34.092,
  west:  72.625,
  east:  72.668,
} as const;

const TYPE_COLORS: Record<Memory["type"], string> = {
  STORY:     "#3b82f6",
  MILESTONE: "#22c55e",
  FUNNY:     "#f59e0b",
  PHOTO:     "#ec4899",
};

const TYPE_EMOJI: Record<Memory["type"], string> = {
  STORY: "📖", MILESTONE: "🏆", FUNNY: "😂", PHOTO: "📸",
};

function makeIcon(type: Memory["type"]) {
  const color = TYPE_COLORS[type];
  const svg = `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" d="M16 0C7.163 0 0 7.163 0 16c0 9 16 26 16 26s16-17 16-26C32 7.163 24.837 0 16 0z"/>
    <circle fill="white" cx="16" cy="16" r="10"/>
    <text x="16" y="21" text-anchor="middle" font-size="12">${TYPE_EMOJI[type]}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    iconSize:   [32, 42],
    iconAnchor: [16, 42],
    popupAnchor:[0, -42],
    className:  "",
  });
}

export default function MapComponent({
  memories,
  onMarkerClick,
  onMapClick,
}: {
  memories:      Memory[];
  onMarkerClick: (m: Memory) => void;
  onMapClick:    (lat: number, lng: number) => void;
}) {
  const containerRef      = useRef<HTMLDivElement>(null);
  const mapRef            = useRef<L.Map | null>(null);
  const markersRef        = useRef<L.Marker[]>([]);
  const locationDotRef    = useRef<L.CircleMarker | null>(null);
  const [locating, setLocating] = useState(false);

  // Initialize map once — cleanup fully removes it so StrictMode remount is safe
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Fix default icon paths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const campusBounds = L.latLngBounds(
      [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
      [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east]
    );

    const map = L.map(containerRef.current, {
      center:          GIKI_CENTER,
      zoom:            16,
      minZoom:         14,
      maxZoom:         19,
      maxBounds:       campusBounds.pad(0.15),
      maxBoundsViscosity: 1.0,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (!campusBounds.contains([lat, lng])) {
        L.popup()
          .setLatLng(e.latlng)
          .setContent('<div style="font-size:13px;padding:2px 4px">📍 Please pin within GIKI campus</div>')
          .openOn(map);
        return;
      }
      onMapClick(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      locationDotRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever memories list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    memories.forEach((mem) => {
      const marker = L.marker([mem.lat, mem.lng], { icon: makeIcon(mem.type) })
        .addTo(map)
        .bindPopup(`
          <div style="max-width:200px;font-size:13px;">
            <p style="font-weight:700;color:#111;">${mem.locationName}</p>
            <p style="color:#555;margin-top:4px;">${mem.message}</p>
          </div>
        `);

      marker.on("click", () => onMarkerClick(mem));
      markersRef.current.push(marker);
    });
  }, [memories, onMarkerClick]);

  function isOnCampus(lat: number, lng: number) {
    return (
      lat >= CAMPUS_BOUNDS.south && lat <= CAMPUS_BOUNDS.north &&
      lng >= CAMPUS_BOUNDS.west  && lng <= CAMPUS_BOUNDS.east
    );
  }

  function handleLocate() {
    if (!mapRef.current || locating) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        const map = mapRef.current!;

        if (!isOnCampus(lat, lng)) {
          L.popup()
            .setLatLng(map.getCenter())
            .setContent('<div style="font-size:13px;padding:2px 4px">📍 You\'re not on GIKI campus right now</div>')
            .openOn(map);
          setLocating(false);
          return;
        }

        locationDotRef.current?.remove();
        locationDotRef.current = L.circleMarker([lat, lng], {
          radius:      9,
          fillColor:   "#3b82f6",
          color:       "#fff",
          weight:      2,
          fillOpacity: 0.9,
        }).addTo(map).bindPopup("You are here");

        map.flyTo([lat, lng], 17, { duration: 1.5 });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return (
    <div style={{ position: "relative", height: "60vh", width: "100%" }}>
      <div
        ref={containerRef}
        style={{ height: "100%", width: "100%" }}
        className="rounded-2xl overflow-hidden"
      />

      {/* Locate-me button — sits above Leaflet controls (z-index > 1000) */}
      <button
        onClick={handleLocate}
        disabled={locating}
        title="Go to my location"
        style={{ position: "absolute", bottom: "80px", right: "10px", zIndex: 1100 }}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200
                   flex items-center justify-center hover:bg-gray-50 transition-colors
                   disabled:opacity-50"
      >
        {locating ? (
          <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" fill="#3b82f6" stroke="none"/>
            <circle cx="12" cy="12" r="7"/>
            <line x1="12" y1="2"  x2="12" y2="5"  strokeLinecap="round"/>
            <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round"/>
            <line x1="2"  y1="12" x2="5"  y2="12" strokeLinecap="round"/>
            <line x1="19" y1="12" x2="22" y2="12" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}
