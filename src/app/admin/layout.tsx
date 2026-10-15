"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/AdminLayout/AdminLayout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Login page uses the full screen without the sidebar.
  if (pathname === "/admin/login") {
    return (
      <div className={styles.loginLayout}>
        {children}
      </div>
    );
  }

  // Other admin pages keep the sidebar.
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
