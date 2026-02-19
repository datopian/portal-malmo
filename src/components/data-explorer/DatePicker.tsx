import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useOnClickOutside(
  refs: Array<React.RefObject<HTMLElement | null>>,
  onOutside: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const isInside = refs.some((r) => r.current?.contains(target));
      if (!isInside) onOutside();
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [enabled, onOutside, refs]);
}

function useEscapeToClose(onClose: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled, onClose]);
}

export function DatePicker({
  date,
  setDate,
}: {
  date?: string;
  setDate: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside([triggerRef, panelRef], () => setOpen(false), open);
  useEscapeToClose(() => setOpen(false), open);

  const dateObj = date ? new Date(date) : undefined;

  return (
    <div className="relative w-full">
      <Button
        ref={triggerRef}
        type="button"
        variant="input"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "justify-start text-left font-normal w-full px-4 h-9",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-0 h-3 w-3" />
        {date ? format(new Date(date), "PPP") : <span>Select a date</span>}
      </Button>

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Choose a date"
          className="absolute right-0 top-full z-50 mt-2 w-auto rounded-md border bg-background p-0 shadow-md animate-in fade-in zoom-in-95"
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={dateObj}
            required
            onSelect={(selected) => {
              const newDate = selected ?? new Date();
              setDate(newDate.toISOString());
              setOpen(false);
            }}
            startMonth={new Date(1960, 0)}
            endMonth={new Date(2060, 0)}
          />
        </div>
      ) : null}
    </div>
  );
}
