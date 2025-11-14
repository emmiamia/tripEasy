import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { TripSummary } from "@/lib/trips";
import { TripItinerary } from "@/components/trips/trip-itinerary";
import { TripTaskBoard } from "@/components/trips/trip-task-board";
import { TripPackingList } from "@/components/trips/trip-packing-list";
import { TripExpenseSummary } from "@/components/trips/trip-expense-summary";
import { TripNotesPanel } from "@/components/trips/trip-notes-panel";
import { TripLogisticsPanel } from "@/components/trips/trip-logistics-panel";
import { TripMapPreview } from "@/components/maps/trip-map-preview";
import { FiUsers, FiMapPin } from "react-icons/fi";

interface TripWorkspaceProps {
  summary: TripSummary;
}

export function TripWorkspace({ summary }: TripWorkspaceProps) {
  const { trip, dayCount, budget, upcomingTasks, mapPoints } = summary;

  const heroImage =
    trip.coverImage && trip.coverImage.trim() !== ""
      ? trip.coverImage
      : "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80";

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="relative h-56 w-full overflow-hidden">
          <Image src={heroImage} alt={trip.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 text-white">
            <p className="text-sm uppercase tracking-wide text-white/80">{trip.destination}</p>
            <h1 className="mt-2 text-3xl font-semibold">{trip.name}</h1>
            <p className="mt-1 text-sm text-white/80">
              {format(new Date(trip.startDate), "MMM d, yyyy")} – {format(new Date(trip.endDate), "MMM d, yyyy")} • {dayCount} days
            </p>
          </div>
        </div>
        <div className="grid gap-6 px-8 py-6 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Travel style</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{trip.travelStyle.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Budget tracked</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: trip.currency }).format(budget)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Companions</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiUsers className="h-4 w-4 text-brand-500" />
              {trip.companions.length} travelers
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Link
              href={`/trips/${trip.id}/map`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-700"
            >
              <FiMapPin className="h-4 w-4" />
              Open map view
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TripItinerary tripId={trip.id} days={trip.days} />
          <TripLogisticsPanel
            tripId={trip.id}
            lodgings={trip.lodgings}
            segments={trip.segments}
            companions={trip.companions}
          />
          <TripNotesPanel tripId={trip.id} notes={trip.notes} />
        </div>
        <div className="space-y-6">
          <TripMapPreview mapPoints={mapPoints} destination={trip.destination} />
          <TripTaskBoard tripId={trip.id} tasks={trip.tasks} upcoming={upcomingTasks} />
          <TripPackingList tripId={trip.id} items={trip.packingItems} />
          <TripExpenseSummary tripId={trip.id} expenses={trip.expenses} currency={trip.currency} />
        </div>
      </section>
    </div>
  );
}
