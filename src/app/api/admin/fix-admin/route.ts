import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Route DEV - promouvoir un utilisateur en admin via son email
export async function POST(request: Request) {
  const { email } = await request.json();
  
  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }
  
  const db = await getDb();
  
  // Chercher dans toutes les collections possibles
  const collections = ["users", "accounts", "user"];
  let found = false;
  
  for (const coll of collections) {
    const result = await db.collection(coll).updateOne(
      { email: email },
      { $set: { isAdmin: true, updatedAt: new Date() } }
    );
    if (result.matchedCount > 0) {
      found = true;
      return NextResponse.json({ 
        success: true, 
        message: `Admin mis à jour dans ${coll}`,
        collection: coll
      });
    }
  }
  
  // Si pas trouvé, créer un utilisateur minimal
  if (!found) {
    const result = await db.collection("users").insertOne({
      email: email,
      name: email.split("@")[0],
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ 
      success: true, 
      message: "Utilisateur admin créé",
      id: result.insertedId
    });
  }
  
  return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
}

// GET pour lister toutes les collections et leur contenu
export async function GET() {
  const db = await getDb();
  const collections = await db.listCollections().toArray();
  const result: Record<string, any> = {};
  
  for (const coll of collections) {
    const docs = await db.collection(coll.name).find({}).limit(3).toArray();
    result[coll.name] = {
      count: await db.collection(coll.name).countDocuments(),
      sample: docs.map(d => ({ id: d._id?.toString(), email: d.email, name: d.name, isAdmin: d.isAdmin }))
    };
  }
  
  return NextResponse.json(result);
}
