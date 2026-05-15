import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }
  
  const { productIds } = await request.json();
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }
  
  const db = await getDb();
  
  // Vérifier que les produits existent et sont disponibles
  const products = await db
    .collection("products")
    .find({ _id: { $in: productIds.map((id: string) => new ObjectId(id)) }, sold: false })
    .toArray();
  
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Certains produits sont indisponibles" }, { status: 400 });
  }
  
  // Créer la session Stripe
  const lineItems = products.map((p) => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: p.name,
        description: p.description || undefined,
        images: p.image ? [p.image] : undefined,
      },
      unit_amount: p.price, // prix en centimes
    },
    quantity: 1,
  }));
  
  // Détecter l'URL de base depuis les headers (pour supporter accès distant)
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;
  
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${baseUrl}/panier/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/panier`,
    metadata: {
      productIds: productIds.join(","),
      userId: session.user.id,
    },
  });
  
  return NextResponse.json({ url: checkoutSession.url });
}
