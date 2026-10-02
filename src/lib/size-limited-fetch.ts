export class ResourceTooLargeError extends Error {
  constructor() {
    super("Resource exceeds the maximum preview size.");
    this.name = "ResourceTooLargeError";
  }
}

export class FetchHttpError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, statusText: string) {
    super(`HTTP ${status} ${statusText}`.trim());
    this.name = "FetchHttpError";
    this.status = status;
    this.statusText = statusText;
  }
}

// Aborts on real bytes received, not Content-Length: most hosts never expose that header cross-origin.
export async function fetchTextWithSizeLimit(
  url: string,
  maxBytes: number,
  init?: RequestInit,
): Promise<string> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new FetchHttpError(response.status, response.statusText || "");
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new ResourceTooLargeError();
  }

  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).length > maxBytes) {
      throw new ResourceTooLargeError();
    }
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new ResourceTooLargeError();
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return text;
}
