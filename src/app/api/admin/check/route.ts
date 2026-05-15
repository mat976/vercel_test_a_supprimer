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

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier isAdmin dans la base - chercher par ID ou email
    const db = await getDb();
    let user = null;
    const collections = ["users", "user"]; // better-auth utilise "user" (singulier)
    
    // Essayer par ID dans toutes les collections
    if (session.user.id) {
      for (const coll of collections) {
        try {
          user = await db.collection(coll).findOne({
            _id: new ObjectId(session.user.id),
          });
          if (user) break;
        } catch {
          // Continue
        }
      }
    }
    
    // Si pas trouvé, chercher par email dans toutes les collections
    if (!user && session.user.email) {
      for (const coll of collections) {
        user = await db.collection(coll).findOne({
          email: session.user.email,
        });
        if (user) break;
      }
    }

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
