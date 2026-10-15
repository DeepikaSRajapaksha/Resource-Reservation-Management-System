"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/components/common/ToastProvider";
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
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
          result.message || result.error || "Unable to log out."
        );
      }

      setShowLogoutModal(false);
      closeMenu();

      showToast("success", "Logged out successfully!");

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to log out.";

      showToast("error", message);
    } finally {
      setLoggingOut(false);
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
          onClick={() => setShowLogoutModal(true)}
          className={styles.logoutButton}
          disabled={loggingOut}
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

      {/* Reusable logout confirmation modal */}
      {showLogoutModal && (
        <ConfirmModal
          title="Confirm Logout"
          message="Are you sure you want to log out of the ResourceHub Admin Panel?"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
          loading={loggingOut}
        />
      )}
    </>
  );
}