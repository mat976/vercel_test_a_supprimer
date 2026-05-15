import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  
  // Vérifier isAdmin dans la base (better-auth utilise collection "user")
  const db = await getDb();
  const collections = ["users", "user"];
  
  for (const coll of collections) {
    const user = await db.collection(coll).findOne({ email: session.user.email });
    if (user?.isAdmin) return session;
  }
  
  return null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  
  const { id } = await params;
  const body = await request.json();
  
  const db = await getDb();
  const update: Record<string, unknown> = {};
  
  if (body.sold !== undefined) update.sold = body.sold;
  if (body.name !== undefined) update.name = body.name;
  if (body.description !== undefined) update.description = body.description;
  if (body.price !== undefined) update.price = Number(body.price);
  if (body.image !== undefined) update.image = body.image;
  
  await db.collection("products").updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );
  
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  
  const { id } = await params;
  
  const db = await getDb();
  await db.collection("products").deleteOne({ _id: new ObjectId(id) });
  
  return NextResponse.json({ success: true });
}
