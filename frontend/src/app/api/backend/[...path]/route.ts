import { NextRequest, NextResponse } from "next/server";

const UPSTREAM =
  process.env.API_URL?.split(",")[0]?.trim().replace(/\/$/, "") ||
  "https://route-53-assignment.onrender.com";

const REQUEST_HEADER_ALLOWLIST = new Set([
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "x-request-id",
  "x-export-filename",
]);

const RESPONSE_HEADER_BLOCKLIST = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
]);

type RouteContext = { params: Promise<{ path?: string[] }> };

function rewriteSetCookie(raw: string, incoming: URL): string {
  let value = raw.replace(/;\s*Domain=[^;]*/gi, "");
  const https = incoming.protocol === "https:";
  if (!https) {
    value = value.replace(/;\s*Secure/gi, "");
    value = value.replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  }
  return value;
}

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path = [] } = await context.params;
  const upstreamUrl = new URL(`${UPSTREAM}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (REQUEST_HEADER_ALLOWLIST.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, init);
  } catch {
    return NextResponse.json(
      { detail: `Cannot reach the API at ${UPSTREAM}.` },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (RESPONSE_HEADER_BLOCKLIST.has(key.toLowerCase())) {
      return;
    }
    if (key.toLowerCase() === "set-cookie") {
      return;
    }
    responseHeaders.append(key, value);
  });

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  for (const cookie of setCookies) {
    responseHeaders.append(
      "set-cookie",
      rewriteSetCookie(cookie, request.nextUrl),
    );
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export function HEAD(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}
