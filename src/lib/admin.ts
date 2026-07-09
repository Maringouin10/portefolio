import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function hasAdmin(): Promise<boolean> {
  const count = await prisma.admin.count();
  return count > 0;
}

export async function createAdmin(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.admin.create({ data: { email, passwordHash } });
}

export async function verifyAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  return valid ? admin : null;
}
