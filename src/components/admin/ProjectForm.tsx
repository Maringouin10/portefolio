"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type ExistingImage = { id: string; url: string };
type ExistingVideo = { id: string; url: string };

type ProjectData = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  coverImage: string;
  modelFile: string | null;
  modelFileName: string | null;
  published: boolean;
  images: ExistingImage[];
  videos: ExistingVideo[];
};

export default function ProjectForm({ project }: { project?: ProjectData }) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeImages, setRemoveImages] = useState<string[]>([]);
  const [removeVideos, setRemoveVideos] = useState<string[]>([]);

  function toggleRemove(id: string) {
    setRemoveImages((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleRemoveVideo(id: string) {
    setRemoveVideos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    removeImages.forEach((id) => formData.append("removeImages", id));
    removeVideos.forEach((id) => formData.append("removeVideos", id));

    const videoUrlsText = (formData.get("videoUrlsText") as string) || "";
    formData.delete("videoUrlsText");
    videoUrlsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((url) => formData.append("videoUrls", url));

    try {
      const res = await fetch(isEdit ? `/api/projects/${project!.id}` : "/api/projects", {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && <p className="border border-black bg-black text-white text-sm px-4 py-3">{error}</p>}

      <div>
        <label className="block text-xs uppercase tracking-widest mb-2">Titre *</label>
        <input
          name="title"
          required
          defaultValue={project?.title}
          className="w-full border border-black px-3 py-2 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-2">Categorie</label>
        <input
          name="category"
          defaultValue={project?.category ?? ""}
          placeholder="ex : Impression 3D, Web, Design..."
          className="w-full border border-black px-3 py-2 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-2">Description *</label>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={project?.description}
          className="w-full border border-black px-3 py-2 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-2">
          Image de couverture {isEdit ? "" : "*"}
        </label>
        {project?.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverImage} alt="" className="w-32 h-32 object-cover border border-black/10 mb-2" />
        )}
        <input
          type="file"
          name="coverImage"
          accept="image/*"
          required={!isEdit}
          className="w-full border border-black px-3 py-2 file:mr-4 file:border-0 file:bg-black file:text-white file:px-3 file:py-1.5 file:uppercase file:text-xs file:tracking-widest"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-2">Images de la galerie</label>
        {project && project.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {project.images.map((img) => (
              <label
                key={img.id}
                className={`relative block border cursor-pointer ${
                  removeImages.includes(img.id) ? "border-red-500 opacity-40" : "border-black/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-20 object-cover" />
                <input
                  type="checkbox"
                  className="absolute top-1 right-1"
                  checked={removeImages.includes(img.id)}
                  onChange={() => toggleRemove(img.id)}
                />
              </label>
            ))}
          </div>
        )}
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="w-full border border-black px-3 py-2 file:mr-4 file:border-0 file:bg-black file:text-white file:px-3 file:py-1.5 file:uppercase file:text-xs file:tracking-widest"
        />
        {isEdit && (
          <p className="text-xs text-black/40 mt-1">
            Cochez une image existante pour la supprimer. Ajoutez de nouveaux fichiers pour les ajouter.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-2">Videos</label>
        {project && project.videos.length > 0 && (
          <ul className="mb-3 space-y-1">
            {project.videos.map((v) => {
              const label = v.url.startsWith("/uploads/") ? v.url.split("/").pop() : v.url;
              return (
                <li
                  key={v.id}
                  className={`flex items-center justify-between border px-3 py-2 text-sm ${
                    removeVideos.includes(v.id) ? "border-red-500 opacity-40" : "border-black/10"
                  }`}
                >
                  <span className="truncate mr-2">{label}</span>
                  <label className="flex items-center gap-1 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeVideos.includes(v.id)}
                      onChange={() => toggleRemoveVideo(v.id)}
                    />
                    <span className="text-xs uppercase tracking-widest">Supprimer</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <label className="block text-xs uppercase tracking-widest mb-2">
          Ajouter des URLs (YouTube / Vimeo, une par ligne)
        </label>
        <textarea
          name="videoUrlsText"
          rows={3}
          placeholder={"https://youtube.com/watch?v=...\nhttps://vimeo.com/..."}
          className="w-full border border-black px-3 py-2 focus:outline-none"
        />
        <label className="block text-xs uppercase tracking-widest mb-2 mt-3">
          Ou ajouter des fichiers video
        </label>
        <input
          type="file"
          name="videoFiles"
          accept="video/*"
          multiple
          className="w-full border border-black px-3 py-2 file:mr-4 file:border-0 file:bg-black file:text-white file:px-3 file:py-1.5 file:uppercase file:text-xs file:tracking-widest"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-2">
          Fichier 3D (.glb, .gltf, .stl, .obj, .3mf, .fbx)
        </label>
        {project?.modelFileName && (
          <p className="text-xs text-black/40 mb-1">Fichier actuel : {project.modelFileName}</p>
        )}
        <input
          type="file"
          name="modelFile"
          accept=".glb,.gltf,.stl,.obj,.3mf,.fbx"
          className="w-full border border-black px-3 py-2 file:mr-4 file:border-0 file:bg-black file:text-white file:px-3 file:py-1.5 file:uppercase file:text-xs file:tracking-widest"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          name="published"
          value="true"
          defaultChecked={project?.published ?? true}
        />
        <label htmlFor="published" className="text-sm">
          Publie (visible sur le site)
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="border border-black px-6 py-2.5 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : isEdit ? "Mettre a jour" : "Creer le projet"}
      </button>
    </form>
  );
}
