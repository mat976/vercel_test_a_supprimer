import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Route DEV uniquement - à supprimer en production
export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  
  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }
  
  const db = await getDb();
  
  // Mettre à jour le document utilisateur pour ajouter isAdmin
  // Note: better-auth gère les users différemment, on va vérifier la structure
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  
  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }
  
  // Mettre à jour dans MongoDB
  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { isAdmin: true } }
  );
  
  return NextResponse.json({ success: true, message: "Utilisateur promu admin" });
}
