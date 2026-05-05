import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const maxFileSize = 10 * 1024 * 1024;
const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
  ".zip",
]);
const blockedExtensions = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".scr",
  ".ps1",
  ".sh",
]);

export function validateUpload(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if (file.size > maxFileSize) {
    return "File exceeds the 10 MB limit.";
  }

  if (blockedExtensions.has(extension) || !allowedExtensions.has(extension)) {
    return "File type is not allowed.";
  }

  return null;
}

export async function saveLocalFile(file: File) {
  const validationError = validateUpload(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.name).toLowerCase();
  const storedName = `${crypto.randomUUID()}${extension}`;
  const storedPath = path.join(uploadDir, storedName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(storedPath, bytes);

  return {
    originalName: file.name,
    fileUrl: `/uploads/${storedName}`,
    fileSize: file.size,
    fileType: file.type || extension.slice(1),
  };
}
