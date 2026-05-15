import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const db = await getDb();
  const products = await db
    .collection("products")
    .find({ sold: false })
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(products);
}
