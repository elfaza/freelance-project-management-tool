import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/domain/events";
import { created, fail } from "@/lib/http/responses";
import { saveLocalFile } from "@/lib/storage/files";

type Params = { params: Promise<{ submissionId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { task: true },
  });

  if (!submission) {
    return fail("Submission not found.", "NOT_FOUND", 404);
  }

  const membership = await getProjectMembership(submission.task.projectId, user.id);
  if (!membership) {
    return fail("Submission not found.", "NOT_FOUND", 404);
  }

  if (membership.role !== "freelancer") {
    return fail("Only freelancer project members can upload submission files.", "FORBIDDEN", 403);
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail("A file is required.", "VALIDATION_ERROR", 422);
  }

  try {
    const stored = await saveLocalFile(file);
    const attachment = await prisma.submissionAttachment.create({
      data: {
        submissionId,
        uploadedById: user.id,
        fileName: stored.originalName,
        fileUrl: stored.fileUrl,
        fileSize: stored.fileSize,
        fileType: stored.fileType,
      },
    });

    await logActivity({
      projectId: submission.task.projectId,
      taskId: submission.taskId,
      userId: user.id,
      action: "FILE_UPLOADED",
      metadata: { attachmentId: attachment.id, fileName: attachment.fileName },
    });

    return created({ attachment }, "Submission attachment uploaded");
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Upload failed.",
      "VALIDATION_ERROR",
      422,
    );
  }
}
