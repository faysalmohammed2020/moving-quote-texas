import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, session: null };
  }
  return { ok: true as const, session };
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, session: null, status: 401 };
  }
  if (session.user.role !== "ADMIN") {
    return { ok: false as const, session, status: 403 };
  }
  return { ok: true as const, session, status: 200 };
}