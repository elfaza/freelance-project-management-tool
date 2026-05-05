import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity, notifyProjectMembers } from "@/lib/domain/events";
import { created, fail } from "@/lib/http/responses";
import { reviewSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ submissionId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { task: true, review: true },
  });

  if (!submission) {
    return fail("Submission not found.", "NOT_FOUND", 404);
  }

  if (submission.review) {
    return fail("Submission has already been reviewed.", "CONFLICT", 409);
  }

  const membership = await getProjectMembership(submission.task.projectId, user.id);
  if (!membership) {
    return fail("Submission not found.", "NOT_FOUND", 404);
  }

  if (membership.role !== "client") {
    return fail("Only client project members can review submissions.", "FORBIDDEN", 403);
  }

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid review data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const review = await prisma.review.create({
    data: {
      submissionId,
      reviewedById: user.id,
      decision: parsed.data.decision,
      feedback: parsed.data.feedback,
    },
  });

  const task = await prisma.task.update({
    where: { id: submission.taskId },
    data: {
      status: parsed.data.decision === "approved" ? "done" : "in_progress",
    },
  });

  await logActivity({
    projectId: task.projectId,
    taskId: task.id,
    userId: user.id,
    action: parsed.data.decision === "approved" ? "REVIEW_APPROVED" : "REVISION_REQUESTED",
    metadata: { submissionId, reviewId: review.id },
  });

  await notifyProjectMembers({
    projectId: task.projectId,
    exceptUserId: user.id,
    role: "freelancer",
    type: "review",
    title: parsed.data.decision === "approved" ? "Submission approved" : "Revision requested",
    message:
      parsed.data.decision === "approved"
        ? `${task.title} was approved.`
        : `${task.title} needs a revision.`,
    referenceType: "submission",
    referenceId: submission.id,
  });

  return created({ review, task }, "Review recorded");
}
