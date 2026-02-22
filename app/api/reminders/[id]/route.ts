import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  const reminder = await prisma.reminder.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(reminder);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.reminder.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
