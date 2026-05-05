import { describe, expect, it } from "vitest";

import {
  preferenceSchema,
  registerSchema,
  reviewSchema,
  taskSchema,
  taskStatusUpdateSchema,
} from "../../lib/validation/schemas";

describe("validation schemas", () => {
  it("accepts freelancer and client registration roles", () => {
    const baseUser = {
      name: "Alex Freelancer",
      email: "alex@example.com",
      password: "password123",
    };

    expect(registerSchema.safeParse({ ...baseUser, role: "freelancer" }).success).toBe(
      true,
    );
    expect(registerSchema.safeParse({ ...baseUser, role: "client" }).success).toBe(
      true,
    );
  });

  it("rejects unsupported registration roles", () => {
    const result = registerSchema.safeParse({
      name: "Morgan Manager",
      email: "morgan@example.com",
      password: "password123",
      role: "admin",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes registration email before persistence", () => {
    const result = registerSchema.parse({
      name: "Casey Client",
      email: " CASEY@EXAMPLE.COM ",
      password: "password123",
      role: "client",
    });

    expect(result.email).toBe("casey@example.com");
  });

  it("accepts only MVP task statuses", () => {
    for (const status of ["todo", "in_progress", "review", "done"]) {
      expect(taskStatusUpdateSchema.safeParse({ status }).success).toBe(true);
    }

    expect(taskStatusUpdateSchema.safeParse({ status: "blocked" }).success).toBe(
      false,
    );
  });

  it("requires ISO date strings for project task due dates", () => {
    expect(
      taskSchema.safeParse({
        project_id: "11111111-1111-4111-8111-111111111111",
        title: "Build onboarding",
        due_date: "2026-05-15",
      }).success,
    ).toBe(true);

    expect(
      taskSchema.safeParse({
        project_id: "11111111-1111-4111-8111-111111111111",
        title: "Build onboarding",
        due_date: "May 15",
      }).success,
    ).toBe(false);
  });

  it("requires feedback when requesting a revision", () => {
    expect(reviewSchema.safeParse({ decision: "approved" }).success).toBe(true);
    expect(
      reviewSchema.safeParse({
        decision: "revision_requested",
        feedback: "Please update the header copy.",
      }).success,
    ).toBe(true);
    expect(
      reviewSchema.safeParse({ decision: "revision_requested" }).success,
    ).toBe(false);
  });

  it("accepts only supported theme preferences", () => {
    for (const theme of ["light", "dark", "system"]) {
      expect(preferenceSchema.safeParse({ theme }).success).toBe(true);
    }

    expect(preferenceSchema.safeParse({ theme: "sepia" }).success).toBe(false);
  });
});
