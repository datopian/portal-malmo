// scripts/generate-routes.mjs
// Generate public/__routes.json with auto-discovered static App Router routes.

import fs from "fs";
import path from "path";

import "dotenv/config";

const ROOT = process.cwd();

const APP_DIR_CANDIDATES = [path.join(ROOT, "src", "app"), path.join(ROOT, "app")];
const APP_DIR = APP_DIR_CANDIDATES.find(existsDir);

const OUT = path.join(ROOT, "public", "__routes.json");

const PAGE_RE = /^page\.(js|jsx|ts|tsx)$/;

const CKAN_URL = process.env.NEXT_PUBLIC_DMS?.trim() || "";
const CKAN_SORT =  "metadata_modified desc";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_I18N_DEFAULT_LOCALE?.trim() || "en";
const DEFAULT_LOCALE_UNPREFIXED = process.env.I18N_DEFAULT_UNPREFIXED === "true";

console.log("DMS: "+CKAN_URL)


function isLocaleSegment(seg) {
  return seg === "[locale]";
}

function expandLocaleSegmentsDefaultOnly(segments) {
  const idx = segments.findIndex(isLocaleSegment);
  if (idx === -1) return [segments];

  // If default is unprefixed, remove the locale segment entirely
  if (DEFAULT_LOCALE_UNPREFIXED) {
    return [segments.filter((s) => !isLocaleSegment(s))];
  }

  // Otherwise, prefix with default locale
  if (!DEFAULT_LOCALE) return []; // no default configured => nothing to expand
  const clone = [...segments];
  clone[idx] = DEFAULT_LOCALE;
  return [clone];
}

function existsDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isDynamicSegment(seg) {
  // [id], [...slug], [[...slug]]
  return /^\[.*\]$/.test(seg);
}

function isRouteGroup(seg) {
  // (marketing) - not in URL
  return /^\(.*\)$/.test(seg);
}

function isParallelRoute(seg) {
  // @modal - not a URL segment
  return seg.startsWith("@");
}

function isPrivateSegment(seg) {
  return seg.startsWith("_");
}

function normalizeToRoute(segments) {

  const urlSegments = segments.filter((seg) => !isRouteGroup(seg));

  if (urlSegments.length === 0) return "/";

  return "/" + urlSegments.join("/");
}

function shouldSkipDirSegment(seg) {

  if (isPrivateSegment(seg)) return true;
  if (isParallelRoute(seg)) return true;
  return false;
}

function collectRoutes() {
  const routes = new Set();

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    const hasPage = entries.some((e) => e.isFile() && PAGE_RE.test(e.name));
    if (hasPage) {
      const relDir = path.relative(APP_DIR, currentDir).replace(/\\/g, "/");
      const segments = relDir === "" ? [] : relDir.split("/");

      // If it's dynamic but ONLY because of [locale], expand it.
      const hasDynamic = segments.some(isDynamicSegment);
      const isOnlyLocaleDynamic =
        hasDynamic && segments.every((s) => !isDynamicSegment(s) || isLocaleSegment(s));

      if (!hasDynamic) {
        routes.add(normalizeToRoute(segments));
      } else if (isOnlyLocaleDynamic) {
        const expanded = expandLocaleSegmentsDefaultOnly(segments);
        for (const segs of expanded) routes.add(normalizeToRoute(segs));
      }

      console.log("[routes] found page in", currentDir);
      // else: ignore other dynamic routes
    }

    for (const ent of entries) {
      if (!ent.isDirectory()) continue;

      const seg = ent.name;
      if (shouldSkipDirSegment(seg)) continue;

      walk(path.join(currentDir, seg));
    }
  }

  walk(APP_DIR);

  return Array.from(routes).sort((a, b) => a.length - b.length || a.localeCompare(b));
}

function writeRoutesFile(routes) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        routes,
        generatedAt: new Date().toISOString(),
        source: "app-router",
      },
      null,
      2
    ) + "\n"
  );
}

async function fetchFirstDatasetAndResource() {
  if (!CKAN_URL) return null;

  const base = CKAN_URL.replace(/\/+$/, "");
  const params = new URLSearchParams({
    rows: "1",
    sort: CKAN_SORT,
  });
  const url = `${base}/api/3/action/package_search?${params.toString()}`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.warn(`[routes] CKAN package_search failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const first = data?.result?.results?.[0];
    if (!first?.name || !first?.organization?.name) {
      console.warn("[routes] CKAN returned dataset without name or organization.name");
      return null;
    }

    const orgName = first.organization.name;
    const datasetName = first.name;

    const firstResourceId = first?.resources?.[0]?.id || null;

    return { orgName, datasetName, firstResourceId };
  } catch (err) {
    console.warn("[routes] CKAN fetch error:", err?.message || err);
    return null;
  }
}

function appendUnique(routes, extraRoutes) {
  const set = new Set(routes);
  for (const r of extraRoutes) {
    if (typeof r === "string" && r.startsWith("/")) set.add(r);
  }
  return Array.from(set).sort((a, b) => a.length - b.length || a.localeCompare(b));
}

if (!existsDir(APP_DIR)) {
  console.error(`Could not find app directory at: ${APP_DIR}`);
  process.exit(1);
}

const staticRoutes = collectRoutes();

// Append CKAN sample routes (localized to default locale route prefix)
const sample = await fetchFirstDatasetAndResource();

let routes = staticRoutes;

if (sample) {
  const { orgName, datasetName, firstResourceId } = sample;

  const datasetRoute = `/${DEFAULT_LOCALE}/@${orgName}/${datasetName}`;
  const extras = [datasetRoute];

  if (firstResourceId) {
    extras.push(`/${DEFAULT_LOCALE}/@${orgName}/${datasetName}/${firstResourceId}`);
  }

  routes = appendUnique(routes, extras);
} else {
  console.log("[routes] CKAN_URL missing or sample dataset not found, skipping CKAN dynamic routes.");
}

writeRoutesFile(routes);

console.log(`Wrote ${path.relative(ROOT, OUT)} with ${routes.length} routes`);
for (const r of routes) console.log(` - ${r}`);