export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("Missing url param", { status: 400 });
  }

  const response = await fetch(fileUrl, {
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response("Failed to fetch file", {
      status: response.status || 500,
    });
  }

  const fileBytes = await response.arrayBuffer();

  if (!fileBytes.byteLength) {
    return new Response("Downloaded file is empty", { status: 502 });
  }

  const filename =
    getFilenameFromContentDisposition(
      response.headers.get("content-disposition"),
    ) ?? getFilenameFromUrl(response.url) ?? getFilenameFromUrl(fileUrl) ?? "download";

  return new Response(fileBytes, {
    status: 200,
    headers: {
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

  if (!fileUrl) {
    return new Response(null, { status: 400 });
  }

  return new Response(null, { status: 204 });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET,HEAD,OPTIONS",
    },
  });
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
