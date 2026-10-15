
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/common/ToastProvider";
import styles from "@/styles/Resources/ResourcesCreate.module.css";

type ResourceFormValues = {
  name: string;
  category: string;
  description: string;
  location: string;
  isActive: boolean;
};

const emptyForm: ResourceFormValues = {
  name: "",
  category: "",
  description: "",
  location: "",
  isActive: true,
};

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const resourceId = params.id;
  const { showToast } = useToast();

  const [form, setForm] = useState<ResourceFormValues>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResource() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/resources/${resourceId}`);
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message || result.error || "Could not find this resource."
          );
        }

        if (!cancelled) {
          setForm({
            name: result.name,
            category: result.category,
            description: result.description ?? "",
            location: result.location ?? "",
            isActive: result.isActive,
          });
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load resource.";

          setError(message);
          showToast("error", message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResource();

    return () => {
      cancelled = true;
    };
  }, [resourceId, showToast]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not update resource."
        );
      }

      showToast("success", "Resource updated successfully!");

      // Show the success toast before navigating away.
      window.setTimeout(() => {
        router.push("/admin/resources");
        router.refresh();
      }, 1800);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading resource details...</p>;
  }

  return (
    <main>
      <h1>Edit Resource</h1>
      <p>Update the selected resource details.</p>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!error && (
        <section className={styles.card}>
          <h2>Resource Details</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <label>
                Resource Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Meeting Room A"
                  required
                />
              </label>

              <label>
                Category *
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Software">Software</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Colombo"
                />
              </label>

              <label>
                Status
                <select
                  name="isActive"
                  value={String(form.isActive)}
                  onChange={handleChange}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>

              <label className={styles.fullWidth}>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter resource details"
                  rows={4}
                />
              </label>
            </div>

            <div className={styles.actions}>
              <button type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Resource"}
              </button>

              <Link
                href="/admin/resources"
                className={styles.cancelButton}
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
