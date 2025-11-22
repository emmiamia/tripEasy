import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noteSchema } from "@/lib/validation";

interface Params {
  params: Promise<{ noteId: string }>;
}

export async function PATCH(request: Request, context: Params) {
  try {
    const params = await context.params;
    const json = await request.json();
    const data = noteSchema.partial().parse(json);
    const note = await prisma.tripNote.update({
      where: { id: params.noteId },
      data
    });
    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to update note" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    const params = await context.params;
    await prisma.tripNote.delete({ where: { id: params.noteId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to delete note" }, { status: 400 });
  }
}
