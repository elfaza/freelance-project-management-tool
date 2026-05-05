import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTaskWithMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity, notifyProjectMembers } from "@/lib/domain/events";
import { created, fail } from "@/lib/http/responses";
import { saveLocalFile } from "@/lib/storage/files";

type Params = { params: Promise<{ taskId: string }> };

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

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail("A file is required.", "VALIDATION_ERROR", 422);
  }

  try {
    const stored = await saveLocalFile(file);
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        uploadedById: user.id,
        fileName: stored.originalName,
        fileUrl: stored.fileUrl,
        fileSize: stored.fileSize,
        fileType: stored.fileType,
      },
    });

    await logActivity({
      projectId: access.task.projectId,
      taskId,
      userId: user.id,
      action: "FILE_UPLOADED",
      metadata: { attachmentId: attachment.id, fileName: attachment.fileName },
    });

    await notifyProjectMembers({
      projectId: access.task.projectId,
      exceptUserId: user.id,
      type: "file_upload",
      title: "Task file uploaded",
      message: `${user.name} uploaded ${attachment.fileName}.`,
      referenceType: "task",
      referenceId: taskId,
    });

    return created({ attachment }, "Attachment uploaded");
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Upload failed.",
      "VALIDATION_ERROR",
      422,
    );
  }
}
