"use client";

import { useParams } from "next/navigation";
import ResourceForm from "@/components/Resources/ResourceForm";

export default function EditResourcePage() {
  const params = useParams<{ id: string }>();

  if (!params.id) {
    return <p>Resource ID is missing.</p>;
  }

  return <ResourceForm mode="edit" resourceId={params.id} />;
}

