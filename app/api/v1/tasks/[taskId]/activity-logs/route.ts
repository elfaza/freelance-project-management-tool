import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTaskWithMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http/responses";

type Params = { params: Promise<{ taskId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { taskId } = await params;
  const access = await getTaskWithMembership(taskId, user.id);
  if (!access) {
    return fail("Task not found.", "NOT_FOUND", 404);
  }

  const activityLogs = await prisma.activityLog.findMany({
    where: { taskId },
    include: {
      user: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({ activity_logs: activityLogs });
}
