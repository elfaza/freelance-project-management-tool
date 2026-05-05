import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http/responses";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { projectId } = await params;
  const membership = await getProjectMembership(projectId, user.id);
  if (!membership) {
    return fail("Project not found.", "NOT_FOUND", 404);
  }

  const activityLogs = await prisma.activityLog.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({ activity_logs: activityLogs });
}
