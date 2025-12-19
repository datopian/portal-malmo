"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

function useIsClamped(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isClamped, setIsClamped] = useState(false);

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const clamped = el.scrollHeight > el.clientHeight + 1;
    setIsClamped(clamped);
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Re-measure on resize + font load/layout changes
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, isClamped };
}

export default useIsClamped;