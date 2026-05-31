"use client";

import { useRef } from "react";

export function useLayerRemountKey<T>(value: T, prefix: string) {
  const keyRef = useRef<{ value: T; version: number } | null>(null);

  if (!keyRef.current || keyRef.current.value !== value) {
    keyRef.current = {
      value,
      version: (keyRef.current?.version ?? 0) + 1,
    };
  }

  return `${prefix}-${keyRef.current.version}`;
}
