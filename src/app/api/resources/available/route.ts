
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!startTime || !endTime) {
      return NextResponse.json(
        { message: "Start time and end time are required." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return NextResponse.json(
        { message: "Please provide a valid time range." },
        { status: 400 }
      );
    }

    const resources = await prisma.resource.findMany({
      where: {
        isActive: true,
        reservations: {
          none: {
            status: { not: "REJECTED" },
            startTime: { lt: end },
            endTime: { gt: start },
          },
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        image: true,
        imageType: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    // Return an image URL instead of sending binary image data.
    const availableResources = resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      category: resource.category,
      description: resource.description,
      image:
        resource.image && resource.imageType
          ? `/api/resources/${resource.id}/image`
          : null,
    }));

    return NextResponse.json(availableResources);
  } catch (error) {
    console.error("Availability check failed:", error);

    return NextResponse.json(
      { message: "Failed to check resource availability." },
      { status: 500 }
    );
  }
}
