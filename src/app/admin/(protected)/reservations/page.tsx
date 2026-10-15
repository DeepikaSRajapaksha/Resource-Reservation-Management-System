"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/components/common/ToastProvider";
import styles from "@/styles/Reservations/Reservations.module.css";

type Reservation = {
  id: number;
  resourceId: number;
  reservedBy: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  resource: {
    id: number;
    name: string;
  };
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const loadReservations = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/reservations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reservations.");
      }

      setReservations(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  async function handleDelete() {
    if (deleteId === null) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/reservations/${deleteId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to delete reservation."
        );
      }

      setDeleteId(null);
      showToast("success", "Reservation deleted successfully!");

      await loadReservations();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete reservation.";

      setError(message);
      showToast("error", message);
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString("en-GB", {
      timeZone: "Asia/Colombo",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <main className={styles.container}>Loading reservations...</main>;
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Reservation Management</h1>
          <p>View and manage resource reservations.</p>
        </div>

        <Link href="/admin/reservations/new" className={styles.addButton}>
          + New Reservation
        </Link>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {reservations.length === 0 ? (
        <div className={styles.empty}>
          <h2>No reservations found</h2>
          <p>Create your first reservation to get started.</p>
          <Link href="/admin/reservations/new" className={styles.addButton}>
            Create Reservation
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Reserved By</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.resource?.name ?? "Unknown resource"}</td>
                  <td>{reservation.reservedBy}</td>
                  <td>{formatDate(reservation.startTime)}</td>
                  <td>{formatDate(reservation.endTime)}</td>
                  <td>{reservation.purpose}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[reservation.status.toLowerCase()] ??
                        styles.pending
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/reservations/${reservation.id}/edit`}
                        className={styles.editButton}
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => setDeleteId(reservation.id)}
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

      {deleteId !== null && (
        <ConfirmModal
          title="Delete Reservation?"
          message="Are you sure you want to delete this reservation? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </main>
  );
}