"use client";

import Product from "@/types/Product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaUser, FaCog } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

export default function BoutiquePage() {
  const { data: session } = authClient.useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/check")
        .then(r => r.ok ? setIsAdmin(true) : setIsAdmin(false))
        .catch(() => setIsAdmin(false));
    }
  }, [session]);

  useEffect(() => {
    // Charger les produits
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
        
        // Charger le panier depuis localStorage et nettoyer les produits supprimés
        const saved = localStorage.getItem("cart");
        if (saved) {
          const cartIds = JSON.parse(saved);
          // Vérifier que les produits du panier existent encore
          const validIds = cartIds.filter((id: string) => 
            data.some((p: Product) => p._id === id)
          );
          if (validIds.length !== cartIds.length) {
            localStorage.setItem("cart", JSON.stringify(validIds));
          }
          setCart(validIds);
        }
      });
  }, []);

  const cartCount = cart.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-bold">🕯️ Boutique Bougies</h1>
        <div className="flex items-center gap-3">
          <Link href="/panier" className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition">
            <FaShoppingCart />
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link href="/admin/bougies" className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl transition">
              <FaCog />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          {session ? (
            <Link href="/chat" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition">
              <FaUser />
              <span className="hidden sm:inline">{session.user.name}</span>
            </Link>
          ) : (
            <Link href="/login?redirect=/boutique" className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-xl transition">
              <FaUser />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </header>

      {/* Catalogue */}
      <main className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Aucune bougie disponible pour le moment.</p>
            <p className="text-gray-500 text-sm mt-2">Revenez plus tard !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/boutique/${product._id}`}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden hover:bg-white/15 transition group"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🕯️</div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg truncate">{product.name}</h2>
                  <p className="text-indigo-300 font-bold mt-1">{(product.price / 100).toFixed(2)} €</p>
                  <span className="inline-block mt-2 text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                    Pièce unique
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
