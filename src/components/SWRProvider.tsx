"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

const CACHE_KEY = "cc-swr-cache";

// Persist the SWR cache to localStorage so that after a full page reload (Ctrl+R)
// the catalog renders instantly from the last-known data while it revalidates in
// the background — instead of showing a blank "loading" state every time.
function localStorageProvider() {
  // SWR's Cache type expects loosely-typed values, matching its docs example.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window === "undefined") return new Map<string, any>();

  const stored = window.localStorage.getItem(CACHE_KEY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new Map<string, any>(stored ? JSON.parse(stored) : []);

  const save = () => {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(map.entries())));
    } catch {
      // localStorage full or unavailable — caching is best-effort.
    }
  };
  // beforeunload covers desktop reloads; visibilitychange is the reliable one on
  // mobile / installed PWA where the tab is backgrounded rather than closed.
  window.addEventListener("beforeunload", save);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") save();
  });

  return map;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`request failed: ${r.status}`);
    return r.json();
  });

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        provider: localStorageProvider,
        revalidateOnFocus: false,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
