import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validation";

interface Params {
  params: { taskId: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const data = taskSchema.partial().parse(json);
    const task = await prisma.tripTask.update({
      where: { id: params.taskId },
      data: {
        ...data,
        dueDate:
          data.dueDate === null
            ? null
            : data.dueDate
            ? new Date(data.dueDate)
            : undefined
      }
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to update task" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.tripTask.delete({ where: { id: params.taskId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to delete task" }, { status: 400 });
  }
}
