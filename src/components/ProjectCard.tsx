import Link from "next/link";
import Image from "next/image";

type Props = {
  project: {
    slug: string;
    title: string;
    coverImage: string;
    category: string | null;
  };
};

export default function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block bg-white aspect-square overflow-hidden"
    >
      <Image
        src={project.coverImage}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-black/85 text-white px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-sm font-medium truncate">{project.title}</p>
        {project.category && (
          <p className="text-[10px] uppercase tracking-widest text-white/60">{project.category}</p>
        )}
      </div>
    </Link>
  );
}
