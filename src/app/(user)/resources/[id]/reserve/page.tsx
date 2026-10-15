
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/Reserve/Reserve.module.css";

type Resource = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
};

export default function ReservePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [resource, setResource] = useState<Resource | null>(null);
  const [reservedBy, setReservedBy] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const startTime = searchParams.get("startTime") || "";
  const endTime = searchParams.get("endTime") || "";

  useEffect(() => {
    async function fetchResource() {
      try {
        const response = await fetch(`/api/resources/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Resource not found.");
        }

        setResource(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resource."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchResource();
    }
  }, [params.id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!resource || !startTime || !endTime) {
      setError("Resource or reservation date/time is missing.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    if (!reservedBy.trim() || !purpose.trim()) {
      setError("Please enter your name and reservation purpose.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId: resource.id,
          reservedBy: reservedBy.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          purpose: purpose.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create reservation."
        );
      }

      setMessage(
        data.message || "Reservation created successfully."
      );

      setReservedBy("");
      setPurpose("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className={styles.container}>Loading resource...</main>;
  }

  if (!resource) {
    return (
      <main className={styles.container}>
        <p className={styles.error}>
          {error || "Resource not found."}
        </p>
        <button onClick={() => router.push("/resources")}>
          Back to Resources
        </button>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => router.push("/resources")}
      >
        ← Back to Resources
      </button>

      <header className={styles.header}>
        <span className={styles.eyebrow}>RESOURCE BOOKING</span>
        <h1>Reserve a Resource</h1>
        <p>Complete the form below to submit your reservation.</p>
      </header>

      <section className={styles.card}>
        <span className={styles.category}>{resource.category}</span>
        <h2>{resource.name}</h2>

        <p>{resource.description || "No description available."}</p>

        {resource.location && (
          <p>
            <strong>Location:</strong> {resource.location}
          </p>
        )}

        <div className={styles.timeSummary}>
          <div>
            <span>START DATE & TIME</span>
            <strong>{new Date(startTime).toLocaleString()}</strong>
          </div>

          <div>
            <span>END DATE & TIME</span>
            <strong>{new Date(endTime).toLocaleString()}</strong>
          </div>
        </div>
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {message && (
        <div className={styles.success} role="status">
          <p>{message}</p>
          <button
            type="button"
            onClick={() => router.push("/resources")}
          >
            Browse Other Resources
          </button>
        </div>
      )}

      {!message && (
        <section className={styles.formPanel}>
          <h2>Booking Details</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="reservedBy">Your Name</label>
            <input
              id="reservedBy"
              value={reservedBy}
              onChange={(event) => setReservedBy(event.target.value)}
              maxLength={100}
              placeholder="Enter your full name"
              required
            />

            <label htmlFor="purpose">Reservation Purpose</label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Why do you need this resource?"
              required
            />

            <button type="submit" disabled={submitting}>
              {submitting
                ? "Submitting..."
                : "Submit Reservation"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
