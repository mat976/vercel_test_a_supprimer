import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function findPoll(id: string) {
  const db = await getDb();
  let poll = null;
  if (ObjectId.isValid(id)) {
    poll = await db.collection("polls").findOne({ _id: new ObjectId(id) });
  }
  if (!poll) {
    poll = await db.collection("polls").findOne({ slug: id });
  }
  return { db, poll };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { poll } = await findPoll(id);
  if (!poll) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(poll);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, poll } = await findPoll(id);
  if (!poll) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await request.json();

  if (body.close === true) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || poll.createdBy !== session.user.id)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    await db.collection("polls").updateOne({ _id: poll._id }, { $set: { isClosed: true } });
    return NextResponse.json({ success: true });
  }

  const { optionIndex } = body;
  if (optionIndex === undefined) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  if (poll.isClosed || (poll.endsAt && new Date() > new Date(poll.endsAt)))
    return NextResponse.json({ error: "Sondage fermé" }, { status: 403 });

  let userId: string;

  if (poll.isPublic) {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous";
    userId = `anon_${ip}`;
  } else {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
    userId = session.user.id;
  }

  const update: Record<string, unknown> = {};
  poll.options.forEach((_: unknown, i: number) => {
    update[`options.${i}.voters`] = poll.options[i].voters.filter((v: string) => v !== userId);
  });
  update[`options.${optionIndex}.voters`] = [...poll.options[optionIndex].voters.filter((v: string) => v !== userId), userId];

  await db.collection("polls").updateOne({ _id: poll._id }, { $set: update });
  return NextResponse.json({ success: true });
}
