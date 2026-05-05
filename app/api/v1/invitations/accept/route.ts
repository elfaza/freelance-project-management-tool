import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/domain/events";
import { fail, ok } from "@/lib/http/responses";
import { inviteAcceptSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  if (user.role !== "client") {
    return fail("Only clients can accept project invitations.", "FORBIDDEN", 403);
  }

  const parsed = inviteAcceptSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid invitation data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const invitation = await prisma.projectInvitation.findUnique({
    where: { token: parsed.data.token },
    include: { project: true },
  });

  if (
    !invitation ||
    !invitation.isActive ||
    (invitation.expiresAt && invitation.expiresAt < new Date())
  ) {
    return fail("Invitation is invalid or expired.", "NOT_FOUND", 404);
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: invitation.projectId,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    return fail("User is already a project member.", "CONFLICT", 409);
  }

  await prisma.projectMember.create({
    data: {
      projectId: invitation.projectId,
      userId: user.id,
      role: "client",
    },
  });

  await logActivity({
    projectId: invitation.projectId,
    userId: user.id,
    action: "CLIENT_JOINED",
    metadata: { invitationId: invitation.id },
  });

  await prisma.notification.create({
    data: {
      userId: invitation.createdById,
      type: "invitation",
      title: "Client joined project",
      message: `${user.name} accepted the invitation for ${invitation.project.name}.`,
      referenceType: "project",
      referenceId: invitation.projectId,
    },
  });

  return ok({ project: invitation.project }, "Invitation accepted");
}
