import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/domain/events";
import { fail, ok } from "@/lib/http/responses";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { projectId } = await params;
  const membership = await getProjectMembership(projectId, user.id);
  if (!membership) {
    return fail("Project not found.", "NOT_FOUND", 404);
  }

  if (membership.role !== "freelancer") {
    return fail("Only freelancer project members can invite clients.", "FORBIDDEN", 403);
  }

  await prisma.projectInvitation.updateMany({
    where: { projectId, isActive: true },
    data: { isActive: false },
  });

  const invitation = await prisma.projectInvitation.create({
    data: {
      projectId,
      createdById: user.id,
      token: crypto.randomBytes(24).toString("hex"),
    },
  });

  await logActivity({
    projectId,
    userId: user.id,
    action: "CLIENT_INVITED",
    metadata: { invitationId: invitation.id },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return ok(
    { invite_link: `${appUrl}/invite/${invitation.token}`, invitation },
    "Invitation generated",
  );
}
