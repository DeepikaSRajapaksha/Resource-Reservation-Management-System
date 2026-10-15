
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Resources/Resources.module.css";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/components/common/ToastProvider";

type Resource = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [brokenImages, setBrokenImages] = useState<number[]>([]);

  const { showToast } = useToast();

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resources", {
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Could not load resources."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid resource data received from the server.");
      }

      setResources(data as Resource[]);
      setBrokenImages([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load resources.";

      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  async function handleDelete() {
    if (deleteId === null || deleting) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/resources/${deleteId}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to delete resource."
        );
      }

      setResources((current) =>
        current.filter((resource) => resource.id !== deleteId)
      );

      setBrokenImages((current) =>
        current.filter((id) => id !== deleteId)
      );

      setDeleteId(null);
      showToast("success", "Resource deleted successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete resource.";

      setError(message);
      showToast("error", message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Resource Management</h1>
          <p>View and manage all registered resources.</p>
        </div>

        <Link
          href="/admin/resources/new"
          className={styles.createButton}
        >
          + Create Resource
        </Link>
      </header>

      <section className={styles.card}>
        <div className={styles.listHeader}>
          <div>
            <h2>All Resources</h2>
            <p>Manage resource details, images, and availability.</p>
          </div>

          <span className={styles.totalCount}>
            Total: <strong>{resources.length}</strong>
          </span>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
            <button
              type="button"
              onClick={() => void loadResources()}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <p>Loading resources...</p>
          </div>
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
                  <th>Image</th>
                  <th>Resource Details</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id}>
                    <td className={styles.resourceId}>
                      #{resource.id}
                    </td>

                    <td>
                      {resource.image &&
                      !brokenImages.includes(resource.id) ? (
                        <img
                          src={resource.image}
                          alt={`${resource.name} resource`}
                          width={80}
                          height={60}
                          loading="lazy"
                          className={styles.resourceImage}
                          onError={() => {
                            setBrokenImages((current) =>
                              current.includes(resource.id)
                                ? current
                                : [...current, resource.id]
                            );
                          }}
                        />
                      ) : (
                        <div className={styles.noImage}>
                          No image
                        </div>
                      )}
                    </td>

                    <td className={styles.resourceDetails}>
                      <strong>{resource.name}</strong>

                      {resource.description && (
                        <p className={styles.description}>
                          {resource.description}
                        </p>
                      )}
                    </td>

                    <td>
                      <span className={styles.categoryBadge}>
                        {resource.category}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          resource.isActive
                            ? styles.active
                            : styles.inactive
                        }
                      >
                        <span className={styles.statusDot} />
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
                          onClick={() => setDeleteId(resource.id)}
                          disabled={deleting}
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

      {deleteId !== null && (
        <ConfirmModal
          title="Delete Resource?"
          message="Are you sure you want to delete this resource? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => {
            if (!deleting) setDeleteId(null);
          }}
          loading={deleting}
        />
      )}
    </main>
  );
}
