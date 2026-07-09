import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Deliberately outside public/: Next.js only serves files that exist under
// public/ at server boot, so anything uploaded at runtime would 404 until
// the process restarts. Files are served instead via src/app/uploads/[...path]/route.ts,
// which reads from disk on every request.
const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");

const LIMITS: Record<string, { extensions: string[]; maxBytes: number }> = {
  image: {
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxBytes: 15 * 1024 * 1024,
  },
  video: {
    extensions: [".mp4", ".webm", ".ogg", ".mov"],
    maxBytes: 300 * 1024 * 1024,
  },
  model: {
    extensions: [".glb", ".gltf", ".stl", ".obj", ".3mf", ".fbx"],
    maxBytes: 150 * 1024 * 1024,
  },
};

export class UploadError extends Error {}

export async function saveUploadedFile(
  file: File,
  subfolder: string,
  kind: keyof typeof LIMITS
): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  const limit = LIMITS[kind];

  if (!limit.extensions.includes(ext)) {
    throw new UploadError(
      `Extension non autorisee pour ce type de fichier (${limit.extensions.join(", ")})`
    );
  }
  if (file.size > limit.maxBytes) {
    throw new UploadError(
      `Fichier trop volumineux (max ${Math.round(limit.maxBytes / (1024 * 1024))} Mo)`
    );
  }

  const dir = path.join(UPLOAD_ROOT, subfolder);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subfolder}/${filename}`;
}

export async function deleteUploadedFile(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const relative = publicPath.slice("/uploads/".length);
  const filePath = path.join(UPLOAD_ROOT, relative);
  try {
    await unlink(filePath);
  } catch {
    // best effort cleanup, ignore missing files
  }
}
