import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = noteSchema.parse(json);
    const note = await prisma.tripNote.create({ data });
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to create note" }, { status: 400 });
  }
}
