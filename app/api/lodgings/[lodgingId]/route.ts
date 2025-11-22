import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lodgingSchema } from "@/lib/validation";

interface Params {
  params: Promise<{ lodgingId: string }>;
}

export async function PATCH(request: Request, context: Params) {
  try {
    const params = await context.params;
    const json = await request.json();
    const data = lodgingSchema.partial().parse(json);

    const lodging = await prisma.lodging.update({
      where: { id: params.lodgingId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.address !== undefined ? { address: data.address ?? null } : {}),
        ...(data.checkIn !== undefined ? { checkIn: new Date(data.checkIn) } : {}),
        ...(data.checkOut !== undefined ? { checkOut: new Date(data.checkOut) } : {}),
        ...(data.confirmationNumber !== undefined
          ? { confirmationNumber: data.confirmationNumber ?? null }
          : {}),
        ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
        ...(data.url !== undefined ? { url: data.url ?? null } : {})
      }
    });

    return NextResponse.json(lodging);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to update lodging" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    const params = await context.params;
    await prisma.lodging.delete({ where: { id: params.lodgingId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to delete lodging" }, { status: 400 });
  }
}

