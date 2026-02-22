import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const now = new Date();
  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

  const reminders = await prisma.reminder.findMany({
    where: {
      isCompleted: false,
      dueDate: { lte: twoWeeksOut },
    },
    orderBy: { dueDate: "asc" },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          company: true,
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json(reminders);
}

export async function POST(req: NextRequest) {
  const { contactId, dueDate, message } = await req.json();
  const reminder = await prisma.reminder.create({
    data: { contactId, dueDate: new Date(dueDate), message },
  });
  return NextResponse.json(reminder, { status: 201 });
}
