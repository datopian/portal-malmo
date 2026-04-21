import { SldComparison, SldFilter, SldRule } from "@/types/leaflet-sld";
import L from "leaflet";

export type LegendItem = {
  label: string;
  kind: "point" | "line" | "polygon";
  fieldLabel: string;
  fields: string[];
  fillColor?: string;
  color?: string;
  weight?: number;
  size?: number;
};

function normalizeLikeLiteral(comparison: SldComparison): string {
  const literal = comparison.literal ?? "";
  const wildCard = comparison.wildCard || "*";
  const singleChar = comparison.singleChar || "?";
  const escapeChar = comparison.escapeChar || "!";
  let value = "";
  let escaped = false;

  for (let index = 0; index < literal.length; index += 1) {
    const char = literal[index];
    const isBoundaryWildcard =
      !escaped &&
      (char === wildCard || char === singleChar) &&
      (index === 0 || index === literal.length - 1);

    if (!escaped && char === escapeChar) {
      escaped = true;
      continue;
    }

    if (isBoundaryWildcard) {
      continue;
    }

    value += char;
    escaped = false;
  }

  return value.trim();
}

function buildComparisonLabel(comparison: SldComparison): string {
  if (comparison.operator !== "like") {
    return `${comparison.property} ${comparison.operator} ${comparison.literal}`;
  }

  const literal = comparison.literal ?? "";
  const wildCard = comparison.wildCard || "*";
  const singleChar = comparison.singleChar || "?";
  const startsWithWildcard = literal.startsWith(wildCard);
  const endsWithWildcard = literal.endsWith(wildCard);
  const hasSingleChar = literal.includes(singleChar);
  const normalizedValue = normalizeLikeLiteral(comparison) || literal;

  if (hasSingleChar) {
    return `${comparison.property} matches ${literal}`;
  }

  if (startsWithWildcard && endsWithWildcard) {
    return `${comparison.property} contains ${normalizedValue}`;
  }

  if (endsWithWildcard) {
    return `${comparison.property} starts with ${normalizedValue}`;
  }

  if (startsWithWildcard) {
    return `${comparison.property} ends with ${normalizedValue}`;
  }

  return `${comparison.property} matches ${literal}`;
}

function buildLabel(filter?: SldFilter): string {
  if (!filter || filter.comparisions.length === 0) return "All features";
  const joiner = filter.operator === "or" ? " OR " : " AND ";
  return filter.comparisions
    .map(buildComparisonLabel)
    .join(joiner);
}

function extractFields(filter?: SldFilter): string[] {
  if (!filter || filter.comparisions.length === 0) return [];

  return [...new Set(filter.comparisions.map((comparison) => comparison.property.trim()).filter(Boolean))];
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

      const fields = extractFields(rule.filter);

      items.push({
        label: buildLabel(rule.filter),
        kind,
        fieldLabel: fields.join(", ") || "All fields",
        fields,
        fillColor: sym.fillColor,
        color: sym.color,
        weight: sym.weight,
        size: sym.size,
      });
    }
  }

  return items;
}
