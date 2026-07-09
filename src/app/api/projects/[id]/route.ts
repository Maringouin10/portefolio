import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, deleteUploadedFile, UploadError } from "@/lib/uploads";
import { uniqueSlug } from "@/lib/slug";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
    },
  });
  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.project.findUnique({
      where: { id: params.id },
      include: { images: true, videos: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    const formData = await req.formData();

    const title = (formData.get("title") as string | null)?.trim();
    const description = (formData.get("description") as string | null)?.trim();
    const category = (formData.get("category") as string | null)?.trim() || null;
    const published = formData.get("published") === "true";

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description sont requis" }, { status: 400 });
    }

    let slug = existing.slug;
    if (title !== existing.title) {
      slug = await uniqueSlug(title, existing.id);
    }

    let coverImage = existing.coverImage;
    const coverFile = formData.get("coverImage") as File | null;
    if (coverFile && coverFile.size > 0) {
      coverImage = await saveUploadedFile(coverFile, "images", "image");
      await deleteUploadedFile(existing.coverImage);
    }

    let modelFile = existing.modelFile;
    let modelFileName = existing.modelFileName;
    const modelUpload = formData.get("modelFile") as File | null;
    if (modelUpload && modelUpload.size > 0) {
      modelFile = await saveUploadedFile(modelUpload, "models", "model");
      modelFileName = modelUpload.name;
      await deleteUploadedFile(existing.modelFile);
    }

    const removeImageIds = formData.getAll("removeImages") as string[];
    const newImageFiles = formData.getAll("images") as File[];
    const newImagePaths: string[] = [];
    for (const file of newImageFiles) {
      if (file && file.size > 0) {
        newImagePaths.push(await saveUploadedFile(file, "images", "image"));
      }
    }

    const removeVideoIds = formData.getAll("removeVideos") as string[];
    const newVideoUrlEntries = (formData.getAll("videoUrls") as string[])
      .map((url) => url.trim())
      .filter(Boolean);
    const newVideoFiles = formData.getAll("videoFiles") as File[];
    const newVideoPaths: string[] = [...newVideoUrlEntries];
    for (const file of newVideoFiles) {
      if (file && file.size > 0) {
        newVideoPaths.push(await saveUploadedFile(file, "videos", "video"));
      }
    }

    const remainingImageCount = existing.images.filter((img) => !removeImageIds.includes(img.id)).length;
    const remainingVideoCount = existing.videos.filter((v) => !removeVideoIds.includes(v.id)).length;

    const project = await prisma.$transaction(async (tx) => {
      if (removeImageIds.length > 0) {
        const toRemove = existing.images.filter((img) => removeImageIds.includes(img.id));
        await tx.projectImage.deleteMany({
          where: { id: { in: removeImageIds }, projectId: existing.id },
        });
        for (const img of toRemove) {
          await deleteUploadedFile(img.url);
        }
      }
      if (newImagePaths.length > 0) {
        await tx.projectImage.createMany({
          data: newImagePaths.map((url, i) => ({
            url,
            projectId: existing.id,
            order: remainingImageCount + i,
          })),
        });
      }

      if (removeVideoIds.length > 0) {
        const toRemove = existing.videos.filter((v) => removeVideoIds.includes(v.id));
        await tx.projectVideo.deleteMany({
          where: { id: { in: removeVideoIds }, projectId: existing.id },
        });
        for (const v of toRemove) {
          await deleteUploadedFile(v.url);
        }
      }
      if (newVideoPaths.length > 0) {
        await tx.projectVideo.createMany({
          data: newVideoPaths.map((url, i) => ({
            url,
            projectId: existing.id,
            order: remainingVideoCount + i,
          })),
        });
      }

      return tx.project.update({
        where: { id: existing.id },
        data: { title, slug, description, category, coverImage, modelFile, modelFileName, published },
        include: {
          images: { orderBy: { order: "asc" } },
          videos: { orderBy: { order: "asc" } },
        },
      });
    });

    return NextResponse.json(project);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur lors de la mise a jour du projet" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.project.findUnique({
    where: { id: params.id },
    include: { images: true, videos: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: existing.id } });

  await deleteUploadedFile(existing.coverImage);
  await deleteUploadedFile(existing.modelFile);
  for (const img of existing.images) {
    await deleteUploadedFile(img.url);
  }
  for (const v of existing.videos) {
    await deleteUploadedFile(v.url);
  }

  return NextResponse.json({ ok: true });
}
