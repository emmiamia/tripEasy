import { notFound } from "next/navigation";
import { getTripSummary } from "@/lib/trips";
import { TripMapExperience } from "@/components/maps/trip-map-experience";

interface TripMapPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripMapPage({ params }: TripMapPageProps) {
  const { tripId } = await params;
  const summary = await getTripSummary(tripId);
  if (!summary) {
    notFound();
  }

  return <TripMapExperience summary={summary} />;
}
