import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parseCSV, mapLinkedInRows, mapGenericRows, ColumnMapping } from "@/lib/csv-parser";
import { geocodeCity } from "@/lib/geocode";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const mappingRaw = formData.get("mapping") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();
  const { headers, rows, isLinkedIn } = parseCSV(text);

  // If no mapping provided and not LinkedIn, return headers for column mapping UI
  if (!isLinkedIn && !mappingRaw) {
    return NextResponse.json({ needsMapping: true, headers });
  }

  const contacts = isLinkedIn
    ? mapLinkedInRows(rows)
    : mapGenericRows(rows, JSON.parse(mappingRaw!) as ColumnMapping);

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const c of contacts) {
    try {
      // Geocode
      let lat: number | null = null;
      let lng: number | null = null;
      if (c.city) {
        const coords = await geocodeCity(c.city, c.country);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      // Upsert by email if available
      if (c.email) {
        const existing = await prisma.contact.findFirst({
          where: { email: c.email },
        });
        if (existing) {
          skipped++;
          continue;
        }
      }

      await prisma.contact.create({
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email || null,
          phone: c.phone || null,
          company: c.company || null,
          jobTitle: c.jobTitle || null,
          city: c.city || null,
          country: c.country || null,
          latitude: lat,
          longitude: lng,
          linkedinUrl: c.linkedinUrl || null,
          source: c.source,
        },
      });
      imported++;
    } catch (err) {
      errors.push(`Row error: ${String(err)}`);
    }
  }

  return NextResponse.json({ imported, skipped, errors });
}
