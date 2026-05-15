import { NextResponse } from "next/server";

import { createVisitorMessage } from "@/features/public/message-actions";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { body: ["请求内容不是有效 JSON"] } }, { status: 400 });
  }

  const result = await createVisitorMessage(body);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
