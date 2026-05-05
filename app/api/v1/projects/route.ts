import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/domain/events";
import { created, fail, ok } from "@/lib/http/responses";
import { projectSchema } from "@/lib/validation/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      tasks: {
        select: { id: true, status: true, type: true },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok({ projects });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Authentication required.", "UNAUTHORIZED", 401);
  }

  if (user.role !== "freelancer") {
    return fail("Only freelancers can create projects.", "FORBIDDEN", 403);
  }

  const parsed = projectSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid project data.", "VALIDATION_ERROR", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      startDate: new Date(parsed.data.start_date),
      endDate: parsed.data.end_date ? new Date(parsed.data.end_date) : null,
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: "freelancer",
        },
      },
    },
    include: { members: true },
  });

  await logActivity({
    projectId: project.id,
    userId: user.id,
    action: "PROJECT_CREATED",
    metadata: { name: project.name },
  });

  return created({ project }, "Project created");
}
