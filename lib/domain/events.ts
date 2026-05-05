import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function logActivity(input: {
  projectId: string;
  taskId?: string;
  userId: string;
  action: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.activityLog.create({
    data: {
      projectId: input.projectId,
      taskId: input.taskId,
      userId: input.userId,
      action: input.action,
      metadata: input.metadata,
    },
  });
}

export async function notifyProjectMembers(input: {
  projectId: string;
  exceptUserId?: string;
  role?: UserRole;
  type: "invitation" | "task_update" | "submission" | "review" | "comment" | "file_upload";
  title: string;
  message: string;
  referenceType: "project" | "task" | "submission" | "comment";
  referenceId: string;
}) {
  const members = await prisma.projectMember.findMany({
    where: {
      projectId: input.projectId,
      ...(input.role ? { role: input.role } : {}),
      ...(input.exceptUserId ? { userId: { not: input.exceptUserId } } : {}),
    },
    select: { userId: true },
  });

  if (members.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: members.map((member) => ({
      userId: member.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
    })),
  });
}
