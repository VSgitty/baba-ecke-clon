import { NextRequest, NextResponse, userAgent } from "next/server";

function isCrawler(ua: string): boolean {
  return /bot|crawler|spider|crawling|google|bing|duckduck|slurp|yandex|baidu|facebookexternalhit|twitterbot/i.test(
    ua
  );
}

function isTvUserAgent(ua: string): boolean {
  return /smart-tv|smarttv|hbbtv|appletv|googletv|android tv|aft[a-z0-9-]+|bravia|tizen|web0s|webos|netcast|viera|roku|playstation|xbox/i.test(
    ua
  );
}

function wantsTvExperience(request: NextRequest): boolean {
  const view = request.nextUrl.searchParams.get("view")?.toLowerCase();
  const tv = request.nextUrl.searchParams.get("tv")?.toLowerCase();
  if (view === "tv" || tv === "1" || tv === "true") return true;

  const ua = request.headers.get("user-agent") || "";
  return isTvUserAgent(ua);
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

function requiresAdminAuth(pathname: string, method: string): boolean {
  if (pathname.startsWith("/admin")) return true;

  const isWrite = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  if (!isWrite) return false;

  return (
    pathname.startsWith("/api/catalog") ||
    pathname.startsWith("/api/franchises") ||
    pathname.startsWith("/api/shelves")
  );
}

function isAuthorized(request: NextRequest): boolean {
  const adminUser = process.env.ADMIN_BASIC_USER;
  const adminPass = process.env.ADMIN_BASIC_PASS;

  // Auth can be enabled by setting both env vars.
  if (!adminUser || !adminPass) return true;

  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return false;

  try {
    const decoded = atob(auth.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;

    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    return user === adminUser && pass === adminPass;
  } catch {
    return false;
  }
}

function unauthorizedResponse(): NextResponse {
  const response = new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Baba Ecke Admin", charset="UTF-8"'
    }
  });

  return applySecurityHeaders(response);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (requiresAdminAuth(pathname, request.method) && !isAuthorized(request)) {
    return unauthorizedResponse();
  }

  if (pathname !== "/") {
    return applySecurityHeaders(NextResponse.next());
  }

  const ua = request.headers.get("user-agent") || "";
  if (isCrawler(ua)) {
    return applySecurityHeaders(NextResponse.next());
  }

  if (wantsTvExperience(request)) {
    const tvUrl = request.nextUrl.clone();
    tvUrl.pathname = "/tv";
    tvUrl.searchParams.delete("tv");
    tvUrl.searchParams.delete("view");
    return applySecurityHeaders(NextResponse.redirect(tvUrl));
  }

  const device = userAgent(request);
  const isMobile = device.device.type === "mobile";

  if (!isMobile) {
    return applySecurityHeaders(NextResponse.next());
  }

  const mobileUrl = request.nextUrl.clone();
  mobileUrl.pathname = "/m";
  return applySecurityHeaders(NextResponse.redirect(mobileUrl));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
