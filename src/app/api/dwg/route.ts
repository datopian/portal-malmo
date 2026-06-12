import { envVars } from "@/lib/env";

const ALLOWED_CORS_ORIGINS = new Set([
  "https://www.innerscene.com",
  "https://innerscene.com",
]);
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = Number(process.env.DWG_PROXY_TIMEOUT_MS ?? "10000");
const ALLOWED_DWG_CONTENT_TYPES = new Set([
  "application/acad",
  "application/autocad_dwg",
  "application/dwg",
  "application/octet-stream",
  "application/x-acad",
  "application/x-dwg",
  "binary/octet-stream",
  "image/vnd.dwg",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const corsHeaders = getCorsHeaders(request);

  const resourceId = searchParams.get("resourceId")?.trim();

  if (!resourceId) {
    return new Response("Missing resourceId param", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!isValidResourceId(resourceId)) {
    return new Response("Invalid resourceId param", {
      status: 400,
      headers: corsHeaders,
    });
  }

  let upstreamUrl: string;
  try {
    upstreamUrl = await resolveResourceUrl(resourceId);
  } catch {
    return new Response("Failed to resolve resource", {
      status: 502,
      headers: corsHeaders,
    });
  }

  if (!isAllowedUpstreamUrl(upstreamUrl)) {
    return new Response("Resource URL is not allowed", {
      status: 403,
      headers: corsHeaders,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let response!: Response;
  let fileBytes: ArrayBuffer;
  try {
    response = await fetch(upstreamUrl, {
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!isAllowedUpstreamUrl(response.url)) {
      return new Response("Redirected resource URL is not allowed", {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (!response.ok) {
      return new Response("Failed to fetch file", {
        status: response.status || 500,
        headers: corsHeaders,
      });
    }

    if (!isAllowedContentType(response.headers.get("content-type"))) {
      return new Response("Unsupported content type", {
        status: 415,
        headers: corsHeaders,
      });
    }

    const contentLength = Number(response.headers.get("content-length") ?? "");
    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_BYTES) {
      return new Response("File exceeds 20 MB limit", {
        status: 413,
        headers: corsHeaders,
      });
    }

    fileBytes = await readResponseWithinLimit(
      response,
      MAX_FILE_BYTES,
      controller.signal,
    );
  } catch (error) {
    if (isAbortError(error)) {
      return new Response("DWG download timed out", {
        status: 504,
        headers: corsHeaders,
      });
    }

    if (error instanceof Error && error.message === "file_too_large") {
      return new Response("File exceeds 20 MB limit", {
        status: 413,
        headers: corsHeaders,
      });
    }

    return new Response("Failed to download file", {
      status: 502,
      headers: corsHeaders,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!fileBytes.byteLength) {
    return new Response("Downloaded file is empty", {
      status: 502,
      headers: corsHeaders,
    });
  }

  const filename =
    getFilenameFromContentDisposition(
      response.headers.get("content-disposition"),
    ) ?? getFilenameFromUrl(response.url) ?? getFilenameFromUrl(upstreamUrl) ?? "download";

  return new Response(fileBytes, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type":
        response.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Length": String(fileBytes.byteLength),
    },
  });
}

export async function HEAD(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resourceId")?.trim();
  const corsHeaders = getCorsHeaders(request);

  if (!resourceId || !isValidResourceId(resourceId)) {
    return new Response(null, {
      status: 400,
      headers: corsHeaders,
    });
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function OPTIONS(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      Allow: "GET,HEAD,OPTIONS",
    },
  });
}

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {};

  if (origin && ALLOWED_CORS_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET,HEAD,OPTIONS";
    headers["Access-Control-Allow-Headers"] =
      "Content-Type, Authorization, Range";
    headers["Access-Control-Expose-Headers"] =
      "Content-Type, Content-Disposition, Content-Length, Accept-Ranges";
    headers.Vary = "Origin";
  }

  return headers;
}

async function readResponseWithinLimit(
  response: Response,
  maxBytes: number,
  signal: AbortSignal,
) {
  if (!response.body) {
    return new ArrayBuffer(0);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    signal.throwIfAborted();
    const { done, value } = await reader.read();
    signal.throwIfAborted();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel("File exceeds size limit");
      throw new Error("file_too_large");
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged.buffer;
}

async function resolveResourceUrl(resourceId: string) {
  const dmsUrl = getDmsUrl();
  const url = new URL("api/3/action/resource_show", `${dmsUrl}/`);
  url.searchParams.set("id", resourceId);

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("resource_show_failed");
  }

  const payload = await response.json();
  const resourceUrl = payload?.result?.url;
  if (typeof resourceUrl !== "string" || !resourceUrl.trim()) {
    throw new Error("missing_resource_url");
  }

  return resourceUrl;
}

function getDmsUrl() {
  if (!envVars.dms) {
    throw new Error("DMS URL is not defined");
  }

  return envVars.dms.replace(/\/$/, "");
}

function isValidResourceId(resourceId: string) {
  return /^[a-zA-Z0-9_-]+$/.test(resourceId);
}

function isAllowedUpstreamUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  return getAllowedUpstreamHosts().has(url.hostname.toLowerCase());
}

function getAllowedUpstreamHosts() {
  const hosts = new Set([
    "ckan-malmo.dataplatform.se",
    "acc-ckan-malmo.dataplatform.se",
    "ckan.city-of-malmo.datopian.com",
    "ckan.city-of-malmo-staging.datopian.com",
  ]);

  if (envVars.dms) {
    hosts.add(new URL(envVars.dms).hostname.toLowerCase());
  }

  return hosts;
}

function isAllowedContentType(contentType: string | null) {
  if (!contentType) return true;

  const normalized = contentType.split(";")[0]?.trim().toLowerCase();
  return !!normalized && ALLOWED_DWG_CONTENT_TYPES.has(normalized);
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function getFilenameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || null;
  } catch {
    return null;
  }
}

function getFilenameFromContentDisposition(header: string | null) {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = header.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] ?? null;
}
