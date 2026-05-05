import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { sessionCookieName, verifySessionToken } from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "freelancer" | "client";
  theme: "light" | "dark" | "system";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const session = await verifySessionToken(token);
    if (!session) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        theme: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export function safeUser(user: CurrentUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    theme: user.theme,
  };
}
