import slugify from "slugify";
import { prisma } from "./prisma";

export async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true }) || "projet";
  let slug = base;
  let attempt = 1;

  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) {
      return slug;
    }
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
}
