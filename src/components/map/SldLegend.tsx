"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useSldStyler } from "@/hooks/sld";
import { legendFromStyler, type LegendItem } from "@/lib/sld";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function Swatch({ item }: { item: LegendItem }) {
  const stroke = item.color ?? "#232323";
  const fill = item.fillColor ?? "transparent";
  const weight = item.weight ?? 1;
  const size = item.size ?? 10;

  if (item.kind === "point") {
    return (
      <span
        className="flex items-center justify-center rounded-full border bg-background shadow-sm"
        style={{ width: 26, height: 26, borderColor: "rgba(0,0,0,0.10)" }}
      >
        <span
          className="rounded-full"
          style={{
            width: Math.max(12, size),
            height: Math.max(12, size),
            background: fill,
            border: `${weight}px solid ${stroke}`,
          }}
        />
      </span>
    );
  }

  if (item.kind === "line") {
    return (
      <span
        className="flex items-center justify-center rounded-md border bg-background shadow-sm"
        style={{ width: 34, height: 18, borderColor: "rgba(0,0,0,0.10)" }}
      >
        <span
          style={{
            width: 22,
            borderTop: `${Math.max(2, weight)}px solid ${stroke}`,
          }}
        />
      </span>
    );
  }

  return (
    <span
      className="flex items-center justify-center rounded-md border bg-background shadow-sm"
      style={{ width: 26, height: 26, borderColor: "rgba(0,0,0,0.10)" }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          background: fill,
          border: `${weight}px solid ${stroke}`,
        }}
      />
    </span>
  );
}

function groupByKind(items: LegendItem[]) {
  const map = new Map<string, LegendItem[]>();
  for (const it of items) {
    const key = it.kind;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return [...map.entries()];
}

function looksLikeRange(label: string) {
  return /\d/.test(label) && /-|–|to|>=|<=|>|</.test(label);
}

function GradientRamp({ items }: { items: LegendItem[] }) {
  const candidates = items.filter(
    (it) => it.fillColor && looksLikeRange(it.label),
  );

  if (candidates.length < 3) return null;

  const stops = candidates.map(
    (it, i) => `${it.fillColor} ${(i / (candidates.length - 1)) * 100}%`,
  );

  return (
    <div className="space-y-1">
      <div
        className="h-2 w-full rounded-full border"
        style={{
          background: `linear-gradient(to right, ${stops.join(", ")})`,
          borderColor: "rgba(0,0,0,0.10)",
        }}
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{candidates[0].label}</span>
        <span>{candidates[candidates.length - 1].label}</span>
      </div>
    </div>
  );
}

/**
 * Extract rule titles from SLD 1.1 (se:Title), fall back to se:Name.
 * collect titles in rule order.
 */
function extractRuleTitles(sldXml: string): string[] {
  try {
    const doc = new DOMParser().parseFromString(sldXml, "application/xml");

    // If XML parsing error, browser returns a <parsererror> element in some engines
    const parserErrors = doc.getElementsByTagName("parsererror");
    if (parserErrors?.length) return [];

    const SE_NS = "http://www.opengis.net/se";

    // Prefer Title inside Rule Description
    const titles = Array.from(doc.getElementsByTagNameNS(SE_NS, "Title"))
      .map((n) => (n.textContent ?? "").trim())
      .filter(Boolean);

    if (titles.length) return titles;

    // Fallback: Rule Name
    return Array.from(doc.getElementsByTagNameNS(SE_NS, "Name"))
      .map((n) => (n.textContent ?? "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isDefaultLegendLabel(label?: string) {
  const s = (label ?? "").trim().toLowerCase();
  return s === "all features" || s === "all feature" || s === "features";
}

export default function SldLegend({
  sldXml,
  layerNameOrIndex,
  className,
}: {
  sldXml: string;
  layerNameOrIndex?: string | number;
  className?: string;
}) {
  const styler = useSldStyler(sldXml);

  const ruleTitles = useMemo(() => extractRuleTitles(sldXml), [sldXml]);

  const rawItems = useMemo(() => {
    if (!styler) return [];
    const base = legendFromStyler(styler, layerNameOrIndex);

    // If labels are useless (e.g. "All features" repeated), replace by rule titles in order.
    const allDefault = base.length > 0 && base.every((it) => isDefaultLegendLabel(it.label));
    if (!allDefault) return base;

    return base.map((it, idx) => ({
      ...it,
      label: ruleTitles[idx] ?? it.label ?? "Untitled",
    }));
  }, [styler, layerNameOrIndex, ruleTitles]);

  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rawItems;
    return rawItems.filter((it) => (it.label ?? "").toLowerCase().includes(query));
  }, [rawItems, q]);

  const groups = useMemo(() => groupByKind(items), [items]);

  if (rawItems.length === 0) return null;

  return (
    <Card className={cn("w-[320px]", className)}>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base">Legend</CardTitle>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{rawItems.length} items</Badge>
          {layerNameOrIndex !== undefined && (
            <Badge variant="outline">Layer {String(layerNameOrIndex)}</Badge>
          )}
        </div>

        <GradientRamp items={rawItems} />

        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter legend…"
            className="h-9"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear filter"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
          {groups.map(([kind, groupItems]) => (
            <div key={kind} className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                {kind === "polygon" ? "Areas" : kind === "line" ? "Lines" : "Points"}
              </div>

              <div className="space-y-1.5">
                {groupItems.map((it, idx) => (
                  <div
                    key={`${it.kind}-${it.label}-${idx}`}
                    className="flex items-center gap-3 rounded-lg border px-2.5 py-2 bg-card/50 hover:bg-card transition-colors"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <Swatch item={it} />
                    <div className="text-sm truncate flex-1">
                      {it.label || "Untitled"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No legend items match.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
