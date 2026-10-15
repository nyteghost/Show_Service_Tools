import { useEffect, useState } from "react";

/** String state mirrored to localStorage (safe when storage is blocked). */
export function usePersisted(key: string, initial: string) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
