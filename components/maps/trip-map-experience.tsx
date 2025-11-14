"use client";

import { useMemo, useState } from "react";
import type { TripSummary } from "@/lib/trips";
import { FiList, FiMapPin } from "react-icons/fi";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

interface TripMapExperienceProps {
  summary: TripSummary;
}

export function TripMapExperience({ summary }: TripMapExperienceProps) {
  const { mapPoints, trip } = summary;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const days = useMemo(() => {
    return trip.days.map((day) => ({
      id: day.id,
      date: new Date(day.date),
      activities: day.activities.filter((activity) =>
        mapPoints.some((point) => point.id === activity.id)
      )
    }));
  }, [trip.days, mapPoints]);

  const selectedActivityIds = useMemo(() => {
    if (!selectedDay) return null;
    const day = days.find((entry) => entry.id === selectedDay);
    if (!day) return null;
    return new Set(day.activities.map((activity) => activity.id));
  }, [selectedDay, days]);

  const filteredPoints = useMemo(() => {
    if (!selectedActivityIds) return mapPoints;
    return mapPoints.filter((point) => selectedActivityIds.has(point.id));
  }, [mapPoints, selectedActivityIds]);

  const center = useMemo(() => {
    if (!filteredPoints.length) return { lat: 0, lng: 0 };
    const lat =
      filteredPoints.reduce((acc: number, point) => acc + point.lat, 0) / filteredPoints.length;
    const lng =
      filteredPoints.reduce((acc: number, point) => acc + point.lng, 0) / filteredPoints.length;
    return { lat, lng };
  }, [filteredPoints]);

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Map view</p>
        <h1 className="text-3xl font-bold text-slate-900">{trip.name}</h1>
        <p className="text-sm text-slate-600">Explore your itinerary on an interactive map. Filter by day to focus the route.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FiList className="h-4 w-4 text-brand-500" /> Days
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs ${
              selectedDay === null ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            All locations
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
              {mapPoints.length}
            </span>
          </button>
          <div className="space-y-2 text-xs">
            {days.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left ${
                  selectedDay === day.id ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <span>
                  Day {index + 1}
                  <div className="text-[10px] uppercase tracking-wide">
                    {day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                  {day.activities.length}
                </span>
              </button>
            ))}
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
            <FiMapPin className="mb-2 h-4 w-4 text-brand-500" />
            Tip: Add coordinates in itinerary items to visualize them here.
          </div>
        </aside>
        <div className="h-[600px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {!apiKey ? (
            <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
              Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to view the map.
            </div>
          ) : filteredPoints.length ? (
            <APIProvider apiKey={apiKey}>
              <Map
                key={`${selectedDay ?? "all"}-${filteredPoints
                  .map((point) => `${point.id}:${point.lat}:${point.lng}`)
                  .sort()
                  .join("|")}`}
                defaultCenter={center}
                defaultZoom={filteredPoints.length > 1 ? 6 : 11}
                gestureHandling="greedy"
                disableDefaultUI
                className="h-full w-full"
              >
                {filteredPoints.map((point) => (
                  <Marker key={point.id} position={{ lat: point.lat, lng: point.lng }} title={point.title} />
                ))}
              </Map>
            </APIProvider>
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
              No map points for the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
