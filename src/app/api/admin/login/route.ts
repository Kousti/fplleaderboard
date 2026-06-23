import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSecret } from "@/lib/admin";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    return NextResponse.json({ error: "Admin is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { secret?: string };
  if (body.secret !== adminSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
