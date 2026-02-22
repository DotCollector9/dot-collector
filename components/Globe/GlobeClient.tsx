"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import CityPanel from "@/components/shared/CityPanel";

interface CityGroup {
  city: string;
  country: string | null;
  lat: number;
  lng: number;
  count: number;
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    company: string | null;
    jobTitle: string | null;
    avatarUrl: string | null;
  }[];
}

function interpolateColor(t: number): string {
  // cool blue → warm orange
  const r = Math.round(30 + t * 225);
  const g = Math.round(100 + t * 80);
  const b = Math.round(255 - t * 220);
  return `rgba(${r},${g},${b},0.85)`;
}

export default function GlobeClient() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [cityData, setCityData] = useState<CityGroup[]>([]);
  const [tooltip, setTooltip] = useState<{ city: string; count: number; x: number; y: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityGroup | null>(null);

  // Responsive size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Fetch city data
  useEffect(() => {
    fetch("/api/contacts/by-city")
      .then((r) => r.json())
      .then((data: CityGroup[]) => setCityData(data))
      .catch(console.error);
  }, []);

  const maxCount = Math.max(1, ...cityData.map((c) => c.count));

  const pointColor = useCallback(
    (d: object) => {
      const city = d as CityGroup;
      return interpolateColor(city.count / maxCount);
    },
    [maxCount]
  );

  const pointAltitude = useCallback(
    (d: object) => {
      const city = d as CityGroup;
      return 0.02 + (city.count / maxCount) * 0.15;
    },
    [maxCount]
  );

  const pointRadius = useCallback(
    (d: object) => {
      const city = d as CityGroup;
      return Math.max(0.4, Math.sqrt(city.count) * 0.5);
    },
    []
  );

  const handlePointHover = useCallback(
    (point: object | null, _prev: object | null, event?: MouseEvent) => {
      if (point && event) {
        const city = point as CityGroup;
        setTooltip({ city: city.city, count: city.count, x: event.clientX, y: event.clientY });
      } else {
        setTooltip(null);
      }
    },
    []
  );

  const handlePointClick = useCallback(
    (point: object) => {
      const city = point as CityGroup;
      setSelectedCity(city);
      globeRef.current?.pointOfView({ lat: city.lat, lng: city.lng, altitude: 1.5 }, 1000);
    },
    []
  );

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={cityData}
        pointLat="lat"
        pointLng="lng"
        pointColor={pointColor}
        pointAltitude={pointAltitude}
        pointRadius={pointRadius}
        pointLabel={(d: object) => {
          const city = d as CityGroup;
          return `<div style="background:rgba(0,0,0,0.8);padding:6px 10px;border-radius:6px;color:white;font-size:13px;border:1px solid rgba(100,150,255,0.4)"><b>${city.city}</b><br/>${city.count} connection${city.count !== 1 ? "s" : ""}</div>`;
        }}
        onPointHover={handlePointHover}
        onPointClick={handlePointClick}
        atmosphereColor="rgb(100,150,255)"
        atmosphereAltitude={0.15}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-30 pointer-events-none px-3 py-1.5 bg-gray-900/90 border border-blue-500/30 rounded-lg text-white text-sm shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          <span className="font-medium">{tooltip.city}</span>
          <span className="text-gray-400 ml-2">{tooltip.count} connection{tooltip.count !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* City Panel */}
      {selectedCity && (
        <CityPanel city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}

      {/* Empty state */}
      {cityData.length === 0 && (
        <div className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none">
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700 rounded-xl px-6 py-4 text-center">
            <p className="text-gray-300 text-sm">No contacts with location data yet.</p>
            <p className="text-gray-500 text-xs mt-1">Add contacts with a city to see them on the globe.</p>
          </div>
        </div>
      )}
    </div>
  );
}
