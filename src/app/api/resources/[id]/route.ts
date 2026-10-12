
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params;
  const resourceId = Number(id);

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    return NextResponse.json(
      { message: "Invalid resource ID" },
      { status: 400 }
    );
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    return NextResponse.json(
      { message: "Resource not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(resource);
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;
  const resourceId = Number(id);

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    return NextResponse.json(
      { message: "Invalid resource ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    if (!name || !category) {
      return NextResponse.json(
        { message: "Name and category are required" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        name,
        category,
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : null,
        location:
          typeof body.location === "string"
            ? body.location.trim() || null
            : null,
        isActive:
          typeof body.isActive === "boolean"
            ? body.isActive
            : true,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params;
  const resourceId = Number(id);

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    return NextResponse.json(
      { message: "Invalid resource ID" },
      { status: 400 }
    );
  }

  try {
    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({
      message: "Resource deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
