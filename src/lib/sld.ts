import { SldFilter, SldRule } from "@/types/leaflet-sld";
import L from "leaflet";

export type LegendItem = {
  label: string;
  kind: "point" | "line" | "polygon";
  fillColor?: string;
  color?: string;
  weight?: number;
  size?: number;
};

function buildLabel(filter?: SldFilter): string {
  if (!filter || filter.comparisions.length === 0) return "All features";
  const joiner = filter.operator === "or" ? " OR " : " AND ";
  return filter.comparisions
    .map((c) => `${c.property} ${c.operator} ${c.literal}`)
    .join(joiner);
}

function ruleKind(rule: SldRule): LegendItem["kind"] | null {
  if (rule.pointSymbolizer) return "point";
  if (rule.lineSymbolizer) return "line";
  if (rule.polygonSymbolizer) return "polygon";
  return null;
}

export function legendFromStyler(
  styler: L.SLDStyler,
  indexOrName?: string | number
): LegendItem[] {
  let stylesToUse = styler.featureTypeStyles;

  if (typeof indexOrName !== "undefined") {
    const idx =
      typeof indexOrName === "number"
        ? indexOrName
        : styler.featureTypeStylesNameMap[indexOrName];

    if (typeof idx === "number" && styler.featureTypeStyles[idx]) {
      stylesToUse = [styler.featureTypeStyles[idx]];
    }
  }

  const items: LegendItem[] = [];

  for (const fts of stylesToUse) {
    for (const rule of fts.rules) {
      const kind = ruleKind(rule);
      if (!kind) continue;

      const sym =
        kind === "point"
          ? rule.pointSymbolizer
          : kind === "line"
          ? rule.lineSymbolizer
          : rule.polygonSymbolizer;

      if (!sym) continue;

      items.push({
        label: buildLabel(rule.filter),
        kind,
        fillColor: sym.fillColor,
        color: sym.color,
        weight: sym.weight,
        size: sym.size,
      });
    }
  }

  return items;
}
