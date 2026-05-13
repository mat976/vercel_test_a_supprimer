import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const pollFilter = session ? {} : { isPublic: true };
  const db = await getDb();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      async function push() {
        if (closed) return;
        try {
          const [messages, polls] = await Promise.all([
            db.collection("messages").find().toArray(),
            db.collection("polls").find(pollFilter).toArray(),
          ]);
          const data = JSON.stringify({ messages, polls });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          controller.close();
          return;
        }
        if (!closed) setTimeout(push, 1000);
      }
      push();
    },
    cancel() {
      closed = true;
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
