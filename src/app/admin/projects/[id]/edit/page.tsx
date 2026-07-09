import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Modifier &laquo; {project.title} &raquo;</h1>
      <ProjectForm project={project} />
    </div>
  );
}
