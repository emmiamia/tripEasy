import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { companionSchema } from "@/lib/validation";

interface Params {
  params: { companionId: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const data = companionSchema.partial().parse(json);

    const companion = await prisma.travelCompanion.update({
      where: { id: params.companionId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email ?? null } : {}),
        ...(data.status !== undefined ? { status: data.status ?? null } : {})
      }
    });

    return NextResponse.json(companion);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to update companion" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {\n+    await prisma.travelCompanion.delete({ where: { id: params.companionId } });\n+    return NextResponse.json({ success: true });\n+  } catch (error: any) {\n+    console.error(error);\n+    return NextResponse.json({ error: error.message ?? \"Unable to delete companion\" }, { status: 400 });\n+  }\n+}\n*** End Patch

