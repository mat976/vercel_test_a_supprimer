import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Route DEV uniquement - crée ou promeut un admin
export async function POST() {
  const db = await getDb();
  
  // Créer un utilisateur admin s'il n'existe pas
  const adminUser = {
    email: "admin@test.com",
    name: "AdminTest",
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Essayer de mettre à jour d'abord
  const result = await db.collection("users").updateOne(
    { email: "admin@test.com" },
    { $set: { isAdmin: true }, $setOnInsert: adminUser },
    { upsert: true }
  );
  
  return NextResponse.json({ 
    success: true, 
    message: "Admin créé/mis à jour",
    upserted: result.upsertedCount,
    modified: result.modifiedCount 
  });
}

// GET pour debug - lister les utilisateurs
export async function GET() {
  const db = await getDb();
  const users = await db.collection("users").find({}).limit(5).toArray();
  const accounts = await db.collection("accounts").find({}).limit(5).toArray();
  return NextResponse.json({ users, accounts, userCount: users.length, accountCount: accounts.length });
}
