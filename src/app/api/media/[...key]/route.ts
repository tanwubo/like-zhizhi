import { NextResponse } from "next/server";
import { getStorage } from "@/server/storage";
import { toResponseBody } from "@/server/storage/media-response";

export async function GET(_request: Request, { params }: { params: Promise<{ key?: string[] }> }) {
  const { key: keyParts = [] } = await params;
  const key = keyParts.filter(Boolean).join("/");

  if (!key) {
    return NextResponse.json({ error: "Missing media key" }, { status: 400 });
  }

  try {
    const storage = await getStorage();
    const object = await storage.getObject(key);
    const body = toResponseBody(object.body);

    if (!body) {
      return NextResponse.json({ error: "Media body is not readable" }, { status: 502 });
    }

    const headers = new Headers();
    if (object.contentType) headers.set("content-type", object.contentType);
    if (object.contentLength !== undefined) headers.set("content-length", String(object.contentLength));
    headers.set("cache-control", "public, max-age=31536000, immutable");

    return new Response(body, { headers });
  } catch {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }
}
