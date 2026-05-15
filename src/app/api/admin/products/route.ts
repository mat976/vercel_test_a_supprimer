import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
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

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  
  const db = await getDb();
  const products = await db
    .collection("products")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  
  const { name, description, price, image, stockId } = await request.json();
  
  if (!name || !price || !stockId) {
    return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
  }
  
  const db = await getDb();
  
  // Vérifier unicité du stockId
  const existing = await db.collection("products").findOne({ stockId });
  if (existing) {
    return NextResponse.json({ error: "Cet identifiant de stock existe déjà" }, { status: 409 });
  }
  
  const product = {
    name,
    description: description || "",
    price: Number(price),
    image: image || "",
    stockId,
    sold: false,
    createdAt: new Date(),
  };
  
  const result = await db.collection("products").insertOne(product);
  return NextResponse.json({ ...product, _id: result.insertedId }, { status: 201 });
}
