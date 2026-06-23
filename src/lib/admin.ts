import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === adminSecret;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}
