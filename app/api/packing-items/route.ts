import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { packingItemSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = packingItemSchema.parse(json);
    const item = await prisma.packingItem.create({ data });
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to create packing item" }, { status: 400 });
  }
}
