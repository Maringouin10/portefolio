import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    return NextResponse.json(
      { error: "Compte admin non configure (variables d'environnement manquantes)" },
      { status: 500 }
    );
  }

  if (!email || !password || email !== adminEmail) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, adminHash);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const token = await createSessionToken(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
