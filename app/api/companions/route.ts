import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { companionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = companionSchema.parse(json);

    const companion = await prisma.travelCompanion.create({
      data: {
        tripId: data.tripId,
        name: data.name,
        email: data.email ?? undefined,
        status: data.status ?? undefined
      }
    });

    return NextResponse.json(companion, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to add companion" }, { status: 400 });
  }
}

