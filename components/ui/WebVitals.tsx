"use client";
import { useEffect } from "react";
export default function WebVitals() {
  useEffect(() => {
    let active = true;
    void import("web-vitals").then(({ onCLS, onINP, onLCP }) => {
      const report = ({ name, value }: { name: string; value: number }) => {
        if (active) performance.mark(`portfolio:${name}`, { detail: value });
      };
      onCLS(report, { reportAllChanges: true });
      onINP(report, { reportAllChanges: true });
      onLCP(report, { reportAllChanges: true });
    });
    return () => {
      active = false;
    };
  }, []);
  return null;
}
