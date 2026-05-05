import { getCurrentUser, safeUser } from "@/lib/auth/current-user";
import { fail, ok } from "@/lib/http/responses";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  return ok({ user: safeUser(user) });
}
