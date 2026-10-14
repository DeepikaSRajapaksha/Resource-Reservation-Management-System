"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reservation?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete reservation.");
      }

      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete reservation."
      );
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
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

      {error && <p className={styles.error}>{error}</p>}

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
                        onClick={() => handleDelete(reservation.id)}
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
    </main>
  );
}