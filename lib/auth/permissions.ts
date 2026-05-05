import { prisma } from "@/lib/db/prisma";

export async function getProjectMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
}

export async function requireProjectMember(projectId: string, userId: string) {
  return getProjectMembership(projectId, userId);
}

export async function getTaskWithMembership(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!task || task.project.members.length === 0) {
    return null;
  }

  return {
    task,
    membership: task.project.members[0],
  };
}
