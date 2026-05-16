"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const visitorStorageKey = "like-zhizhi-visitor-id";

function getVisitorId() {
  const existing = window.localStorage.getItem(visitorStorageKey);

  if (existing) {
    return existing;
  }

  const generated =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(visitorStorageKey, generated);
  return generated;
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const body = JSON.stringify({
      path: pathname,
      visitorId: getVisitorId()
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/visits", new Blob([body], { type: "application/json" }));
      return;
    }

    void fetch("/api/visits", {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true
    });
  }, [pathname]);

  return null;
}
