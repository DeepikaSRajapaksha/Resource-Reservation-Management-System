
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getResourceId(id: string): number | null {
  const resourceId = Number(id);

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    return null;
  }

  return resourceId;
}

function hasValidImageSignature(
  buffer: Buffer,
  mimeType: string
): boolean {
  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47,
          0x0d, 0x0a, 0x1a, 0x0a,
        ])
      )
    );
  }

  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

// GET: Retrieve one resource, including its image URL.
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const resourceId = getResourceId(id);

    if (resourceId === null) {
      return NextResponse.json(
        { message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    const { image, ...details } = resource;

    return NextResponse.json(
      {
        ...details,
        image: image
          ? `/api/resources/${resourceId}/image`
          : null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Fetch resource error:", error);

    return NextResponse.json(
      { message: "Failed to fetch resource." },
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
    const resourceId = getResourceId(id);

    if (resourceId === null) {
      return NextResponse.json(
        { message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    const existingResource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!existingResource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const nameValue = formData.get("name");
    const categoryValue = formData.get("category");
    const descriptionValue = formData.get("description");
    const isActiveValue = formData.get("isActive");
    const imageValue = formData.get("image");
    const removeImageValue = formData.get("removeImage");

    if (
      typeof nameValue !== "string" ||
      !nameValue.trim()
    ) {
      return NextResponse.json(
        { message: "Resource name is required." },
        { status: 400 }
      );
    }

    if (
      typeof categoryValue !== "string" ||
      !categoryValue.trim()
    ) {
      return NextResponse.json(
        { message: "Resource category is required." },
        { status: 400 }
      );
    }

    if (
      typeof descriptionValue !== "string" &&
      descriptionValue !== null
    ) {
      return NextResponse.json(
        { message: "Invalid resource description." },
        { status: 400 }
      );
    }

    if (
      typeof isActiveValue !== "string" ||
      !["true", "false"].includes(isActiveValue)
    ) {
      return NextResponse.json(
        { message: "Invalid resource status." },
        { status: 400 }
      );
    }

    let imageBytes: Uint8Array<ArrayBuffer> | null | undefined;
    let imageType: string | null | undefined;

    const removeImage = removeImageValue === "true";

    // Replace the current image when a new file is uploaded.
    if (imageValue instanceof File && imageValue.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageValue.type)) {
        return NextResponse.json(
          { message: "Only PNG, JPEG, and WebP images are allowed." },
          { status: 400 }
        );
      }

      if (imageValue.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { message: "Image size must not exceed 5 MB." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await imageValue.arrayBuffer());

      if (!hasValidImageSignature(buffer, imageValue.type)) {
        return NextResponse.json(
          { message: "The uploaded file is not a valid image." },
          { status: 400 }
        );
      }

      // Use a standard ArrayBuffer-backed Uint8Array for Prisma.
      imageBytes = new Uint8Array(
        new ArrayBuffer(buffer.length)
      );
      imageBytes.set(buffer);

      imageType = imageValue.type;
    } else if (removeImage) {
      imageBytes = null;
      imageType = null;
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        name: nameValue.trim(),
        category: categoryValue.trim(),
        description:
          typeof descriptionValue === "string"
            ? descriptionValue.trim() || null
            : null,
        isActive: isActiveValue === "true",
        ...(imageBytes !== undefined
          ? { image: imageBytes }
          : {}),
        ...(imageType !== undefined
          ? { imageType }
          : {}),
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });

    const { image, ...details } = resource;

    return NextResponse.json({
      ...details,
      image: image
        ? `/api/resources/${resourceId}/image`
        : null,
    });
  } catch (error) {
    console.error("Update resource error:", error);

    return NextResponse.json(
      { message: "Failed to update resource." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a resource.
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const resourceId = getResourceId(id);

    if (resourceId === null) {
      return NextResponse.json(
        { message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    const existingResource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!existingResource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Delete resource error:", error);

    return NextResponse.json(
      {
        message:
          "Failed to delete resource. It may have existing reservations.",
      },
      { status: 500 }
    );
  }
}
