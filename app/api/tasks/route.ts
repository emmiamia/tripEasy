import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = taskSchema.parse(json);
    const task = await prisma.tripTask.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to create task" }, { status: 400 });
  }
}
