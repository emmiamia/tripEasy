import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validation";
import { parseISO } from "date-fns";

interface Params {
  params: { tripId: string };
}

export async function GET(_request: Request, { params }: Params) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.tripId },
    include: {
      days: { include: { activities: true }, orderBy: { date: "asc" } },
      lodgings: true,
      segments: true,
      packingItems: true,
      tasks: true,
      expenses: true,
      notes: true,
      companions: true
    }
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const data = tripSchema.partial().parse(json);

    const trip = await prisma.trip.update({
      where: { id: params.tripId },
      data: {
        ...("name" in data ? { name: data.name } : {}),
        ...("destination" in data ? { destination: data.destination } : {}),
        ...("description" in data ? { description: data.description ?? null } : {}),
        ...("coverImage" in data
          ? { coverImage: data.coverImage?.trim() ? data.coverImage.trim() : null }
          : {}),
        ...("travelStyle" in data ? { travelStyle: data.travelStyle as any } : {}),
        ...("currency" in data ? { currency: data.currency } : {}),
        ...("startDate" in data ? { startDate: parseISO(data.startDate!) } : {}),
        ...("endDate" in data ? { endDate: parseISO(data.endDate!) } : {})
      }
    });

    return NextResponse.json(trip);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to update trip" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.trip.delete({ where: { id: params.tripId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to delete trip" }, { status: 400 });
  }
}
