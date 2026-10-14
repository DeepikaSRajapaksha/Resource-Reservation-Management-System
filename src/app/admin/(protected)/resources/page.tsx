
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Resources/Resources.module.css";

type Resource = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
  isActive: boolean;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resources");

      if (!response.ok) {
        throw new Error("Could not load resources.");
      }

      const data: Resource[] = await response.json();
      setResources(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load resources."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

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

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Failed to delete resource.");
      }

      await loadResources();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete resource."
      );
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Resource Management</h1>
          <p>View and manage all registered resources.</p>
        </div>

        <Link href="/admin/resources/new" className={styles.createButton}>
          + Create Resource
        </Link>
      </header>

      <section className={styles.card}>
        <div className={styles.listHeader}>
          <h2>All Resources</h2>
          <span>
            Total: <strong>{resources.length}</strong>
          </span>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading resources...</p>
        ) : resources.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No resources found</h3>
            <p>Create your first resource to get started.</p>
            <Link
              href="/admin/resources/new"
              className={styles.createButton}
            >
              Create Your First Resource
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resource</th>
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
                        <Link
                          href={`/admin/resources/${resource.id}/edit`}
                          className={styles.editButton}
                        >
                          Edit
                        </Link>

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

