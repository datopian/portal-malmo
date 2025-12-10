// hooks/useFetch.ts
"use client";

import { useQuery } from "@tanstack/react-query";

type ResponseType = "text" | "json" | "arrayBuffer";

type FetchResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

async function fetchWithType<T = unknown>(
  url: string,
  responseType: ResponseType
): Promise<string | T | ArrayBuffer> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  if (responseType === "text") {
    return res.text();
  }

  if (responseType === "json") {
    return (res.json() as Promise<T>);
  }

  return res.arrayBuffer();
}

// Overloads
export function useFetch(
  url: string | null,
  responseType: "text"
): FetchResult<string>;
export function useFetch<T = unknown>(
  url: string | null,
  responseType: "json"
): FetchResult<T>;
export function useFetch(
  url: string | null,
  responseType: "arrayBuffer"
): FetchResult<ArrayBuffer>;
export function useFetch<T = unknown>(
  url: string | null,
  responseType: ResponseType
): FetchResult<string | T | ArrayBuffer> {
  const enabled = !!url;

  const { data, error, isLoading } = useQuery<
    string | T | ArrayBuffer,
    Error
  >({
    queryKey: ["fetch", url, responseType],
    enabled,
    queryFn: () => {
      // TS guard: if enabled is true, url is non-null
      return fetchWithType<T>(url as string, responseType);
    },
  });

  return {
    data: (data ?? null) as string | T | ArrayBuffer | null,
    isLoading,
    error: error ?? null,
  };
}