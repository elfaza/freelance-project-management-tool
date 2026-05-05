import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http/responses";
import { preferenceSchema } from "@/lib/validation/schemas";

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const parsed = preferenceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid preference data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { theme: parsed.data.theme },
    select: { id: true, theme: true },
  });

  return ok({ user: updated }, "Preference updated");
}
