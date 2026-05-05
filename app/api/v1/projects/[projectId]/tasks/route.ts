import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http/responses";
import { taskStatusSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { projectId } = await params;
  const membership = await getProjectMembership(projectId, user.id);
  if (!membership) {
    return fail("Project not found.", "NOT_FOUND", 404);
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const parsedStatus = statusParam ? taskStatusSchema.safeParse(statusParam) : null;
  if (parsedStatus && !parsedStatus.success) {
    return fail("Invalid status filter.", "VALIDATION_ERROR", 422);
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      ...(parsedStatus?.success ? { status: parsedStatus.data } : {}),
    },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
      _count: { select: { comments: true, submissions: true, attachments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({ tasks });
}
