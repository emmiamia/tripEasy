import { Suspense } from "react";
import { getTrips } from "@/lib/trips";
import { requireCurrentUser } from "@/lib/session";
import { TripsTable } from "@/components/trips/trips-table";
import { TripsTableSkeleton } from "@/components/trips/trips-table-skeleton";

export default function TripsPage() {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Itinerary vault</p>
          <h1 className="text-3xl font-bold text-slate-900">Trips library</h1>
        </div>
      </header>
      <Suspense fallback={<TripsTableSkeleton />}>
        <ResolvedTrips />
      </Suspense>
    </section>
  );
}

async function ResolvedTrips() {
  const user = await requireCurrentUser();
  const trips = await getTrips(user.id);
  return <TripsTable trips={trips} />;
}
