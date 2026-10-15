"use client";

import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

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

      closeMenu();
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
    <>
      {/* Mobile hamburger / close button */}
      <button
        type="button"
        className={styles.menuToggle}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="admin-sidebar"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay behind the mobile sidebar */}
      {isOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : ""
        }`}
      >
        <Link
          href="/admin/dashboard"
          className={styles.brand}
          onClick={closeMenu}
        >
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
                onClick={closeMenu}
                className={`${styles.navLink} ${
                  isActive ? styles.active : ""
                }`}
              >
                <span className={styles.icon} aria-hidden="true">
                  {item.icon}
                </span>

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
    </>
  );
}