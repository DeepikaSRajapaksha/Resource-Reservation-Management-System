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
      orderBy: { id: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Availability check failed:", error);

    return NextResponse.json(
      { message: "Failed to check resource availability." },
      { status: 500 }
    );
  }
}