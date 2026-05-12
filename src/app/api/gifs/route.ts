import { NextRequest, NextResponse } from "next/server";

const TENOR_KEY = process.env.TENOR_API_KEY ?? "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const endpoint = q.trim()
    ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=12&media_filter=tinygif,gif`
    : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=12&media_filter=tinygif,gif`;

  const res = await fetch(endpoint);
  const data = await res.json();
  return NextResponse.json(data);
}
