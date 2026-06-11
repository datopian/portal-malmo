const ALLOWED_CORS_ORIGINS = new Set([
  "https://www.innerscene.com",
  "https://innerscene.com",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const corsHeaders = getCorsHeaders(request);

  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("Missing url param", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const response = await fetch(fileUrl, {
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response("Failed to fetch file", {
      status: response.status || 500,
      headers: corsHeaders,
    });
  }

  const fileBytes = await response.arrayBuffer();

  if (!fileBytes.byteLength) {
    return new Response("Downloaded file is empty", {
      status: 502,
      headers: corsHeaders,
    });
  }

  const filename =
    getFilenameFromContentDisposition(
      response.headers.get("content-disposition"),
    ) ?? getFilenameFromUrl(response.url) ?? getFilenameFromUrl(fileUrl) ?? "download";

  return new Response(fileBytes, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type":
        response.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(fileBytes.byteLength),
    },
  });
}

export async function HEAD(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const corsHeaders = getCorsHeaders(request);

  if (!fileUrl) {
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
