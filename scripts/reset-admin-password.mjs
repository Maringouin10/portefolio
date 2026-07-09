import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: npm run reset-admin -- "email@example.com" "nouveau-mot-de-passe"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("Le mot de passe doit contenir au moins 8 caracteres");
  process.exit(1);
}

const prisma = new PrismaClient();

const passwordHash = await bcrypt.hash(password, 10);

await prisma.admin.upsert({
  where: { email },
  update: { passwordHash },
  create: { email, passwordHash },
});

console.log(`Mot de passe enregistre pour ${email}`);

await prisma.$disconnect();
