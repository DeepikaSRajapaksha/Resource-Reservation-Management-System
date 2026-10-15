
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/common/ToastProvider";
import styles from "@/styles/AdminLayout/AdminLayout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return (
      <div className={styles.loginLayout}>
        {children}
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className={styles.adminLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
