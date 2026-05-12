import { NextRequest, NextResponse } from "next/server";

const GIPHY_KEY = process.env.GIPHY_API_KEY ?? "dc6zaTOxFJmzC";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const endpoint = q.trim()
    ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=12&rating=g`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=12&rating=g`;

  const res = await fetch(endpoint);
  const data = await res.json();
  return NextResponse.json(data);
}
