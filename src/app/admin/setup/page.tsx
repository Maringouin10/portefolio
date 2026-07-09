import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SetupForm from "@/components/admin/SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    redirect("/admin/login");
  }

  return <SetupForm />;
}
