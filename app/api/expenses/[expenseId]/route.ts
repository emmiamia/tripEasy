import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validation";

interface Params {
  params: Promise<{ expenseId: string }>;
}

export async function PATCH(request: Request, context: Params) {
  try {
    const params = await context.params;
    const json = await request.json();
    const data = expenseSchema.partial().parse(json);
    const expense = await prisma.expense.update({
      where: { id: params.expenseId },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    });
    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to update expense" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    const params = await context.params;
    await prisma.expense.delete({ where: { id: params.expenseId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to delete expense" }, { status: 400 });
  }
}
