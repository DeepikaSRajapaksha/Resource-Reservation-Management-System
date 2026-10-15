import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

function isValidImageSignature(
  bytes: Uint8Array,
  type: string
): boolean {
  if (type === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (type === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (type === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

function imageUrl(id: number, hasImage: boolean) {
  return hasImage ? `/api/resources/${id}/image` : null;
}

// GET: Load one resource for the edit form.
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const resourceId = Number(id);

    if (!Number.isInteger(resourceId) || resourceId <= 0) {
      return NextResponse.json(
        { message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    // Do not send the raw image binary to the frontend.
    const { image, imageType, ...details } = resource;

    return NextResponse.json({
      ...details,
      image: imageUrl(resource.id, Boolean(image && imageType)),
    });
  } catch (error) {
    console.error("GET RESOURCE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load resource." },
      { status: 500 }
    );
  }
}

// PUT: Update resource details and optionally replace/remove its image.
export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const resourceId = Number(id);

    if (!Number.isInteger(resourceId) || resourceId <= 0) {
      return NextResponse.json(
        { message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const nameValue = formData.get("name");
    const categoryValue = formData.get("category");
    const descriptionValue = formData.get("description");
    const isActiveValue = formData.get("isActive");
    const removeImageValue = formData.get("removeImage");
    const uploadedImage = formData.get("image");

    const name =
      typeof nameValue === "string" ? nameValue.trim() : "";

    const category =
      typeof categoryValue === "string"
        ? categoryValue.trim()
        : "";

    if (!name || !category) {
      return NextResponse.json(
        { message: "Name and category are required." },
        { status: 400 }
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        { message: "Resource name must not exceed 150 characters." },
        { status: 400 }
      );
    }

    let isActive = true;

    if (isActiveValue === "true" || isActiveValue === "false") {
      isActive = isActiveValue === "true";
    } else {
      return NextResponse.json(
        { message: "Invalid resource status." },
        { status: 400 }
      );
    }

    const description =
      typeof descriptionValue === "string"
        ? descriptionValue.trim() || null
        : null;

    const data: Prisma.ResourceUpdateInput = {
      name,
      category,
      description,
      isActive,
    };

    if (removeImageValue === "true") {
      data.image = null;
      data.imageType = null;
    }

    if (uploadedImage instanceof File && uploadedImage.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(uploadedImage.type)) {
        return NextResponse.json(
          { message: "Choose a PNG, JPG, JPEG, or WebP image." },
          { status: 400 }
        );
      }

      if (uploadedImage.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { message: "Image size must not exceed 5 MB." },
          { status: 400 }
        );
      }

      const buffer = new Uint8Array(
        await uploadedImage.arrayBuffer()
      );

      if (!isValidImageSignature(buffer, uploadedImage.type)) {
        return NextResponse.json(
          { message: "The uploaded file is not a valid image." },
          { status: 400 }
        );
      }

      // Use an ArrayBuffer-backed Uint8Array for Prisma Bytes.
      const imageBytes: Uint8Array<ArrayBuffer> =
        new Uint8Array(new ArrayBuffer(buffer.length));

      imageBytes.set(buffer);

      data.image = imageBytes;
      data.imageType = uploadedImage.type;
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data,
    });

    const { image, imageType, ...details } = resource;

    return NextResponse.json({
      ...details,
      image: imageUrl(resource.id, Boolean(image && imageType)),
    });
  } catch (error) {
    console.error("UPDATE RESOURCE ERROR:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update resource." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a resource.
export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const resourceId = Number(id);

    if (!Number.isInteger(resourceId) || resourceId <= 0) {
      return NextResponse.json(
        { message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE RESOURCE ERROR:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete resource. It may have related reservations." },
      { status: 500 }
    );
  }
}
