"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function NewResourcePage() {
  const router = useRouter();

  const [form, setForm] = useState<ResourceFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Could not create resource.");
      }

      router.push("/resources");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>Create Resource</h1>
      <p>Add a new resource to the system.</p>

      <section className={styles.card}>
        <h2>Resource Details</h2>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

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
              {saving ? "Saving..." : "Create Resource"}
            </button>

            <Link href="/resources" className={styles.cancelButton}>
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}