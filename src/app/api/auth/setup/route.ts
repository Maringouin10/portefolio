import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdmin } from "@/lib/admin";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const existing = await prisma.admin.count();
  if (existing > 0) {
    return NextResponse.json({ error: "Un compte admin existe deja" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const email = (body?.email as string | undefined)?.trim();
  const password = body?.password as string | undefined;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caracteres" },
      { status: 400 }
    );
  }

  await createAdmin(email, password);

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
