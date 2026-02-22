import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncGmailContacts } from "@/lib/gmail";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await auth() as any;

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated. Please sign in with Google first." },
      { status: 401 }
    );
  }

  // Get stored refresh token
  const tokenRecord = await prisma.googleToken.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const result = await syncGmailContacts(
    session.accessToken as string,
    tokenRecord?.refreshToken ?? undefined
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  // Store/update Google tokens after OAuth
  const { accessToken, refreshToken, expiresAt, scope } = await req.json();

  await prisma.googleToken.upsert({
    where: { id: "singleton" },
    update: { accessToken, refreshToken, expiresAt: expiresAt ? new Date(expiresAt * 1000) : null, scope },
    create: { id: "singleton", accessToken, refreshToken, expiresAt: expiresAt ? new Date(expiresAt * 1000) : null, scope },
  });

  return NextResponse.json({ ok: true });
}
