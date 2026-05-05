import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTaskWithMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity, notifyProjectMembers } from "@/lib/domain/events";
import { created, fail, ok } from "@/lib/http/responses";
import { submissionSchema } from "@/lib/validation/schemas";

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

  const submissions = await prisma.submission.findMany({
    where: { taskId },
    include: {
      submittedBy: { select: { id: true, name: true } },
      attachments: true,
      review: true,
    },
    orderBy: { version: "asc" },
  });

  return ok({ submissions });
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

  if (access.membership.role !== "freelancer") {
    return fail("Only freelancer project members can submit work.", "FORBIDDEN", 403);
  }

  const parsed = submissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid submission data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const latest = await prisma.submission.findFirst({
    where: { taskId },
    orderBy: { version: "desc" },
  });

  const submission = await prisma.submission.create({
    data: {
      taskId,
      submittedById: user.id,
      version: (latest?.version ?? 0) + 1,
      notes: parsed.data.notes,
    },
    include: { attachments: true, submittedBy: { select: { id: true, name: true } } },
  });

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: "review" },
  });

  await logActivity({
    projectId: task.projectId,
    taskId,
    userId: user.id,
    action: "SUBMISSION_CREATED",
    metadata: { submissionId: submission.id, version: submission.version },
  });

  await notifyProjectMembers({
    projectId: task.projectId,
    exceptUserId: user.id,
    role: "client",
    type: "submission",
    title: "Work submitted for review",
    message: `${task.title} has revision ${submission.version} ready for review.`,
    referenceType: "submission",
    referenceId: submission.id,
  });

  return created({ submission, task }, "Submission created");
}
