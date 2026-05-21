export function toResponseBody(body: unknown): BodyInit | null {
  if (!body) return null;
  if (body instanceof ReadableStream) return body;
  if (body instanceof Uint8Array) {
    return new Uint8Array(body).buffer;
  }
  if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer) {
    return body;
  }
  if (typeof body === "object" && "transformToWebStream" in body && typeof body.transformToWebStream === "function") {
    return body.transformToWebStream() as ReadableStream;
  }
  return null;
}
