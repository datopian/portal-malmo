export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("Missing url param", { status: 400 });
  }

  const response = await fetch(fileUrl);

  if (!response.ok || !response.body) {
    return new Response("Failed to fetch file", {
      status: response.status || 500,
    });
  }

  const filename = fileUrl.split("/").pop() || "download";

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/octet-stream",

      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}