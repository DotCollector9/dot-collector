import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { geocodeCity } from "@/lib/geocode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const city = searchParams.get("city") ?? "";
  const stale = searchParams.get("stale") === "true";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { company: { contains: search } },
    ];
  }
  if (city) {
    where.city = { contains: city };
  }

  if (stale) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    where.AND = [
      {
        OR: [
          { interactions: { none: {} } },
          {
            interactions: {
              none: { date: { gte: threeMonthsAgo } },
            },
          },
        ],
      },
    ];
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { interactions: true } },
        interactions: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true, type: true },
        },
      },
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({ contacts, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    firstName,
    lastName,
    email,
    phone,
    company,
    jobTitle,
    city,
    country,
    linkedinUrl,
    linkedinId,
    source,
    tags,
    notes,
    avatarUrl,
    latitude,
    longitude,
  } = body;

  // Geocode if city is provided but coordinates are missing
  let lat: number | undefined = latitude;
  let lng: number | undefined = longitude;
  if (city && (lat === undefined || lat === null)) {
    const coords = await geocodeCity(city, country);
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  const contact = await prisma.contact.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      company: company || null,
      jobTitle: jobTitle || null,
      city: city || null,
      country: country || null,
      latitude: lat ?? null,
      longitude: lng ?? null,
      linkedinUrl: linkedinUrl || null,
      linkedinId: linkedinId || null,
      source: source ?? "manual",
      tags: tags ? JSON.stringify(tags) : "[]",
      notes: notes || null,
      avatarUrl: avatarUrl || null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
