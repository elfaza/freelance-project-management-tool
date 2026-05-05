import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http/responses";

type Params = { params: Promise<{ notificationId: string }> };

export async function PATCH(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { notificationId } = await params;
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: user.id,
    },
  });

  if (!notification) {
    return fail("Notification not found.", "NOT_FOUND", 404);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return ok({ notification: updated }, "Notification marked as read");
}
