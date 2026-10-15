"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/Reserve/Reserve.module.css";

type Resource = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
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
  const [imageFailed, setImageFailed] = useState(false);

  const startTime = searchParams.get("startTime") || "";
  const endTime = searchParams.get("endTime") || "";

  useEffect(() => {
    async function fetchResource() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/resources/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Resource not found.");
        }

        // Support either a URL string or an object containing a URL.
        const imageUrl =
          typeof data.image === "string"
            ? data.image
            : data.image?.url ?? null;

        setResource({
          id: data.id,
          name: data.name,
          category: data.category,
          description: data.description ?? null,
          image: imageUrl,
        });

        setImageFailed(false);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!resource || !startTime || !endTime) {
      setError("Resource or reservation date/time is missing.");
      return;
    }

    if (
      Number.isNaN(new Date(startTime).getTime()) ||
      Number.isNaN(new Date(endTime).getTime()) ||
      new Date(endTime) <= new Date(startTime)
    ) {
      setError("Please select a valid reservation date and time.");
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
        throw new Error(data.message || "Failed to create reservation.");
      }

      setMessage(data.message || "Reservation created successfully.");
      setReservedBy("");
      setPurpose("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingCard}>Loading resource...</div>
      </main>
    );
  }

  if (!resource) {
    return (
      <main className={styles.container}>
        <p className={styles.error}>{error || "Resource not found."}</p>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/resources")}
        >
          ← Back to Resources
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
        <span aria-hidden="true">←</span> Back to Resources
      </button>

      <header className={styles.header}>
        <span className={styles.eyebrow}>RESOURCE BOOKING</span>
        <h1>Reserve a Resource</h1>
        <p>
          Review your selected resource and complete the form to submit
          your reservation.
        </p>
      </header>

      <section className={styles.card}>
        <div className={styles.resourceImageWrapper}>
          {resource.image && !imageFailed ? (
            <img
              src={resource.image}
              alt={resource.name}
              className={styles.resourceImage}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">
                ▧
              </span>
              <span>Resource image unavailable</span>
            </div>
          )}
        </div>

        <div className={styles.resourceDetails}>
          <span className={styles.category}>{resource.category}</span>
          <h2>{resource.name}</h2>
          <p className={styles.description}>
            {resource.description || "No description available."}
          </p>
        </div>

        <div className={styles.timeHeading}>
          <span className={styles.timeHeadingIcon} aria-hidden="true">
            ◷
          </span>
          <h3>Reservation Schedule</h3>
        </div>

        <div className={styles.timeSummary}>
          <div className={styles.timeItem}>
            <span>START DATE &amp; TIME</span>
            <strong>
              {startTime
                ? new Date(startTime).toLocaleString()
                : "Not selected"}
            </strong>
          </div>

          <div className={styles.timeItem}>
            <span>END DATE &amp; TIME</span>
            <strong>
              {endTime
                ? new Date(endTime).toLocaleString()
                : "Not selected"}
            </strong>
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
          <div className={styles.successIcon} aria-hidden="true">
            ✓
          </div>
          <h3>Reservation Submitted</h3>
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
          <div className={styles.formHeader}>
            <span className={styles.formIcon} aria-hidden="true">
              ✎
            </span>
            <div>
              <h2>Booking Details</h2>
              <p>Please provide your details below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="reservedBy">Your Name</label>
            <input
              id="reservedBy"
              value={reservedBy}
              onChange={(event) => setReservedBy(event.target.value)}
              maxLength={100}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

            <label htmlFor="purpose">Reservation Purpose</label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Explain why you need this resource..."
              required
            />

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Reservation"}
              {!submitting && <span aria-hidden="true"> →</span>}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}