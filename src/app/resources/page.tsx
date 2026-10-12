
"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "@/styles/Resources.module.css";

type Resource = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
  isActive: boolean;
};

type ResourceForm = {
  name: string;
  category: string;
  description: string;
  location: string;
  isActive: boolean;
};

const emptyForm: ResourceForm = {
  name: "",
  category: "",
  description: "",
  location: "",
  isActive: true,
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resources");

      if (!response.ok) {
        throw new Error("Could not load resources");
      }

      const data: Resource[] = await response.json();
      setResources(data);
    } catch {
      setError("Failed to load resources. Check your server and database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    if (name === "isActive") {
      setForm((current) => ({
        ...current,
        isActive: value === "true",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        editingId
          ? `/api/resources/${editingId}`
          : "/api/resources",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadResources();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(resource: Resource) {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      category: resource.category,
      description: resource.description ?? "",
      location: resource.location ?? "",
      isActive: resource.isActive,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadResources();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete resource"
      );
    }
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Resource Management</h1>
          <p>Create, view, update, and manage your resources.</p>
        </div>

        <div className={styles.total}>
          Total resources: <strong>{resources.length}</strong>
        </div>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.card}>
        <h2>{editingId ? "Edit Resource" : "Add New Resource"}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label>
              Resource Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Laptop"
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
                rows={3}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Resource"
                  : "Add Resource"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <h2>Resource List</h2>

        {loading ? (
          <p>Loading resources...</p>
        ) : resources.length === 0 ? (
          <p>No resources found. Add your first resource above.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.id}</td>
                    <td>
                      <strong>{resource.name}</strong>
                      {resource.description && (
                        <p className={styles.description}>
                          {resource.description}
                        </p>
                      )}
                    </td>
                    <td>{resource.category}</td>
                    <td>{resource.location || "—"}</td>
                    <td>
                      <span
                        className={
                          resource.isActive
                            ? styles.active
                            : styles.inactive
                        }
                      >
                        {resource.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => handleEdit(resource)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => handleDelete(resource.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
