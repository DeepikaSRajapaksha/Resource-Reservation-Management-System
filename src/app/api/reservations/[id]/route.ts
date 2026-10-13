import { NextRequest, NextResponse } from "next/server";
import {prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getReservationId(context: RouteContext) {
  const { id } = await context.params;
  const reservationId = Number(id);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return null;
  }

  return reservationId;
}

// GET: Get one reservation
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getReservationId(context);

    if (id === null) {
      return NextResponse.json(
        { message: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Failed to fetch reservation:", error);

    return NextResponse.json(
      { message: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

// PUT: Update a reservation
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getReservationId(context);

    if (id === null) {
      return NextResponse.json(
        { message: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      resourceId,
      reservedBy,
      startTime,
      endTime,
      purpose,
      status,
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

    if (
      status !== undefined &&
      !["PENDING", "APPROVED", "REJECTED"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid reservation status" },
        { status: 400 }
      );
    }

    const existing = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
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

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        resourceId: resourceIdNumber,
        reservedBy: reservedBy.trim(),
        startTime: start,
        endTime: end,
        purpose: purpose.trim(),
        ...(status !== undefined ? { status } : {}),
      },
      include: { resource: true },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Failed to update reservation:", error);

    return NextResponse.json(
      { message: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a reservation
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getReservationId(context);

    if (id === null) {
      return NextResponse.json(
        { message: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete reservation:", error);

    return NextResponse.json(
      { message: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}
