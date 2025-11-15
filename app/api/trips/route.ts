import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validation";
import { addDays, parseISO } from "date-fns";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trips = await prisma.trip.findMany({
    where: {
      members: {
        some: { userId: session.user.id }
      }
    },
    include: {
      days: { include: { activities: true } },
      tasks: true,
      packingItems: true,
      expenses: true
    },
    orderBy: { startDate: "asc" }
  });

  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const data = tripSchema.parse(json);

    const startDate = parseISO(data.startDate);
    const endDate = parseISO(data.endDate);

    const trip = await prisma.trip.create({
      data: {
        name: data.name,
        destination: data.destination,
        description: data.description ?? undefined,
        coverImage: data.coverImage?.trim() ? data.coverImage.trim() : undefined,
        startDate,
        endDate,
        travelStyle: data.travelStyle as any,
        currency: data.currency,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER"
          }
        },
        days: {
          create: Array.from({
            length: Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
          }).map((_, index) => ({
            date: addDays(startDate, index)
          }))
        }
      }
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to create trip" }, { status: 400 });
  }
}
