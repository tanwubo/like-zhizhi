import { NextResponse } from "next/server";

import { recordVisitEvent } from "@/server/analytics/visits";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { body: ["请求内容不是有效 JSON"] } }, { status: 400 });
  }

  const payload = body && typeof body === "object" ? body : {};
  const path = "path" in payload && typeof payload.path === "string" ? payload.path : "";
  const visitorId = "visitorId" in payload && typeof payload.visitorId === "string" ? payload.visitorId : null;
  const result = await recordVisitEvent({
    path,
    visitorId,
    userAgent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer")
  });

  return NextResponse.json({ ok: true, recorded: result.recorded }, { status: result.recorded ? 201 : 202 });
}
