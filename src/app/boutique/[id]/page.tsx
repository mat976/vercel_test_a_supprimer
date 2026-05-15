"use client";

import Product from "@/types/Product";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaShoppingCart, FaCheck } from "react-icons/fa";

// Neumorphism pastel styles
const bgColor = "bg-[#f0e6e6]";
const textColor = "text-[#5a4a4a]";
const softShadow = "shadow-[8px_8px_16px_#d1c4c4,-8px_-8px_16px_#ffffff]";
const insetShadow = "shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";
const btnShadow = "shadow-[4px_4px_8px_#d1c4c4,-4px_-4px_8px_#ffffff]";
const btnShadowHover = "hover:shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [inCart, setInCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/boutique");
          return;
        }
        setProduct(data);
        setLoading(false);
      });

    // Vérifier si déjà dans le panier
    const saved = localStorage.getItem("cart");
    if (saved) {
      const cart = JSON.parse(saved);
      setInCart(cart.includes(id));
    }
  }, [id, router]);

  function addToCart() {
    const saved = localStorage.getItem("cart");
    const cart = saved ? JSON.parse(saved) : [];
    if (!cart.includes(id)) {
      cart.push(id);
      localStorage.setItem("cart", JSON.stringify(cart));
      setInCart(true);
    }
  }

  if (loading || !product) {
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
        <div className="flex items-center gap-4">
          <Link href="/boutique" className={`w-10 h-10 flex items-center justify-center rounded-xl ${bgColor} ${btnShadow} ${btnShadowHover} transition-all text-[#8b6b6b]`}>
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-[#8b6b6b]">🕯️ Camille Shop</h1>
        </div>
        <Link href="/panier" className={`flex items-center gap-2 px-4 py-2 rounded-xl ${bgColor} ${btnShadow} ${btnShadowHover} transition-all text-[#5a4a4a]`}>
          <FaShoppingCart className="text-[#a08080]" />
          <span>Panier</span>
        </Link>
      </header>

      {/* Contenu - Neumorphism */}
      <main className="p-6 max-w-4xl mx-auto">
        <div className={`rounded-3xl overflow-hidden ${bgColor} ${softShadow}`}>
          <div className={`aspect-video relative m-4 mb-0 rounded-2xl ${bgColor} ${insetShadow}`}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover p-2 rounded-2xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🕯️</div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#5a4a4a]">{product.name}</h2>
                <p className="text-[#a08080] text-xl font-bold mt-1">
                  {(product.price / 100).toFixed(2)} €
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm shrink-0 ${bgColor} shadow-[2px_2px_4px_#d1c4c4,-2px_-2px_4px_#ffffff] text-[#8b6b6b]`}>
                ✨ Pièce unique
              </span>
            </div>

            <p className="text-[#8b6b6b] text-sm mt-2">Réf. {product.stockId}</p>

            <p className="text-[#6a5a5a] mt-4 whitespace-pre-line leading-relaxed">
              {product.description || "Aucune description disponible."}
            </p>

            <div className="mt-6 flex gap-3">
              {inCart ? (
                <button
                  disabled
                  className={`flex-1 px-6 py-3 rounded-xl flex items-center justify-center gap-2 ${bgColor} ${softShadow} text-[#80c0a0] cursor-default`}
                >
                  <FaCheck />
                  Dans le panier
                </button>
              ) : (
                <button
                  onClick={addToCart}
                  className={`flex-1 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all bg-[#a5d4c8] shadow-[4px_4px_8px_#84b0a5,-4px_-4px_8px_#c6f8ec] hover:shadow-[inset_4px_4px_8px_#84b0a5,inset_-4px_-4px_8px_#c6f8ec] text-[#5a4a4a]`}
                >
                  <FaShoppingCart />
                  Ajouter au panier
                </button>
              )}

              <Link
                href="/panier"
                className={`px-6 py-3 rounded-xl transition-all ${bgColor} ${btnShadow} ${btnShadowHover} text-[#5a4a4a]`}
              >
                Voir le panier →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
