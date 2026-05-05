import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTaskWithMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity, notifyProjectMembers } from "@/lib/domain/events";
import { created, fail, ok } from "@/lib/http/responses";
import { commentSchema } from "@/lib/validation/schemas";

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

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return ok({ comments });
}

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { taskId } = await params;
  const access = await getTaskWithMembership(taskId, user.id);
  if (!access) {
    return fail("Task not found.", "NOT_FOUND", 404);
  }

  const parsed = commentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid comment data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId: user.id,
      content: parsed.data.content,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  await logActivity({
    projectId: access.task.projectId,
    taskId,
    userId: user.id,
    action: "COMMENT_CREATED",
    metadata: { commentId: comment.id },
  });

  await notifyProjectMembers({
    projectId: access.task.projectId,
    exceptUserId: user.id,
    type: "comment",
    title: "New task comment",
    message: `${user.name} commented on ${access.task.title}.`,
    referenceType: "comment",
    referenceId: comment.id,
  });

  return created({ comment }, "Comment added");
}
