
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/dashboard/UserDashboard.module.css";

type Reservation = {
  id: number;
  resourceId: number;
  reservedBy: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  resource?: {
    name: string;
  };
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Use one consistent locale and timezone for date/time displays.
const DATE_LOCALE = "en-US";
const APP_TIME_ZONE = "Asia/Colombo";

// A deterministic initial date prevents server/client hydration mismatches.
const INITIAL_DATE = new Date(2000, 0, 1);

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(DATE_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(DATE_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  });
}

// Avoid locale-dependent calendar date formatting.
function formatDay(date: Date) {
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][date.getDay()];

  return `${weekday}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatMonth(date: Date) {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function overlapsDay(reservation: Reservation, date: Date) {
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();

  const nextDayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  ).getTime();

  return (
    new Date(reservation.startTime).getTime() < nextDayStart &&
    new Date(reservation.endTime).getTime() > dayStart
  );
}

export default function Userpage() {
  // Start with deterministic dates for server rendering and hydration.
  const [today, setToday] = useState(INITIAL_DATE);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(2000, 0, 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date(2000, 0, 1)
  );

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Set the real date only after the component mounts in the browser.
  useEffect(() => {
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    setToday(startOfDay);
    setCurrentMonth(startOfMonth);
    setSelectedDate(startOfDay);
  }, []);

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/reservations");

        if (!response.ok) {
          throw new Error("Unable to load reservations.");
        }

        const data = await response.json();

        const items: Reservation[] = Array.isArray(data)
          ? data
          : data.reservations ?? [];

        setReservations(items);
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

    loadReservations();
  }, []);

  const pendingCount = reservations.filter(
    (item) => item.status.toUpperCase() === "PENDING"
  ).length;

  const approvedCount = reservations.filter(
    (item) => item.status.toUpperCase() === "APPROVED"
  ).length;

  const recentReservations = [...reservations]
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() -
        new Date(a.startTime).getTime()
    )
    .slice(0, 5);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-first calendar: Monday = 0, Sunday = 6.
    const firstDayOffset =
      (new Date(year, month, 1).getDay() + 6) % 7;

    return [
      ...Array(firstDayOffset).fill(null),
      ...Array.from(
        { length: daysInMonth },
        (_, index) => index + 1
      ),
    ];
  }, [currentMonth]);

  const selectedReservations = reservations
    .filter((reservation) => overlapsDay(reservation, selectedDate))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    );

  const upcomingReservations = reservations
    .filter(
      (reservation) =>
        new Date(reservation.endTime).getTime() > Date.now() &&
        reservation.status.toUpperCase() !== "REJECTED"
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    )
    .slice(0, 4);

  function changeMonth(amount: number) {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + amount,
        1
      )
    );
  }

  function goToToday() {
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    setToday(startOfDay);
    setCurrentMonth(startOfMonth);
    setSelectedDate(startOfDay);
  }

  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>USER PORTAL</span>
          <h1>Welcome to ResourceHub</h1>
          <p>
            Manage your reservations and find the resources you need.
          </p>
        </div>

        <Link href="/admin/resources" className={styles.primaryButton}>
          + Book a Resource
        </Link>
      </header>

      {/* Dashboard statistics */}
      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>▦</div>
          <p>Total Reservations</p>
          <h2>{loading ? "—" : reservations.length}</h2>
          <span>All your bookings</span>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>◷</div>
          <p>Pending Requests</p>
          <h2>{loading ? "—" : pendingCount}</h2>
          <span>Awaiting approval</span>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>✓</div>
          <p>Approved Reservations</p>
          <h2>{loading ? "—" : approvedCount}</h2>
          <span>Confirmed requests</span>
        </article>
      </section>

      {/* Calendar and upcoming reservations */}
      <section className={styles.calendarSection}>
        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div>
              <h2>Reservation Calendar</h2>
              <p>Choose a date to view your bookings.</p>
            </div>

            <button
              type="button"
              className={styles.todayButton}
              onClick={goToToday}
            >
              Today
            </button>
          </div>

          <div className={styles.monthNavigation}>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className={styles.monthArrow}
            >
              ‹
            </button>

            <h3>{formatMonth(currentMonth)}</h3>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className={styles.monthArrow}
            >
              ›
            </button>
          </div>

          <div className={styles.calendarGrid}>
            {weekdays.map((day) => (
              <div key={day} className={styles.weekday}>
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className={styles.emptyDay}
                  />
                );
              }

              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );

              const isToday = dateKey(date) === dateKey(today);
              const isSelected =
                dateKey(date) === dateKey(selectedDate);

              const hasReservation = reservations.some(
                (reservation) => overlapsDay(reservation, date)
              );

              return (
                <button
                  key={dateKey(date)}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${formatDay(date)}${
                    hasReservation ? ", has reservations" : ""
                  }`}
                  onClick={() => setSelectedDate(date)}
                  className={[
                    styles.calendarDay,
                    isToday ? styles.today : "",
                    isSelected ? styles.selectedDay : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span>{day}</span>

                  {hasReservation && (
                    <span className={styles.bookingDot} />
                  )}
                </button>
              );
            })}
          </div>

          <div className={styles.calendarLegend}>
            <span className={styles.legendItem}>
              <span className={styles.todayLegend} />
              Today
            </span>

            <span className={styles.legendItem}>
              <span className={styles.dotLegend} />
              Reservation
            </span>
          </div>

          <div className={styles.selectedDatePanel}>
            <h3>{formatDay(selectedDate)}</h3>

            {loading ? (
              <p className={styles.calendarMessage}>
                Loading reservations...
              </p>
            ) : error ? (
              <p className={styles.calendarError}>{error}</p>
            ) : selectedReservations.length === 0 ? (
              <p className={styles.calendarMessage}>
                No reservations for this date.
              </p>
            ) : (
              <div className={styles.dayBookingList}>
                {selectedReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={styles.dayBooking}
                  >
                    <span className={styles.bookingTime}>
                      {formatTime(reservation.startTime)}
                    </span>

                    <div className={styles.bookingDetails}>
                      <strong>
                        {reservation.resource?.name ??
                          `Resource #${reservation.resourceId}`}
                      </strong>

                      <span>{reservation.purpose}</span>
                    </div>

                    <span
                      className={`${styles.status} ${
                        styles[reservation.status.toLowerCase()] ?? ""
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className={styles.upcomingCard}>
          <div className={styles.upcomingHeader}>
            <div>
              <h2>Upcoming Reservations</h2>
              <p>Your next scheduled bookings.</p>
            </div>

            <span className={styles.upcomingCount}>
              {loading ? "—" : upcomingReservations.length}
            </span>
          </div>

          {loading ? (
            <p className={styles.calendarMessage}>Loading...</p>
          ) : upcomingReservations.length === 0 ? (
            <div className={styles.upcomingEmpty}>
              <div className={styles.emptyIcon}>▦</div>
              <p>No upcoming reservations.</p>
              <Link href="/resources" className={styles.textLink}>
                Find a resource →
              </Link>
            </div>
          ) : (
            <div className={styles.upcomingList}>
              {upcomingReservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className={styles.upcomingItem}
                >
                  <div className={styles.dateBadge}>
                    <strong>
                      {new Date(reservation.startTime)
                        .toLocaleDateString(DATE_LOCALE, {
                          day: "2-digit",
                          timeZone: APP_TIME_ZONE,
                        })}
                    </strong>

                    <span>
                      {new Date(reservation.startTime)
                        .toLocaleDateString(DATE_LOCALE, {
                          month: "short",
                          timeZone: APP_TIME_ZONE,
                        })}
                    </span>
                  </div>

                  <div className={styles.upcomingInfo}>
                    <h3>
                      {reservation.resource?.name ??
                        `Resource #${reservation.resourceId}`}
                    </h3>

                    <p>{formatTime(reservation.startTime)}</p>

                    <span
                      className={`${styles.status} ${
                        styles[reservation.status.toLowerCase()] ?? ""
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <Link
            href="/my-reservations"
            className={styles.viewAllButton}
          >
            View All Reservations →
          </Link>
        </aside>
      </section>

      {/* Recent reservations */}
      <section className={styles.contentCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Recent Reservations</h2>
            <p>Review your latest booking requests.</p>
          </div>

          <Link href="/my-reservations" className={styles.textLink}>
            View all →
          </Link>
        </div>

        {loading ? (
          <p className={styles.message}>Loading reservations...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : recentReservations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>▦</div>
            <h3>No reservations yet</h3>
            <p>
              Browse available resources and make your first booking.
            </p>
            <Link href="/resources" className={styles.primaryButton}>
              Browse Resources
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>
                      {reservation.resource?.name ??
                        `Resource #${reservation.resourceId}`}
                    </td>
                    <td>{formatDate(reservation.startTime)}</td>
                    <td>{formatDate(reservation.endTime)}</td>
                    <td>{reservation.purpose}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[reservation.status.toLowerCase()] ?? ""
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className={styles.quickActions}>
        <h2>Quick Actions</h2>

        <div className={styles.actionGrid}>
          <Link href="/admin/resources" className={styles.actionCard}>
            <span className={styles.actionIcon}>▦</span>
            <div>
              <h3>Browse Resources</h3>
              <p>Check availability and reserve a resource.</p>
            </div>
            <span className={styles.arrow}>→</span>
          </Link>

          <Link
            href="/admin/reservations"
            className={styles.actionCard}
          >
            <span className={styles.actionIcon}>▤</span>
            <div>
              <h3>My Reservations</h3>
              <p>View your booking requests and their status.</p>
            </div>
            <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
