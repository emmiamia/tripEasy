import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activitySchema } from "@/lib/validation";

interface Params {
  params: { activityId: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const data = activitySchema.partial().parse(json);
    const activity = await prisma.activity.update({
      where: { id: params.activityId },
      data: {
        ...data,
        ...(data.locationCity !== undefined ? { locationCity: data.locationCity ?? null } : {}),
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined
      }
    });

    return NextResponse.json(activity);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to update activity" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.activity.delete({ where: { id: params.activityId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to delete activity" }, { status: 400 });
  }
}
