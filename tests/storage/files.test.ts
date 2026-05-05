import { describe, expect, it } from "vitest";

import { validateUpload } from "../../lib/storage/files";

function fileLike(name: string, size: number, type = "application/octet-stream") {
  return { name, size, type } as File;
}

describe("upload validation", () => {
  it("accepts allowed files at or under 10 MB", () => {
    expect(validateUpload(fileLike("brief.pdf", 10 * 1024 * 1024))).toBeNull();
    expect(validateUpload(fileLike("screenshot.png", 42_000, "image/png"))).toBeNull();
  });

  it("rejects files larger than 10 MB", () => {
    expect(validateUpload(fileLike("large.pdf", 10 * 1024 * 1024 + 1))).toBe(
      "File exceeds the 10 MB limit.",
    );
  });

  it("rejects executable and unsupported file extensions", () => {
    expect(validateUpload(fileLike("installer.exe", 100))).toBe(
      "File type is not allowed.",
    );
    expect(validateUpload(fileLike("archive.rar", 100))).toBe(
      "File type is not allowed.",
    );
  });

  it("treats extensions case-insensitively", () => {
    expect(validateUpload(fileLike("proposal.PDF", 100))).toBeNull();
    expect(validateUpload(fileLike("script.PS1", 100))).toBe(
      "File type is not allowed.",
    );
  });
});
