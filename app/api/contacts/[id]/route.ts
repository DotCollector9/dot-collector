import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { geocodeCity } from "@/lib/geocode";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      interactions: { orderBy: { date: "desc" } },
      reminders: { orderBy: { dueDate: "asc" } },
    },
  });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  // Re-geocode if city changed and no explicit coordinates provided
  if (body.city && body.latitude === undefined) {
    const coords = await geocodeCity(body.city, body.country);
    if (coords) {
      body.latitude = coords.lat;
      body.longitude = coords.lng;
    }
  }

  if (body.tags && Array.isArray(body.tags)) {
    body.tags = JSON.stringify(body.tags);
  }

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(contact);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.contact.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
