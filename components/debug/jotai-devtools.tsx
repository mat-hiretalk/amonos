"use client";

import { DevTools } from "jotai-devtools";

export function JotaiDevtools() {
  if (process.env.NODE_ENV === "production") return null;

  return <DevTools />;
}
