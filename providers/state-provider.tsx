"use client";

import { Provider } from "jotai";
import { ReactNode } from "react";
import { QueryProvider } from "@/app/client-layout";
import { ToastContextProvider } from "./toast-context";
import { Toaster } from "@/components/ui/toaster";

interface StateProviderProps {
  children: ReactNode;
}

export function StateProvider({ children }: StateProviderProps) {
  return (
    <QueryProvider>
      <Provider>
        <ToastContextProvider>
          {children}
          <Toaster />
        </ToastContextProvider>
      </Provider>
    </QueryProvider>
  );
}
