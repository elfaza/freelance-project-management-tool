import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSessionToken, sessionCookieName } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http/responses";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid login data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return fail("Invalid email or password.", "UNAUTHORIZED", 401);
  }

  const response = ok(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        theme: user.theme,
      },
    },
    "Login successful",
  );

  response.cookies.set(sessionCookieName, await createSessionToken({ userId: user.id }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
