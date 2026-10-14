"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Reservations/ReservationForm.module.css";

type Resource = {
  id: number;
  name: string;
  isActive: boolean;
};

type Reservation = {
  id: number;
  resourceId: number;
  reservedBy: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
};

type Props = {
  reservationId?: number;
};

export default function ReservationForm({ reservationId }: Props) {
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState({
    resourceId: "",
    reservedBy: "",
    startTime: "",
    endTime: "",
    purpose: "",
    status: "PENDING",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const resourcesResponse = await fetch("/api/resources");

        if (!resourcesResponse.ok) {
          throw new Error("Could not load resources.");
        }

        const resourcesData = await resourcesResponse.json();
        const activeResources = resourcesData.filter(
          (resource: Resource) => resource.isActive
        );

        setResources(activeResources);

        if (reservationId !== undefined) {
          const response = await fetch(
            `/api/reservations/${reservationId}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Could not load reservation.");
          }

          const toLocalDateTime = (value: string) => {
            const date = new Date(value);
            const offset = date.getTimezoneOffset();

            return new Date(date.getTime() - offset * 60_000)
              .toISOString()
              .slice(0, 16);
          };

          setForm({
            resourceId: String(data.resourceId),
            reservedBy: data.reservedBy,
            startTime: toLocalDateTime(data.startTime),
            endTime: toLocalDateTime(data.endTime),
            purpose: data.purpose,
            status: data.status,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [reservationId]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setSaving(true);

      const url =
        reservationId !== undefined
          ? `/api/reservations/${reservationId}`
          : "/api/reservations";

      const method = reservationId !== undefined ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          resourceId: Number(form.resourceId),
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save reservation.");
      }

      router.push("/admin/reservations");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className={styles.message}>Loading reservation form...</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label htmlFor="resourceId">Resource</label>
        <select
          id="resourceId"
          name="resourceId"
          value={form.resourceId}
          onChange={handleChange}
          required
        >
          <option value="">Select a resource</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>
        {resources.length === 0 && (
          <small>Create an active resource before making a reservation.</small>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="reservedBy">Reserved By</label>
        <input
          id="reservedBy"
          name="reservedBy"
          value={form.reservedBy}
          onChange={handleChange}
          placeholder="Enter person's name"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="startTime">Start Date & Time</label>
        <input
          id="startTime"
          name="startTime"
          type="datetime-local"
          value={form.startTime}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="endTime">End Date & Time</label>
        <input
          id="endTime"
          name="endTime"
          type="datetime-local"
          value={form.endTime}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="purpose">Purpose</label>
        <textarea
          id="purpose"
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          placeholder="Why is this resource needed?"
          rows={4}
          required
        />
      </div>

      {reservationId !== undefined && (
        <div className={styles.field}>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" disabled={saving || resources.length === 0}>
          {saving
            ? "Saving..."
            : reservationId !== undefined
              ? "Update Reservation"
              : "Create Reservation"}
        </button>

        <Link href="/admin/reservations">Cancel</Link>
      </div>
    </form>
  );
}