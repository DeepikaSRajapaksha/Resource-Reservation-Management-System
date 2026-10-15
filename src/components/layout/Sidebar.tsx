
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../../styles/Sidebar.module.css";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "▦",
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: "▣",
  },
  {
    label: "Reservations",
    href: "/admin/reservations",
    icon: "▤",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const message = await response.text();

        console.error("Logout API response:", message);

        throw new Error(
          `Logout failed. HTTP status: ${response.status}`
        );
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to log out."
      );
    }
  }

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin/dashboard" className={styles.brand}>
        <span className={styles.logo}>R</span>

        <span>
          <strong>ResourceHub</strong>
          <small>Management System</small>
        </span>
      </Link>

      <div className={styles.menuTitle}>MAIN MENU</div>

      <nav className={styles.navigation}>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                isActive ? styles.active : ""
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className={styles.logoutButton}
      >
        <span aria-hidden="true">↪</span>
        Logout
      </button>

      <div className={styles.sidebarBottom}>
        <div className={styles.adminAvatar}>A</div>

        <div className={styles.adminInfo}>
          <strong>Administrator</strong>
          <small>Admin Panel</small>
        </div>
      </div>
    </aside>
  );
}
