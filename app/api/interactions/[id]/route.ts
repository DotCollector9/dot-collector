import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  if (body.date) body.date = new Date(body.date);
  const interaction = await prisma.interaction.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(interaction);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.interaction.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
