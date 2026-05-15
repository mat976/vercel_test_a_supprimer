"use client";

import Product from "@/types/Product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaUser, FaCog } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

// Neumorphism pastel styles
const bgColor = "bg-[#f0e6e6]";
const textColor = "text-[#5a4a4a]";
const softShadow = "shadow-[8px_8px_16px_#d1c4c4,-8px_-8px_16px_#ffffff]";
const insetShadow = "shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";
const btnShadow = "shadow-[4px_4px_8px_#d1c4c4,-4px_-4px_8px_#ffffff]";
const btnShadowHover = "hover:shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";

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
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className={`w-16 h-16 rounded-full ${softShadow} flex items-center justify-center`}>
          <div className="w-8 h-8 border-4 border-[#d4a5a5] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      {/* Header - Neumorphism */}
      <header className={`flex items-center justify-between px-6 py-5 ${bgColor} shadow-[4px_4px_8px_#d1c4c4,-4px_-4px_8px_#ffffff]`}>
        <h1 className="text-xl font-bold text-[#8b6b6b]">🕯️ Camille Shop</h1>
        <div className="flex items-center gap-3">
          <Link href="/panier" className={`relative flex items-center gap-2 px-4 py-2 rounded-xl ${bgColor} ${btnShadow} ${btnShadowHover} transition-all`}>
            <FaShoppingCart className="text-[#a08080]" />
            <span className="text-[#5a4a4a]">Panier</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#e8a5a5] text-white text-xs flex items-center justify-center shadow-[2px_2px_4px_#c08080]">
                {cartCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link href="/admin/bougies" className={`flex items-center gap-2 px-4 py-2 rounded-xl ${bgColor} ${btnShadow} ${btnShadowHover} transition-all`}>
              <FaCog className="text-[#a08080]" />
              <span className="hidden sm:inline text-[#5a4a4a]">Admin</span>
            </Link>
          )}
          {session ? (
            <Link href="/chat" className={`flex items-center gap-2 px-4 py-2 rounded-xl ${bgColor} ${btnShadow} ${btnShadowHover} transition-all`}>
              <FaUser className="text-[#a08080]" />
              <span className="hidden sm:inline text-[#5a4a4a]">{session.user.name}</span>
            </Link>
          ) : (
            <Link href="/login?redirect=/boutique" className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8c4a8] shadow-[4px_4px_8px_#c4a080,-4px_-4px_8px_#ffe8d0] hover:shadow-[inset_4px_4px_8px_#c4a080,inset_-4px_-4px_8px_#ffe8d0] transition-all text-[#5a4a4a]`}>
              <FaUser />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </header>

      {/* Catalogue - Neumorphism */}
      <main className="p-6 max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-block p-8 rounded-3xl ${bgColor} ${softShadow}`}>
              <p className="text-[#8b6b6b] text-lg">Aucune bougie disponible pour le moment.</p>
              <p className="text-[#a08080] text-sm mt-2">Revenez plus tard !</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/boutique/${product._id}`}
                className={`group rounded-3xl ${bgColor} ${softShadow} hover:shadow-[12px_12px_24px_#d1c4c4,-12px_-12px_24px_#ffffff] transition-all overflow-hidden`}
              >
                <div className={`aspect-square relative overflow-hidden rounded-t-3xl m-4 mb-0 ${bgColor} ${insetShadow}`}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-2xl p-2 group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🕯️</div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-lg text-[#5a4a4a] truncate">{product.name}</h2>
                  <p className="text-[#a08080] font-bold mt-2 text-xl">{(product.price / 100).toFixed(2)} €</p>
                  <span className={`inline-block mt-3 text-xs px-4 py-2 rounded-full ${bgColor} shadow-[2px_2px_4px_#d1c4c4,-2px_-2px_4px_#ffffff] text-[#8b6b6b]`}>
                    ✨ Pièce unique
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
