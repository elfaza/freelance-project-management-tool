import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity, notifyProjectMembers } from "@/lib/domain/events";
import { created, fail } from "@/lib/http/responses";
import { taskSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const parsed = taskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid task data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const membership = await getProjectMembership(parsed.data.project_id, user.id);
  if (!membership) {
    return fail("Project not found.", "NOT_FOUND", 404);
  }

  const task = await prisma.task.create({
    data: {
      projectId: parsed.data.project_id,
      createdById: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.due_date ? new Date(parsed.data.due_date) : null,
      type: membership.role === "freelancer" ? "feature" : "change_request",
      status: "todo",
    },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
    },
  });

  await logActivity({
    projectId: task.projectId,
    taskId: task.id,
    userId: user.id,
    action: "TASK_CREATED",
    metadata: { title: task.title, type: task.type },
  });

  await notifyProjectMembers({
    projectId: task.projectId,
    exceptUserId: user.id,
    type: "task_update",
    title: "Task created",
    message: `${user.name} created ${task.title}.`,
    referenceType: "task",
    referenceId: task.id,
  });

  return created({ task }, "Task created");
}
