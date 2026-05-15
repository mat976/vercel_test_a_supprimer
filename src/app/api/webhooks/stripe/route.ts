import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = (await headers()).get("stripe-signature")!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur webhook";
    console.error("Webhook error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
  
  // Gérer l'événement checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const productIds = session.metadata?.productIds;
    
    if (productIds) {
      const ids = productIds.split(",");
      const db = await getDb();
      
      // Marquer les produits comme vendus
      await db.collection("products").updateMany(
        { _id: { $in: ids.map((id) => new ObjectId(id)) } },
        { $set: { sold: true } }
      );
      
      console.log(`Produits marqués comme vendus: ${ids.join(", ")}`);
    }
  }
  
  return NextResponse.json({ received: true });
}
