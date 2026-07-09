import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImageGallery from "@/components/ImageGallery";
import VideoPlayer from "@/components/VideoPlayer";
import ModelViewer from "@/components/ModelViewer";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
    },
  });

  if (!project || !project.published) {
    notFound();
  }

  const images = [project.coverImage, ...project.images.map((i) => i.url)];
  const modelExt = project.modelFile?.split(".").pop()?.toLowerCase();
  const canPreviewModel = modelExt === "glb" || modelExt === "gltf";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/" className="text-xs uppercase tracking-widest text-black/50 hover:text-black">
        &larr; Retour
      </Link>

      <div className="mt-4 grid md:grid-cols-2 gap-10">
        <ImageGallery images={images} title={project.title} />

        <div>
          {project.category && (
            <p className="text-xs uppercase tracking-widest text-black/50 mb-2">{project.category}</p>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <p className="mt-4 whitespace-pre-line text-black/80 leading-relaxed">{project.description}</p>

          {project.modelFile && (
            <a
              href={project.modelFile}
              download
              className="mt-6 inline-block border border-black px-5 py-2.5 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Telecharger le fichier 3D{project.modelFileName ? ` (${project.modelFileName})` : ""}
            </a>
          )}
        </div>
      </div>

      {project.modelFile && (
        <section className="mt-14">
          <h2 className="text-xs uppercase tracking-widest text-black/50 mb-3">Apercu 3D</h2>
          {canPreviewModel ? (
            <ModelViewer src={project.modelFile} alt={project.title} />
          ) : (
            <p className="text-sm text-black/50 border border-black/10 p-4">
              Apercu non disponible pour ce format. Telechargez le fichier pour le visualiser dans votre
              logiciel 3D.
            </p>
          )}
        </section>
      )}

      {project.videos.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xs uppercase tracking-widest text-black/50 mb-3">
            {project.videos.length > 1 ? "Videos" : "Video"}
          </h2>
          <div className="space-y-8">
            {project.videos.map((video) => (
              <VideoPlayer key={video.id} url={video.url} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
