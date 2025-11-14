import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = expenseSchema.parse(json);
    const expense = await prisma.expense.create({
      data: {
        ...data,
        date: new Date(data.date)
      }
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unable to create expense" }, { status: 400 });
  }
}
