import { useCallback, useState } from "react";

export function useElementWidth() {
  const [width, setWidth] = useState<number>(0);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const update = () => setWidth(node.clientWidth);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}