import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transportSegmentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = transportSegmentSchema.parse(json);

    const segment = await prisma.transportSegment.create({
      data: {
        tripId: data.tripId,
        type: data.type,
        carrier: data.carrier ?? undefined,
        confirmationNumber: data.confirmationNumber ?? undefined,
        departureCity: data.departureCity,
        arrivalCity: data.arrivalCity,
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        seat: data.seat ?? undefined
      }
    });

    return NextResponse.json(segment, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to create transport segment" }, { status: 400 });
  }
}

