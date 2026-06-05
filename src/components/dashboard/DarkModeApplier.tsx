"use client";

import { useEffect } from "react";

export function DarkModeApplier() {
  useEffect(() => {
    document.documentElement.style.colorScheme = "dark";
    return () => {
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  return null;
}
