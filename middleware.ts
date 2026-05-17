import { NextRequest, NextResponse, userAgent } from "next/server";

function isCrawler(ua: string): boolean {
  return /bot|crawler|spider|crawling|google|bing|duckduck|slurp|yandex|baidu|facebookexternalhit|twitterbot/i.test(
    ua
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname !== "/") {
    return NextResponse.next();
  }

  const ua = request.headers.get("user-agent") || "";
  if (isCrawler(ua)) {
    return NextResponse.next();
  }

  const device = userAgent(request);
  const isMobile = device.device.type === "mobile";

  if (!isMobile) {
    return NextResponse.next();
  }

  const mobileUrl = request.nextUrl.clone();
  mobileUrl.pathname = "/m";
  return NextResponse.redirect(mobileUrl);
}

export const config = {
  matcher: ["/"]
};
