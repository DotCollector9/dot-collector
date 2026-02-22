import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [
    totalContacts,
    totalCities,
    totalCompanies,
    interactionsThisMonth,
    bySource,
    topCities,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.contact.groupBy({ by: ["city"], where: { city: { not: null } }, _count: true }).then((r) => r.length),
    prisma.contact.groupBy({ by: ["company"], where: { company: { not: null } }, _count: true }).then((r) => r.length),
    prisma.interaction.count({ where: { date: { gte: monthStart } } }),
    prisma.contact.groupBy({ by: ["source"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.contact.groupBy({
      by: ["city", "country"],
      where: { city: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    totalContacts,
    totalCities,
    totalCompanies,
    interactionsThisMonth,
    bySource: bySource.map((s) => ({ source: s.source, count: s._count.id })),
    topCities: topCities.map((c) => ({
      city: c.city,
      country: c.country,
      count: c._count.id,
    })),
  });
}
