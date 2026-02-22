import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { contactId, type, date, notes } = await req.json();

  const interaction = await prisma.interaction.create({
    data: {
      contactId,
      type: type ?? "note",
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
    },
  });

  // Touch contact updatedAt
  await prisma.contact.update({
    where: { id: contactId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(interaction, { status: 201 });
}
