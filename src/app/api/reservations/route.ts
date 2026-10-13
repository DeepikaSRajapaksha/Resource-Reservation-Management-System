import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        resource: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);

    return NextResponse.json(
      { message: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      resourceId,
      reservedBy,
      startTime,
      endTime,
      purpose,
    } = body;

    if (
      !resourceId ||
      !reservedBy?.trim() ||
      !startTime ||
      !endTime ||
      !purpose?.trim()
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const resourceIdNumber = Number(resourceId);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      !Number.isInteger(resourceIdNumber) ||
      resourceIdNumber <= 0 ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        { message: "Invalid resource ID or date/time" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceIdNumber },
    });

    if (!resource || !resource.isActive) {
      return NextResponse.json(
        { message: "Resource not found or inactive" },
        { status: 404 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        resourceId: resourceIdNumber,
        reservedBy: reservedBy.trim(),
        startTime: start,
        endTime: end,
        purpose: purpose.trim(),
      },
      include: {
        resource: true,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Failed to create reservation:", error);

    return NextResponse.json(
      { message: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
