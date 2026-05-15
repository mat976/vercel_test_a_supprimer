import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  
  let product = null;
  if (ObjectId.isValid(id)) {
    product = await db.collection("products").findOne({ _id: new ObjectId(id) });
  }
  
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }
  
  return NextResponse.json(product);
}
