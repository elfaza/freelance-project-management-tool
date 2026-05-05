import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http/responses";
import { projectSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const { projectId } = await params;
  const membership = await getProjectMembership(projectId, user.id);
  if (!membership) {
    return fail("Project not found.", "NOT_FOUND", 404);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      tasks: {
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  return ok({ project });
}

export async function PATCH(request: NextRequest, { params }: Params) {
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
    return fail("Only freelancer project members can edit projects.", "FORBIDDEN", 403);
  }

  const parsed = projectSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid project data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      startDate: new Date(parsed.data.start_date),
      endDate: parsed.data.end_date ? new Date(parsed.data.end_date) : null,
    },
  });

  return ok({ project }, "Project updated");
}
