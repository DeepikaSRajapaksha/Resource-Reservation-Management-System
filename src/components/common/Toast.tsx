
"use client";

import styles from "@/styles/Toast.module.css";

export type ToastType = "success" | "error";

type ToastProps = {
  type: ToastType;
  message: string;
};

export default function Toast({ type, message }: ToastProps) {
  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span className={styles.icon} aria-hidden="true">
        {type === "success" ? "✓" : "!"}
      </span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
