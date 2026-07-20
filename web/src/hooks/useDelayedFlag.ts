import { useEffect, useState } from "react";

/** Becomes true only once `active` has stayed true continuously for at least `delayMs`. */
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (!active) {
      setFlag(false);
      return;
    }
    const timer = setTimeout(() => setFlag(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return flag;
}
