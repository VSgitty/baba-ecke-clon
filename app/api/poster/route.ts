import { NextRequest, NextResponse } from "next/server";

function isValidRemoteUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!isValidRemoteUrl(raw)) {
    return NextResponse.json({ error: "Invalid poster url" }, { status: 400 });
  }

  try {
    const upstream = await fetch(raw, {
      headers: {
        "User-Agent": "baba-ecke-image-proxy/1.0",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      next: { revalidate: 604800 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Poster fetch failed" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Upstream did not return an image" }, { status: 415 });
    }

    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    });
  } catch {
    return NextResponse.json({ error: "Poster proxy error" }, { status: 500 });
  }
}
