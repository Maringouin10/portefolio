import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProjectCard from "@/components/ProjectCard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;

  const [projects, all] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({ where: { published: true }, select: { category: true } }),
  ]);

  const categories = Array.from(new Set(all.map((p) => p.category).filter(Boolean))) as string[];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Mes projets</h1>
        <p className="text-black/60 mt-2 max-w-2xl">
          Une collection de projets - design, impression 3D, developpement.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 text-xs uppercase tracking-widest">
          <Link
            href="/"
            className={`px-3 py-1.5 border ${
              !category ? "bg-black text-white border-black" : "border-black/20 hover:border-black"
            }`}
          >
            Tous
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`px-3 py-1.5 border ${
                category === c ? "bg-black text-white border-black" : "border-black/20 hover:border-black"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <p className="text-black/50">Aucun projet publie pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-black border border-black">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
