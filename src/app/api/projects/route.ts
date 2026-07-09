import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadError } from "@/lib/uploads";
import { uniqueSlug } from "@/lib/slug";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      images: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = (formData.get("title") as string | null)?.trim();
    const description = (formData.get("description") as string | null)?.trim();
    const category = (formData.get("category") as string | null)?.trim() || null;
    const published = formData.get("published") === "true";

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description sont requis" }, { status: 400 });
    }

    const coverFile = formData.get("coverImage") as File | null;
    if (!coverFile || coverFile.size === 0) {
      return NextResponse.json({ error: "Image de couverture requise" }, { status: 400 });
    }
    const coverImage = await saveUploadedFile(coverFile, "images", "image");

    const galleryFiles = formData.getAll("images") as File[];
    const galleryPaths: string[] = [];
    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        galleryPaths.push(await saveUploadedFile(file, "images", "image"));
      }
    }

    const videoUrlEntries = (formData.getAll("videoUrls") as string[])
      .map((url) => url.trim())
      .filter(Boolean);
    const videoFiles = formData.getAll("videoFiles") as File[];
    const videoPaths: string[] = [...videoUrlEntries];
    for (const file of videoFiles) {
      if (file && file.size > 0) {
        videoPaths.push(await saveUploadedFile(file, "videos", "video"));
      }
    }

    let modelFile: string | null = null;
    let modelFileName: string | null = null;
    const modelUpload = formData.get("modelFile") as File | null;
    if (modelUpload && modelUpload.size > 0) {
      modelFile = await saveUploadedFile(modelUpload, "models", "model");
      modelFileName = modelUpload.name;
    }

    const slug = await uniqueSlug(title);

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        category,
        coverImage,
        modelFile,
        modelFileName,
        published,
        images: { create: galleryPaths.map((url, order) => ({ url, order })) },
        videos: { create: videoPaths.map((url, order) => ({ url, order })) },
      },
      include: { images: true, videos: true },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur lors de la creation du projet" }, { status: 500 });
  }
}
