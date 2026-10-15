
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

// Validate the actual image file signature.
function hasValidImageSignature(
  buffer: Buffer,
  mimeType: string
): boolean {
  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(
          Buffer.from([
            137, 80, 78, 71, 13, 10, 26, 10,
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

// GET: Fetch all resources without returning binary image data.
export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = resources.map(
      ({ image, ...resourceDetails }) => ({
        ...resourceDetails,
        image: image
          ? `/api/resources/${resourceDetails.id}/image`
          : null,
      })
    );

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Fetch resources error:", error);

    return NextResponse.json(
      { message: "Failed to fetch resources." },
      { status: 500 }
    );
  }
}

// POST: Create a resource and store uploaded image bytes.
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const nameValue = formData.get("name");
    const categoryValue = formData.get("category");
    const descriptionValue = formData.get("description");
    const isActiveValue = formData.get("isActive");
    const imageValue = formData.get("image");

    const name =
      typeof nameValue === "string"
        ? nameValue.trim()
        : "";

    const category =
      typeof categoryValue === "string"
        ? categoryValue.trim()
        : "";

    if (!name || !category) {
      return NextResponse.json(
        {
          message: "Name and category are required.",
        },
        { status: 400 }
      );
    }

    if (
      descriptionValue !== null &&
      typeof descriptionValue !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid description." },
        { status: 400 }
      );
    }

    if (
      isActiveValue !== null &&
      isActiveValue !== "true" &&
      isActiveValue !== "false"
    ) {
      return NextResponse.json(
        { message: "Invalid resource status." },
        { status: 400 }
      );
    }

    let imageData: Uint8Array<ArrayBuffer> | null = null;
    let imageType: string | null = null;

    if (imageValue !== null) {
      if (!(imageValue instanceof File)) {
        return NextResponse.json(
          {
            message: "The image must be an uploaded file.",
          },
          { status: 400 }
        );
      }

      // An empty file input means no image was selected.
      if (imageValue.size > 0) {
        if (
          !ALLOWED_IMAGE_TYPES.includes(imageValue.type)
        ) {
          return NextResponse.json(
            {
              message:
                "Only PNG, JPG, JPEG, and WebP images are allowed.",
            },
            { status: 400 }
          );
        }

        if (imageValue.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            {
              message: "Image size must not exceed 5 MB.",
            },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(
          await imageValue.arrayBuffer()
        );

        if (
          !hasValidImageSignature(buffer, imageValue.type)
        ) {
          return NextResponse.json(
            {
              message:
                "The uploaded file is not a valid supported image.",
            },
            { status: 400 }
          );
        }

        imageData = new Uint8Array(buffer);
        imageType = imageValue.type;
      }
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        category,
        description:
          typeof descriptionValue === "string" 
            ? descriptionValue.trim() || null
            : null,
        image: imageData,
        imageType,
        isActive: isActiveValue !== "false",
      },
    });

    // Return an image endpoint URL, never the binary bytes.
    const { image, ...resourceDetails } = resource;

    return NextResponse.json(
      {
        ...resourceDetails,
        image: image
          ? `/api/resources/${resource.id}/image`
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create resource error:", error);

    return NextResponse.json(
      {
        message: "Failed to create resource.",
      },
      { status: 500 }
    );
  }
}
