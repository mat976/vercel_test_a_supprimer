import { getDb } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Route DEV uniquement - ajoute un produit de test
export async function POST(request: NextRequest) {
  const db = await getDb();
  
  const product = {
    name: "Bougie Vanille Coco",
    description: "Une bougie artisanale aux senteurs vanille et noix de coco, parfaite pour une ambiance cozy.",
    price: 2500, // 25.00€ en centimes
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400",
    stockId: "BOUGIE-001",
    sold: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await db.collection("products").insertOne(product);
  
  return NextResponse.json({ 
    success: true, 
    productId: result.insertedId,
    message: "Produit de test créé" 
  });
}

// GET pour lister les produits
export async function GET() {
  const db = await getDb();
  const products = await db.collection("products").find({}).toArray();
  return NextResponse.json(products);
}
