"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./input";
import { FormEvent, useState, useTransition } from "react";
import { X } from "lucide-react";

export default function PageSearchInput({
  defaultValue = "",
  placeholder = "Search...",
  paramName = "q",
}: {
  defaultValue?: string;
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  function updateQueryParam(newValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (newValue) {
      params.set(paramName, newValue);
    } else {
      params.delete(paramName);
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateQueryParam(value);
  }

  function handleClear() {
    setValue("");
    updateQueryParam("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full ">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        className="w-full pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
