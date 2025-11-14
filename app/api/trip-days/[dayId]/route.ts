import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseISO } from "date-fns";

const dayUpdateSchema = z.object({
  summary: z.string().optional().nullable(),
  date: z.string().optional()
});

interface Params {
  params: Promise<{ dayId: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const data = dayUpdateSchema.partial().parse(json);
    const { dayId } = await params;

    const day = await prisma.tripDay.update({
      where: { id: dayId },
      data: {
        ...("summary" in data ? { summary: data.summary ?? null } : {}),
        ...("date" in data ? { date: parseISO(data.date!) } : {})
      }
    });

    return NextResponse.json(day);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to update trip day" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { dayId } = await params;
    await prisma.tripDay.delete({
      where: { id: dayId }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to delete trip day" }, { status: 400 });
  }
}

