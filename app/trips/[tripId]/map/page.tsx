import { notFound } from "next/navigation";
import { getTripSummary } from "@/lib/trips";
import { requireCurrentUser } from "@/lib/session";
import { TripMapExperience } from "@/components/maps/trip-map-experience";

interface TripMapPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripMapPage({ params }: TripMapPageProps) {
  const { tripId } = await params;
  const user = await requireCurrentUser();
  const summary = await getTripSummary(user.id, tripId);
  if (!summary) {
    notFound();
  }

  return <TripMapExperience summary={summary} />;
}
