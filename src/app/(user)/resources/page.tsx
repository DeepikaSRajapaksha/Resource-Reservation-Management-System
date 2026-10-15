
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/UserResources/UserResources.module.css";

type Resource = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
};

export default function UserResourcesPage() {
  const router = useRouter();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchResources() {
    setError("");
    setSearched(false);
    setResources([]);

    if (!startTime || !endTime) {
      setError("Please select a start date and end date.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);

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
        throw new Error(
          data.message || "Unable to search resources."
        );
      }

      setResources(
        data.map((resource: Resource) => ({
          ...resource,
          image: resource.image
            ? resource.image
            : null,
        }))
      );

      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function reserveResource(resource: Resource) {
    if (!startTime || !endTime) {
      setError("Please select a reservation date and time first.");
      return;
    }

    const query = new URLSearchParams({
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    });

    router.push(
      `/resources/${resource.id}/reserve?${query.toString()}`
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <span className={styles.eyebrow}>
              RESOURCE BOOKING
            </span>

            <h1>Available Resources</h1>

            <p>
              Find the right resource for your needs. Choose your
              preferred date and time to see what is available.
            </p>
          </div>

          <Link href="/" className={styles.backHomeLink}>
            <span aria-hidden="true">←</span>
            Back to Home
          </Link>
        </div>
      </header>

      <section className={styles.searchPanel}>
        <div className={styles.field}>
          <label htmlFor="startTime">
            Start Date &amp; Time
          </label>

          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="endTime">
            End Date &amp; Time
          </label>

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

      {searched && (
        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <span className={styles.eyebrow}>
                YOUR SEARCH
              </span>

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
                Try selecting another date or time to find
                available resources.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    {resource.image ? (
                      <img
                        src={resource.image}
                        alt={resource.name}
                        className={styles.resourceImage}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span aria-hidden="true">▦</span>
                        <p>No image available</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                      <span className={styles.category}>
                        {resource.category}
                      </span>
                    </div>

                    <h3>{resource.name}</h3>

                    <p className={styles.description}>
                      {resource.description ||
                        "No description available."}
                    </p>

                    <button
                      type="button"
                      className={styles.selectButton}
                      onClick={() => reserveResource(resource)}
                    >
                      Reserve This Resource
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className={styles.footer}>
        <p>
          Choose a resource, check availability, and book
          with confidence.
        </p>
      </footer>
    </main>
  );
}
