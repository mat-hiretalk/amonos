"use client";

import { Provider } from "jotai";
import { ReactNode } from "react";
import { QueryProvider } from "@/app/client-layout";

interface StateProviderProps {
  children: ReactNode;
}

export function StateProvider({ children }: StateProviderProps) {
  return (
    <QueryProvider>
      <Provider>{children}</Provider>
    </QueryProvider>
  );
}
