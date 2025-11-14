import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { packingItemSchema } from "@/lib/validation";

interface Params {
  params: { packingItemId: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const data = packingItemSchema.partial().parse(json);
    const item = await prisma.packingItem.update({
      where: { id: params.packingItemId },
      data
    });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to update packing item" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.packingItem.delete({ where: { id: params.packingItemId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to delete packing item" }, { status: 400 });
  }
}
