import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { created, fail } from "@/lib/http/responses";
import { registerSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid registration data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return fail("Email is already registered.", "CONFLICT", 409);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      theme: "system",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      theme: true,
      createdAt: true,
    },
  });

  return created({ user }, "Registration successful");
}
