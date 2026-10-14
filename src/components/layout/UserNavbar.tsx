import Link from "next/link";
import styles from "@/styles/UserNavbar/UserNavbar.module.css";

export default function UserNavbar() {
  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="25"
            height="25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4" />
          </svg>
        </span>

        <span className={styles.brandText}>
          <strong>ResourceHub</strong>
          <small>Resource Reservation System</small>
        </span>
      </Link>

      <nav className={styles.navLinks} aria-label="Main navigation">
        <Link href="/" className={styles.navLink}>
          Home
        </Link>

        <Link href="/resources" className={styles.navLink}>
          Resources
        </Link>

        <Link href="/reservations" className={styles.navLink}>
          My Reservations
        </Link>
      </nav>

      <Link href="/admin/login" className={styles.adminButton}>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Admin Login
      </Link>
    </header>
  );
}
