import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transportSegmentSchema } from "@/lib/validation";

interface Params {
  params: { segmentId: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const data = transportSegmentSchema.partial().parse(json);

    const segment = await prisma.transportSegment.update({
      where: { id: params.segmentId },
      data: {
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.carrier !== undefined ? { carrier: data.carrier ?? null } : {}),
        ...(data.confirmationNumber !== undefined
          ? { confirmationNumber: data.confirmationNumber ?? null }
          : {}),
        ...(data.departureCity !== undefined ? { departureCity: data.departureCity } : {}),
        ...(data.arrivalCity !== undefined ? { arrivalCity: data.arrivalCity } : {}),
        ...(data.departureTime !== undefined ? { departureTime: new Date(data.departureTime) } : {}),
        ...(data.arrivalTime !== undefined ? { arrivalTime: new Date(data.arrivalTime) } : {}),
        ...(data.seat !== undefined ? { seat: data.seat ?? null } : {})
      }
    });

    return NextResponse.json(segment);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to update transport segment" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.transportSegment.delete({ where: { id: params.segmentId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to delete transport segment" }, { status: 400 });
  }
}

