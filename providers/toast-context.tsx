"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export function ToastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
  );
}

export function useClientToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "useClientToast must be used within a ToastContextProvider"
    );
  }
  return context;
}
