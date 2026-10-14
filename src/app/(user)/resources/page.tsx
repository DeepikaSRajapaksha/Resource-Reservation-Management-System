

"use client";

import { useState } from "react";
import styles from "@/styles/UserResources/UserResources.module.css";

type Resource = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
};

export default function UserResourcesPage() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] =
    useState<Resource | null>(null);
  const [reservedBy, setReservedBy] = useState("");
  const [purpose, setPurpose] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function searchResources() {
    setError("");
    setMessage("");
    setSelectedResource(null);

    if (!startTime || !endTime) {
      setError("Please select a start date and end date.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);
    setSearched(false);

    try {
      const query = new URLSearchParams({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      const response = await fetch(
        `/api/resources/available?${query.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to search resources.");
      }

      setResources(data);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createReservation(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedResource) {
      setError("Please select a resource.");
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
          resourceId: selectedResource.id,
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

      setMessage(
        `Reservation request submitted successfully. Reference: ${data.id}`
      );

      setSelectedResource(null);
      setReservedBy("");
      setPurpose("");

      await searchResources();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>RESOURCE BOOKING</span>
        <h1>Available Resources</h1>
        <p>
          Find the right resource for your needs. Choose your preferred
          date and time to see what is available.
        </p>
      </header>

      <section className={styles.searchPanel}>
        <div className={styles.field}>
          <label htmlFor="startTime">Start Date &amp; Time</label>
          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="endTime">End Date &amp; Time</label>
          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
          />
        </div>

        <button
          type="button"
          className={styles.searchButton}
          onClick={searchResources}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Availability"}
        </button>
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className={styles.success} role="status">
          {message}
        </p>
      )}

      {searched && (
        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <span className={styles.eyebrow}>YOUR SEARCH</span>
              <h2>
                {resources.length > 0
                  ? "Resources available"
                  : "No resources available"}
              </h2>
            </div>

            <span className={styles.count}>
              {resources.length} found
            </span>
          </div>

          {resources.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⌕</div>
              <h3>No availability for this time</h3>
              <p>
                Try selecting another date or time to find available
                resources.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {resources.map((resource) => (
                <article key={resource.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.resourceIcon}>▦</div>
                    <span className={styles.category}>
                      {resource.category}
                    </span>
                  </div>

                  <h3>{resource.name}</h3>

                  <p className={styles.description}>
                    {resource.description ||
                      "No description available."}
                  </p>

                  {resource.location && (
                    <p className={styles.location}>
                      <span>⌖</span> {resource.location}
                    </p>
                  )}

                  <button
                    type="button"
                    className={
                      selectedResource?.id === resource.id
                        ? styles.selectedButton
                        : styles.selectButton
                    }
                    onClick={() => {
                      setSelectedResource(resource);
                      setError("");
                      setMessage("");
                    }}
                  >
                    {selectedResource?.id === resource.id
                      ? "✓ Selected"
                      : "Reserve This Resource"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedResource && (
        <section className={styles.reservationPanel}>
          <div className={styles.formHeader}>
            <span className={styles.eyebrow}>BOOKING DETAILS</span>
            <h2>Request a Reservation</h2>
            <p>
              Complete the details below to submit your reservation
              request.
            </p>
          </div>

          <div className={styles.selectedSummary}>
            <div className={styles.resourceIcon}>▦</div>
            <div>
              <span>Selected resource</span>
              <strong>{selectedResource.name}</strong>
              <small>{selectedResource.category}</small>
            </div>
          </div>

          <div className={styles.timeSummary}>
            <div>
              <span>START</span>
              <strong>{new Date(startTime).toLocaleString()}</strong>
            </div>
            <div>
              <span>END</span>
              <strong>{new Date(endTime).toLocaleString()}</strong>
            </div>
          </div>

          <form onSubmit={createReservation}>
            <div className={styles.field}>
              <label htmlFor="reservedBy">Your Name</label>
              <input
                id="reservedBy"
                value={reservedBy}
                onChange={(event) => setReservedBy(event.target.value)}
                required
                maxLength={100}
                placeholder="Enter your full name"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="purpose">Reservation Purpose</label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                required
                maxLength={1000}
                rows={4}
                placeholder="Explain why you need this resource"
              />
            </div>

            <button
              type="submit"
              className={styles.searchButton}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Reservation Request"}
            </button>
          </form>
        </section>
      )}

      <footer className={styles.footer}>
        <p>Choose a resource, check availability, and book with confidence.</p>
      </footer>
    </main>
  );
}
