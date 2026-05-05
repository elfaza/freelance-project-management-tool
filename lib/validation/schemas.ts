import { z } from "zod";

export const roleSchema = z.enum(["freelancer", "client"]);
export const themeSchema = z.enum(["light", "dark", "system"]);
export const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "review",
  "done",
]);

export const registerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  role: roleSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  start_date: z.string().date(),
  end_date: z.string().date().optional().nullable(),
});

export const taskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  due_date: z.string().date().optional().nullable(),
});

export const taskStatusUpdateSchema = z.object({
  status: taskStatusSchema,
});

export const submissionSchema = z.object({
  notes: z.string().trim().optional(),
});

export const reviewSchema = z
  .object({
    decision: z.enum(["approved", "revision_requested"]),
    feedback: z.string().trim().optional(),
  })
  .refine(
    (data) => data.decision === "approved" || Boolean(data.feedback),
    {
      message: "Feedback is required when requesting revision.",
      path: ["feedback"],
    },
  );

export const commentSchema = z.object({
  content: z.string().trim().min(1),
});

export const inviteAcceptSchema = z.object({
  token: z.string().trim().min(1),
});

export const preferenceSchema = z.object({
  theme: themeSchema,
});
