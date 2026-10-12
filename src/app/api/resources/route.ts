
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const resource = await prisma.resource.create({
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

    return NextResponse.json(resource, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create resource" },
      { status: 500 }
    );
  }
}
