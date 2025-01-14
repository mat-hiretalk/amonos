"use client";

import { Provider } from "jotai";
import { ReactNode } from "react";
import { QueryProvider } from "@/app/client-layout";
import { JotaiDevtools } from "@/components/debug/jotai-devtools";

interface StateProviderProps {
  children: ReactNode;
}

export function StateProvider({ children }: StateProviderProps) {
  return (
    <QueryProvider>
      <Provider>
        {children}
        <JotaiDevtools />
      </Provider>
    </QueryProvider>
  );
}
