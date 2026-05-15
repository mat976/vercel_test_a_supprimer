"use client";

import Product from "@/types/Product";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaShoppingCart, FaCheck } from "react-icons/fa";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/boutique" className="text-gray-400 hover:text-white transition">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">🕯️ {product.name}</h1>
        </div>
        <Link href="/panier" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition">
          <FaShoppingCart />
          <span>Panier</span>
        </Link>
      </header>

      {/* Contenu */}
      <main className="p-6 max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden">
          <div className="aspect-video bg-white/5 relative">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🕯️</div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <p className="text-indigo-300 text-xl font-bold mt-1">
                  {(product.price / 100).toFixed(2)} €
                </p>
              </div>
              <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm shrink-0">
                Pièce unique
              </span>
            </div>

            <p className="text-gray-400 text-sm mt-1">Réf. {product.stockId}</p>

            <p className="text-gray-300 mt-4 whitespace-pre-line">
              {product.description || "Aucune description disponible."}
            </p>

            <div className="mt-6 flex gap-3">
              {inCart ? (
                <button
                  disabled
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-default"
                >
                  <FaCheck />
                  Dans le panier
                </button>
              ) : (
                <button
                  onClick={addToCart}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <FaShoppingCart />
                  Ajouter au panier
                </button>
              )}

              <Link
                href="/panier"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition"
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
