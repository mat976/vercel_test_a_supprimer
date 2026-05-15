import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Récupérer la session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier isAdmin dans la base
    const db = await getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
