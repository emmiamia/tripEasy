import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tripDaySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = tripDaySchema.parse(json);

    const tripDay = await prisma.tripDay.create({
      data: {
        tripId: data.tripId,
        date: new Date(data.date),
        summary: data.summary ?? null
      },
      include: {
        activities: true
      }
    });

    return NextResponse.json(tripDay, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to create trip day" }, { status: 400 });
  }
}

