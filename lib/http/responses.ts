import { NextResponse } from "next/server";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export function ok<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function fail(
  message: string,
  code: ErrorCode,
  status: number,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code, details },
    },
    { status },
  );
}

export function created<T>(data: T, message = "Created") {
  return ok(data, message, 201);
}
