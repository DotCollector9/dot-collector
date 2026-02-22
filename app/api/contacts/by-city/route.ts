import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export interface CityGroup {
  city: string;
  country: string | null;
  lat: number;
  lng: number;
  count: number;
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    company: string | null;
    jobTitle: string | null;
    avatarUrl: string | null;
  }[];
}

export async function GET() {
  // Get all contacts that have lat/lng
  const contacts = await prisma.contact.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      company: true,
      jobTitle: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
      avatarUrl: true,
    },
  });

  // Group by city+country
  const cityMap = new Map<
    string,
    { city: string; country: string | null; lat: number; lng: number; contacts: typeof contacts }
  >();

  for (const c of contacts) {
    const key = `${c.city ?? "Unknown"}__${c.country ?? ""}`;
    if (!cityMap.has(key)) {
      cityMap.set(key, {
        city: c.city ?? "Unknown",
        country: c.country,
        lat: c.latitude!,
        lng: c.longitude!,
        contacts: [],
      });
    }
    cityMap.get(key)!.contacts.push(c);
  }

  const groups: CityGroup[] = Array.from(cityMap.values()).map((g) => ({
    city: g.city,
    country: g.country,
    lat: g.lat,
    lng: g.lng,
    count: g.contacts.length,
    contacts: g.contacts.map(({ id, firstName, lastName, company, jobTitle, avatarUrl }) => ({
      id,
      firstName,
      lastName,
      company,
      jobTitle,
      avatarUrl,
    })),
  }));

  return NextResponse.json(groups);
}
