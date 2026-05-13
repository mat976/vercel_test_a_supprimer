import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const db = await getDb();
  const filter = session ? {} : { isPublic: true };
  const polls = await db.collection("polls").find(filter).toArray();
  return NextResponse.json(polls);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { question, options, isPublic, slug, durationMs } = await request.json();
  if (!question || !options || options.length < 2)
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const db = await getDb();

  if (slug) {
    const existing = await db.collection("polls").findOne({ slug });
    if (existing) return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });
  }

  const poll = {
    question,
    options: options.map((o: { text: string; gif?: string }) => ({ text: o.text, gif: o.gif ?? null, voters: [] })),
    createdBy: session.user.id,
    createdByName: session.user.name,
    createdAt: new Date(),
    isPublic: !!isPublic,
    slug: slug?.trim() || null,
    endsAt: durationMs ? new Date(Date.now() + durationMs) : null,
    isClosed: false,
  };
  const result = await db.collection("polls").insertOne(poll);
  return NextResponse.json({ ...poll, _id: result.insertedId }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { pollId } = body;
  if (!pollId) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const db = await getDb();
  const poll = await db.collection("polls").findOne({ _id: new ObjectId(pollId) });
  if (!poll) return NextResponse.json({ error: "Sondage introuvable" }, { status: 404 });

  const session = await auth.api.getSession({ headers: await headers() });

  if (body.close === true) {
    if (!session || poll.createdBy !== session.user.id)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    await db.collection("polls").updateOne({ _id: new ObjectId(pollId) }, { $set: { isClosed: true } });
    return NextResponse.json({ success: true });
  }

  const { optionIndex } = body;
  if (optionIndex === undefined) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  if (poll.isClosed || (poll.endsAt && new Date() > new Date(poll.endsAt)))
    return NextResponse.json({ error: "Sondage fermé" }, { status: 403 });

  let userId: string;
  if (poll.isPublic) {
    if (session) {
      userId = session.user.id;
    } else {
      const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous";
      userId = `anon_${ip}`;
    }
  } else {
    if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
    userId = session.user.id;
  }

  const update: Record<string, unknown> = {};
  poll.options.forEach((_: unknown, i: number) => {
    update[`options.${i}.voters`] = poll.options[i].voters.filter((v: string) => v !== userId);
  });
  update[`options.${optionIndex}.voters`] = [...poll.options[optionIndex].voters.filter((v: string) => v !== userId), userId];

  await db.collection("polls").updateOne({ _id: new ObjectId(pollId) }, { $set: update });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { pollId } = await request.json();
  const db = await getDb();
  const poll = await db.collection("polls").findOne({ _id: new ObjectId(pollId) });
  if (!poll) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (poll.createdBy !== session.user.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await db.collection("polls").deleteOne({ _id: new ObjectId(pollId) });
  return NextResponse.json({ success: true });
}
