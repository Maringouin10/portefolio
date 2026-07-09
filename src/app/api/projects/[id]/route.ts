import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, deleteUploadedFile, UploadError } from "@/lib/uploads";
import { uniqueSlug } from "@/lib/slug";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } },
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
      include: { images: true },
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

    let videoUrl = existing.videoUrl;
    const videoFile = formData.get("videoFile") as File | null;
    const videoUrlField = formData.get("videoUrl");
    if (videoFile && videoFile.size > 0) {
      videoUrl = await saveUploadedFile(videoFile, "videos", "video");
      await deleteUploadedFile(
        existing.videoUrl?.startsWith("/uploads/") ? existing.videoUrl : null
      );
    } else if (typeof videoUrlField === "string") {
      videoUrl = videoUrlField.trim() || null;
      if (existing.videoUrl?.startsWith("/uploads/") && existing.videoUrl !== videoUrl) {
        await deleteUploadedFile(existing.videoUrl);
      }
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

    const remainingCount = existing.images.filter((img) => !removeImageIds.includes(img.id)).length;

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
            order: remainingCount + i,
          })),
        });
      }
      return tx.project.update({
        where: { id: existing.id },
        data: { title, slug, description, category, coverImage, videoUrl, modelFile, modelFileName, published },
        include: { images: { orderBy: { order: "asc" } } },
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
    include: { images: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: existing.id } });

  await deleteUploadedFile(existing.coverImage);
  await deleteUploadedFile(existing.modelFile);
  if (existing.videoUrl?.startsWith("/uploads/")) {
    await deleteUploadedFile(existing.videoUrl);
  }
  for (const img of existing.images) {
    await deleteUploadedFile(img.url);
  }

  return NextResponse.json({ ok: true });
}
