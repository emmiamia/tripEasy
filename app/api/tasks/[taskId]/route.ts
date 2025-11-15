import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validation";
import { auth } from "@/lib/auth";

interface Params {
  params: Promise<{ taskId: string }>;
}

export async function PATCH(request: Request, context: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await context.params;
    const existing = await prisma.tripTask.findFirst({
      where: {
        id: taskId,
        trip: {
          members: {
            some: { userId: session.user.id }
          }
        }
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    const json = await request.json();
    const data = taskSchema.partial().parse(json);
    const task = await prisma.tripTask.update({
      where: { id: taskId },
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

export async function DELETE(_request: Request, context: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await context.params;
    const existing = await prisma.tripTask.findFirst({
      where: {
        id: taskId,
        trip: {
          members: {
            some: { userId: session.user.id }
          }
        }
      },
      select: { id: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.tripTask.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to delete task" }, { status: 400 });
  }
}
