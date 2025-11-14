import { notFound } from "next/navigation";
import { getTripSummary } from "@/lib/trips";
import { TripWorkspace } from "@/components/trips/trip-workspace";

interface TripPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params;
  const summary = await getTripSummary(tripId);

  if (!summary) {
    notFound();
  }

  return <TripWorkspace summary={summary} />;
}
