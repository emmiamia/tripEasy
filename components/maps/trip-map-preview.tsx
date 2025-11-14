"use client";

import { useMemo } from "react";
import type { TripSummary } from "@/lib/trips";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

interface TripMapPreviewProps {
  mapPoints: TripSummary["mapPoints"];
  destination: string;
}

export function TripMapPreview({ mapPoints, destination }: TripMapPreviewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  type MapPoint = TripSummary["mapPoints"][number];
  const center = useMemo(() => {
    if (!mapPoints.length) return { lat: 0, lng: 0 };
    const lat =
      mapPoints.reduce((acc: number, point: MapPoint) => acc + point.lat, 0) / mapPoints.length;
    const lng =
      mapPoints.reduce((acc: number, point: MapPoint) => acc + point.lng, 0) / mapPoints.length;
    return { lat, lng };
  }, [mapPoints]);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Map</p>
        <h2 className="text-lg font-semibold text-slate-900">Places pinned</h2>
        <p className="text-xs text-slate-500">{destination}</p>
      </div>
      <div className="h-60 w-full">
        {!apiKey ? (
          <div className="flex h-full items-center justify-center bg-slate-100 text-xs text-slate-500">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to preview pins.
          </div>
        ) : mapPoints.length ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={10}
              gestureHandling="greedy"
              disableDefaultUI
              className="h-full w-full"
              mapId="trip-map"
            >
              {mapPoints.map((point: MapPoint) => (
                <Marker key={point.id} position={{ lat: point.lat, lng: point.lng }} title={point.title} />
              ))}
            </Map>
          </APIProvider>
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-xs text-slate-500">
            Add activities with locations to visualize them here.
          </div>
        )}
      </div>
    </section>
  );
}
