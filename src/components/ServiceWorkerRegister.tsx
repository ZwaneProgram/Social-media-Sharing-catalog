"use client";

import { useEffect } from "react";

// Registers the PWA service worker in production. In development a previously
// registered service worker serves stale cached HTML/JS, which causes hydration
// mismatches against freshly built code — so in dev we actively unregister any
// existing worker and purge its caches instead.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
      return;
    }

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
