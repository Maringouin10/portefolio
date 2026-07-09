import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Projets ({projects.length})</h1>
        <Link
          href="/admin/projects/new"
          className="border border-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
        >
          + Nouveau projet
        </Link>
      </div>

      <div className="border border-black divide-y divide-black">
        {projects.length === 0 && <p className="p-6 text-black/50">Aucun projet pour le moment.</p>}
        {projects.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.coverImage} alt={p.title} className="w-14 h-14 object-cover border border-black/10 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-xs text-black/50 uppercase tracking-widest">
                  {p.published ? "Publie" : "Brouillon"}
                  {p.category ? ` · ${p.category}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm shrink-0">
              <Link href={`/projects/${p.slug}`} target="_blank" className="hover:underline">
                Voir
              </Link>
              <Link href={`/admin/projects/${p.id}/edit`} className="hover:underline">
                Modifier
              </Link>
              <DeleteProjectButton id={p.id} title={p.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
