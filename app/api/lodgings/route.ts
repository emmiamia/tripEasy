import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lodgingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = lodgingSchema.parse(json);

    const lodging = await prisma.lodging.create({
      data: {
        tripId: data.tripId,
        name: data.name,
        address: data.address ?? undefined,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        confirmationNumber: data.confirmationNumber ?? undefined,
        notes: data.notes ?? undefined,
        url: data.url ?? undefined
      }
    });

    return NextResponse.json(lodging, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to create lodging" }, { status: 400 });
  }
}

