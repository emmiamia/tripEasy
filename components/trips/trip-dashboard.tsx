"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiBriefcase } from "react-icons/fi";
import { TripWithMetrics } from "@/lib/trips";
import { cn, currencyFormatter } from "@/lib/utils";

interface TripDashboardProps {
  trips: TripWithMetrics[];
}

export function TripDashboard({ trips }: TripDashboardProps) {
  if (!trips.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">No trips yet</h2>
        <p className="mt-2 text-sm text-slate-600">Create your first adventure to start planning.</p>
        <Link
          href="/trips/new"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600"
        >
          Plan a trip
        </Link>
      </div>
    );
  }

  const totalExpense = trips.reduce((acc, trip) => acc + trip.totalExpense, 0);
  const totalActivities = trips.reduce((acc, trip) => acc + trip.totalActivities, 0);
  const averageTaskCompletion = Math.round(
    trips.reduce((acc, trip) => acc + trip.taskCompletion, 0) / trips.length
  );

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total trips" value={trips.length.toString()} icon={FiMapPin} />
        <StatCard label="Activities planned" value={totalActivities.toString()} icon={FiCalendar} />
        <StatCard
          label="Avg. prep complete"
          value={`${averageTaskCompletion}%`}
          icon={FiCheckCircle}
          trend="Task completion across all trips"
        />
        <StatCard
          label="Budget tracked"
          value={currencyFormatter("USD").format(totalExpense)}
          icon={FiBriefcase}
        />
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming trips</h2>
          <Link href="/trips" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
          {trend && <p className="mt-2 text-xs text-slate-500">{trend}</p>}
        </div>
        <div className="rounded-full bg-brand-50 p-3 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TripCard({ trip }: { trip: TripWithMetrics }) {
  const formatter = currencyFormatter(trip.currency ?? "USD");
  const nextActivity = trip.days
    .flatMap((day) => day.activities)
    .sort((a, b) => (a.startTime?.valueOf() ?? 0) - (b.startTime?.valueOf() ?? 0))[0];

  return (
    <div className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-lg">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              {format(new Date(trip.startDate), "MMM d")} – {format(new Date(trip.endDate), "MMM d, yyyy")}
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                trip.taskCompletion > 75 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}
            >
              {trip.taskCompletion}% ready
            </span>
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{trip.name}</h3>
          <p className="text-sm text-slate-600">{trip.destination}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-brand-500" />
            {trip.totalActivities} activities planned
          </p>
          <p className="mt-2 flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-brand-500" /> {trip.packedCount} packed items
          </p>
          <p className="mt-2 flex items-center gap-2">
            <FiClock className="h-4 w-4 text-brand-500" />
            {formatDistanceToNow(new Date(trip.startDate), { addSuffix: true })}
          </p>
          <p className="mt-2 flex items-center gap-2">
            <FiBriefcase className="h-4 w-4 text-brand-500" />
            {formatter.format(trip.totalExpense)} tracked
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-brand-600">
        <Link href={`/trips/${trip.id}`} className="font-semibold hover:text-brand-700">
          Open trip workspace
        </Link>
        {nextActivity ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FiMapPin className="h-4 w-4 text-brand-500" />
            Next: {nextActivity.title}
          </div>
        ) : null}
      </div>
    </div>
  );
}
