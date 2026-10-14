
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/UserReservations/UserReservations.module.css";

type Reservation = {
  id: number;
  resourceId: number;
  reservedBy: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status?: string;
  resource?: {
    name: string;
    category?: string;
  };
};

export default function UserReservationsPage() {
  const [name, setName] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function searchReservations(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReservations([]);
    setSearched(false);

    if (!name.trim()) {
      setError("Please enter the name used for your reservation.");
      return;
    }

    setLoading(true);

    try {
      const query = new URLSearchParams({
        reservedBy: name.trim(),
      });

      const response = await fetch(`/api/reservations?${query.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reservations.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected reservation response from the server.");
      }

      setReservations(data);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.tag}>YOUR BOOKINGS</span>
        <h1>My Reservations</h1>
        <p>
          Enter the name you used when submitting your reservation request
          to view matching bookings.
        </p>
      </header>

      <form className={styles.searchPanel} onSubmit={searchReservations}>
        <label htmlFor="reservedBy">Your name</label>

        <div className={styles.searchRow}>
          <input
            id="reservedBy"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your reservation name"
            maxLength={100}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Find Reservations"}
          </button>
        </div>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {searched && reservations.length === 0 && (
        <section className={styles.empty}>
          <h2>No matching reservations found</h2>
          <p>Check the name and try again, or make a new reservation.</p>
          <Link href="/resources">Browse Resources</Link>
        </section>
      )}

      {reservations.length > 0 && (
        <section className={styles.results}>
          <h2>Reservation Results</h2>

          <div className={styles.list}>
            {reservations.map((reservation) => (
              <article className={styles.card} key={reservation.id}>
                <div className={styles.cardHeader}>
                  <h3>
                    {reservation.resource?.name ??
                      `Resource #${reservation.resourceId}`}
                  </h3>

                  <span className={styles.status}>
                    {reservation.status ?? "Submitted"}
                  </span>
                </div>

                <p>
                  <strong>Reference:</strong> {reservation.id}
                </p>
                <p>
                  <strong>Name:</strong> {reservation.reservedBy}
                </p>
                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(reservation.startTime).toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {new Date(reservation.endTime).toLocaleString()}
                </p>
                <p>
                  <strong>Purpose:</strong> {reservation.purpose}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <p className={styles.bottomLink}>
        Need a resource? <Link href="/resources">Check availability</Link>
      </p>
    </main>
  );
}
