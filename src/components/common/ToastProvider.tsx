
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast, { type ToastType } from "@/components/common/Toast";
import styles from "@/styles/Toast.module.css";

type ToastContextType = {
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
    id: number;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const nextId = useRef(0);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const id = ++nextId.current;
      setToast({ type, message, id });

      timerRef.current = setTimeout(() => {
        setToast((current) =>
          current?.id === id ? null : current
        );
        timerRef.current = null;
      }, 3500);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className={styles.toastContainer}>
        {toast && (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
          />
        )}
      </div>
    </ToastContext.Provider>
  );
}
