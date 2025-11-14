import { Suspense } from "react";
import { getTrips } from "@/lib/trips";
import { TripDashboardSkeleton } from "@/components/trips/trip-dashboard-skeleton";
import { TripDashboard } from "@/components/trips/trip-dashboard";

export default async function DashboardPage() {
  const tripsPromise = getTrips();

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Your travel hub</p>
        <h1 className="text-3xl font-bold text-slate-900">Upcoming adventures</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Visualize itineraries, manage reservations, keep budgets in check, and collaborate with your travel companions in the TripEasy workspace.
        </p>
      </header>

      <Suspense fallback={<TripDashboardSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <ResolvedDashboard promise={tripsPromise} />
      </Suspense>
    </section>
  );
}

async function ResolvedDashboard({
  promise
}: {
  promise: ReturnType<typeof getTrips>;
}) {
  const trips = await promise;
  return <TripDashboard trips={trips} />;
}
