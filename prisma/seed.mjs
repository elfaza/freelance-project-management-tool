import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed demo data.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const freelancer = await prisma.user.upsert({
    where: { email: "freelancer@example.com" },
    update: { theme: "system" },
    create: {
      name: "Maya Freelancer",
      email: "freelancer@example.com",
      passwordHash,
      role: "freelancer",
      theme: "system",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: { theme: "system" },
    create: {
      name: "Iris Client",
      email: "client@example.com",
      passwordHash,
      role: "client",
      theme: "system",
    },
  });

  await prisma.notification.deleteMany({
    where: {
      userId: {
        in: [freelancer.id, client.id],
      },
    },
  });

  await prisma.project.deleteMany({
    where: {
      name: "Client Portal Rebuild",
      createdById: freelancer.id,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Client Portal Rebuild",
      description: "Demo project for the FPMT approval and revision workflow.",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-24"),
      createdById: freelancer.id,
      members: {
        create: [
          { userId: freelancer.id, role: "freelancer" },
          { userId: client.id, role: "client" },
        ],
      },
    },
  });

  const todoTask = await prisma.task.create({
    data: {
      projectId: project.id,
      createdById: freelancer.id,
      title: "Draft acceptance criteria",
      description: "Define review-ready acceptance criteria for the portal.",
      status: "todo",
      type: "feature",
      dueDate: new Date("2026-05-04"),
    },
  });

  const inProgressTask = await prisma.task.create({
    data: {
      projectId: project.id,
      createdById: client.id,
      title: "Adjust dashboard spacing",
      description: "Client change request for mobile spacing refinements.",
      status: "in_progress",
      type: "change_request",
      dueDate: new Date("2026-05-07"),
    },
  });

  const reviewTask = await prisma.task.create({
    data: {
      projectId: project.id,
      createdById: freelancer.id,
      title: "Submit dashboard revision",
      description: "Submit revision package for client review.",
      status: "review",
      type: "feature",
      dueDate: new Date("2026-05-03"),
    },
  });

  const doneTask = await prisma.task.create({
    data: {
      projectId: project.id,
      createdById: freelancer.id,
      title: "Approve kickoff brief",
      description: "Kickoff brief approved by the client.",
      status: "done",
      type: "feature",
      dueDate: new Date("2026-05-02"),
    },
  });

  const submission = await prisma.submission.create({
    data: {
      taskId: reviewTask.id,
      submittedById: freelancer.id,
      version: 1,
      notes: "Revision 1 includes dashboard layout and attachment rows.",
    },
  });

  await prisma.review.create({
    data: {
      submissionId: submission.id,
      reviewedById: client.id,
      decision: "revision_requested",
      feedback: "Please tighten the mobile spacing and resubmit.",
    },
  });

  await prisma.comment.create({
    data: {
      taskId: inProgressTask.id,
      userId: client.id,
      content: "The updated spacing should match the approved mockups.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: freelancer.id,
        type: "review",
        title: "Revision requested",
        message: "Iris requested changes on the dashboard revision.",
        referenceType: "submission",
        referenceId: submission.id,
      },
      {
        userId: client.id,
        type: "task_update",
        title: "Task ready",
        message: "Draft acceptance criteria is ready to review.",
        referenceType: "task",
        referenceId: todoTask.id,
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        projectId: project.id,
        userId: freelancer.id,
        action: "PROJECT_CREATED",
        metadata: { name: project.name },
      },
      {
        projectId: project.id,
        taskId: reviewTask.id,
        userId: freelancer.id,
        action: "SUBMISSION_CREATED",
        metadata: { submissionId: submission.id, version: 1 },
      },
      {
        projectId: project.id,
        taskId: reviewTask.id,
        userId: client.id,
        action: "REVISION_REQUESTED",
        metadata: { submissionId: submission.id },
      },
      {
        projectId: project.id,
        taskId: doneTask.id,
        userId: client.id,
        action: "REVIEW_APPROVED",
        metadata: { title: doneTask.title },
      },
    ],
  });

  console.log("Seeded demo users and Client Portal Rebuild project.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
