"use client";

import { FormEventHandler, MouseEventHandler, useRef, useState } from "react";
import { SearchIcon, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function SearchForm({
  value = "",
  placeholder = "Enter a search term...",
  onSubmit,
}: {
  value?: string;
  placeholder?: string;
  onSubmit?: (q: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQuery] = useState(value);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(q ?? "");
    else router.push(`${pathname === "/" ? "search" : pathname}?query=${encodeURIComponent(q)}`);
    return false;
  };

  const handleClearQuery: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setQuery("");
    ref.current?.focus();
    const params = new URLSearchParams(window.location.search);
    params.delete("query");
    const newSearch = params.toString();
    const newPath = newSearch ? `${pathname}?${newSearch}` : `${pathname}`;
    router.push(newPath);
    return false;
  };

  return (
    <div className="w-full">
      <form className="" onSubmit={handleSubmit}>
        <div className="flex w-full relative rounded-lg">
          <input
            ref={ref}
            aria-label={placeholder}
            type="text"
            name="query"
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            value={q}
            className="w-full px-4 py-3 bg-white pr-[60px] focus:shadow-lg rounded-lg outline-0 border border-gray-200"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              className="cursor-pointer absolute right-15 top-[14px] text-gray-600 hover:text-gray-900 transition"
              onClick={handleClearQuery}
            >
              <X className="size-5" />
            </button>
          )}
          <button
            type="submit"
            aria-labelledby="search-label"
            className="flex cursor-pointer absolute right-0 h-full z-10 items-center px-4 rounded-r-lg text-gray-600 hover:text-gray-900 transition"
          >
            <SearchIcon className="size-5" />
            <span className="sr-only" id="search-label">
              Search
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
