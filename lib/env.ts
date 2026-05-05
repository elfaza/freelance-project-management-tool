import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  UPLOAD_STORAGE: z.enum(["local"]).default("local"),
  CSRF_SECRET: z.string().min(32),
});

export function getEnv() {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    APP_URL: process.env.APP_URL ?? "http://localhost:3000",
    NODE_ENV: process.env.NODE_ENV ?? "development",
    UPLOAD_STORAGE: process.env.UPLOAD_STORAGE ?? "local",
    CSRF_SECRET: process.env.CSRF_SECRET,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment: ${parsed.error.issues
        .map((issue) => issue.path.join("."))
        .join(", ")}`,
    );
  }

  return parsed.data;
}
