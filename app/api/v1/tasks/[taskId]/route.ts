import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTaskWithMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity, notifyProjectMembers } from "@/lib/domain/events";
import { fail, ok } from "@/lib/http/responses";
import { taskStatusUpdateSchema } from "@/lib/validation/schemas";

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

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
      submissions: {
        include: {
          submittedBy: { select: { id: true, name: true } },
          attachments: true,
          review: true,
        },
        orderBy: { version: "asc" },
      },
      comments: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      attachments: true,
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return ok({ task, membership: access.membership });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { taskId } = await params;
  const access = await getTaskWithMembership(taskId, user.id);
  if (!access) {
    return fail("Task not found.", "NOT_FOUND", 404);
  }

  if (access.membership.role !== "freelancer") {
    return fail("Only freelancer project members can update task status.", "FORBIDDEN", 403);
  }

  const parsed = taskStatusUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid task status.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: parsed.data.status },
  });

  await logActivity({
    projectId: task.projectId,
    taskId,
    userId: user.id,
    action: "TASK_STATUS_CHANGED",
    metadata: { status: task.status },
  });

  await notifyProjectMembers({
    projectId: task.projectId,
    exceptUserId: user.id,
    type: "task_update",
    title: "Task status changed",
    message: `${task.title} moved to ${task.status}.`,
    referenceType: "task",
    referenceId: task.id,
  });

  return ok({ task }, "Task updated");
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { taskId } = await params;
  const access = await getTaskWithMembership(taskId, user.id);
  if (!access) {
    return fail("Task not found.", "NOT_FOUND", 404);
  }

  if (access.membership.role !== "freelancer") {
    return fail("Only freelancer project members can delete tasks.", "FORBIDDEN", 403);
  }

  await prisma.task.delete({ where: { id: taskId } });
  return ok({}, "Task deleted");
}
