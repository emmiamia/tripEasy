import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activitySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = activitySchema.parse(json);
    const activity = await prisma.activity.create({
      data: {
        ...data,
        locationCity: data.locationCity ?? undefined,
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null
      }
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to create activity" }, { status: 400 });
  }
}
