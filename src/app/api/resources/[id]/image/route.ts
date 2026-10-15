
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const resourceId = Number(id);

    if (
      !Number.isSafeInteger(resourceId) ||
      resourceId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        image: true,
        imageType: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    if (!resource.image || !resource.imageType) {
      return NextResponse.json(
        { message: "No image is available for this resource." },
        { status: 404 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(resource.imageType)) {
      return NextResponse.json(
        { message: "Unsupported image type." },
        { status: 415 }
      );
    }

    const imageBuffer = Buffer.from(resource.image);

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": resource.imageType,
        "Content-Length": String(imageBuffer.length),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET RESOURCE IMAGE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load resource image." },
      { status: 500 }
    );
  }
}
