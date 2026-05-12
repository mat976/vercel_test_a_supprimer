import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const db = await getDb();
  const polls = await db.collection("polls").find().toArray();
  return NextResponse.json(polls);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { question, options } = await request.json();
  if (!question || !options || options.length < 2)
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const db = await getDb();
  const poll = {
    question,
    options: options.map((text: string) => ({ text, voters: [] })),
    createdBy: session.user.id,
    createdByName: session.user.name,
    createdAt: new Date(),
  };
  await db.collection("polls").insertOne(poll);
  return NextResponse.json(poll, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { pollId, optionIndex } = await request.json();
  if (!pollId || optionIndex === undefined)
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const db = await getDb();
  const poll = await db.collection("polls").findOne({ _id: new ObjectId(pollId) });
  if (!poll) return NextResponse.json({ error: "Sondage introuvable" }, { status: 404 });

  const userId = session.user.id;

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
