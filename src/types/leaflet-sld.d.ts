import "leaflet";
import type { Layer, LatLngExpression, PathOptions } from "leaflet";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";

/**
 * Internal structures produced by the Leaflet.SLDStyler plugin you pasted.
 * These are NOT official Leaflet types; they reflect that specific plugin's output.
 */

export type SldComparisonOperator =
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | "like";

export interface SldComparison {
  operator: SldComparisonOperator;
  property: string;
  literal: string;
  wildCard?: string;
  singleChar?: string;
  escapeChar?: string;
}

export interface SldFilter {
  operator: "and" | "or" | null;
  comparisions: SldComparison[];
}

export interface SldSymbolizer extends PathOptions {
  // plugin-specific extras
  strokeOpacity?: number;
  fillOpacity?: number;
  strokeWidth?: number; // some SLDs may map differently; plugin maps to weight
  size?: number;
  rotation?: number;
  wellKnownName?: string;
}

export interface SldRule {
  filter?: SldFilter;
  polygonSymbolizer: SldSymbolizer | null;
  lineSymbolizer: SldSymbolizer | null;
  pointSymbolizer: SldSymbolizer | null;
}

export interface SldFeatureTypeStyle {
  name: string | null;
  rules: SldRule[];
}

declare module "leaflet" {
  export type SldStyleFunction = (
    feature?: Feature<Geometry, GeoJsonProperties>
  ) => PathOptions;

  export type SldPointToLayerFunction = (
    feature: Feature<Geometry, GeoJsonProperties>,
    latlng: LatLngExpression
  ) => Layer;

  export class SLDStyler {
    constructor(sldXml: string, options?: unknown);
    getStyleFunction(indexOrName?: string | number): SldStyleFunction;
    getPointToLayerFunction(
      indexOrName?: string | number,
      options?: PathOptions
    ): SldPointToLayerFunction;
    featureTypeStyles: SldFeatureTypeStyle[];
    featureTypeStylesNameMap: Record<string, number>;
    options: unknown;
  }
}
