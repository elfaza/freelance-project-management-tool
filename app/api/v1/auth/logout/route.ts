import { ok } from "@/lib/http/responses";
import { sessionCookieName } from "@/lib/auth/session";

export async function POST() {
  const response = ok({}, "Logout successful");
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
