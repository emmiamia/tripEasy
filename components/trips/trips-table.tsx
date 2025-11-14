"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { TripWithMetrics } from "@/lib/trips";
import { cn, currencyFormatter } from "@/lib/utils";
import { FiArrowUpRight, FiSearch, FiFilter } from "react-icons/fi";

interface TripsTableProps {
  trips: TripWithMetrics[];
}

const travelStyles = ["ADVENTURE", "CULTURE", "RELAXATION", "FAMILY", "LUXURY", "ROAD_TRIP"];

export function TripsTable({ trips }: TripsTableProps) {
  const [query, setQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState<string | null>(null);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesQuery = [trip.name, trip.destination]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStyle = styleFilter ? trip.travelStyle === styleFilter : true;
      return matchesQuery && matchesStyle;
    });
  }, [query, styleFilter, trips]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by trip or destination"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            <FiFilter className="h-3.5 w-3.5" />
            Travel style
          </span>
          <button
            onClick={() => setStyleFilter(null)}
            className={cn(
              "rounded-full px-3 py-1 font-medium transition",
              styleFilter === null
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-500 hover:bg-slate-100"
            )}
          >
            All
          </button>
          {travelStyles.map((style) => (
            <button
              key={style}
              onClick={() => setStyleFilter(style)}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition",
                styleFilter === style
                  ? "bg-brand-500 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-100"
              )}
            >
              {style.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4 font-semibold">Trip</th>
              <th className="px-6 py-4 font-semibold">Dates</th>
              <th className="px-6 py-4 font-semibold">Progress</th>
              <th className="px-6 py-4 font-semibold">Spend</th>
              <th className="px-6 py-4 font-semibold">Activities</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredTrips.map((trip) => (
              <tr key={trip.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{trip.name}</p>
                    <p className="text-xs text-slate-500">{trip.destination}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {format(new Date(trip.startDate), "MMM d, yyyy")} – {format(new Date(trip.endDate), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={cn(
                          "h-full rounded-full bg-brand-500",
                          trip.taskCompletion > 80 ? "bg-emerald-500" : "bg-brand-500"
                        )}
                        style={{ width: `${trip.taskCompletion}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {trip.taskCompletion}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {currencyFormatter(trip.currency).format(trip.totalExpense)}
                </td>
                <td className="px-6 py-4 text-slate-600">{trip.totalActivities}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/trips/${trip.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    Open
                    <FiArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {!filteredTrips.length && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                  No trips match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
