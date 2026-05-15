"use client";

import Product from "@/types/Product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaTrash, FaLock, FaCreditCard } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function PanierPage() {
  const router = useRouter();
  const [cart, setCart] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    const saved = localStorage.getItem("cart");
    if (saved) {
      const ids = JSON.parse(saved);
      setCart(ids);
      fetchProducts(ids);
    } else {
      setLoading(false);
    }
  }

  async function fetchProducts(ids: string[]) {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Récupérer tous les produits disponibles
    const res = await fetch("/api/products");
    const allProducts = await res.json();
    
    // Filtrer ceux qui sont dans le panier
    const cartProducts = allProducts.filter((p: Product) => ids.includes(p._id));
    setProducts(cartProducts);
    setLoading(false);
  }

  function removeFromCart(id: string) {
    const newCart = cart.filter((item) => item !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    fetchProducts(newCart);
  }

  async function checkout() {
    if (!session) {
      router.push("/login?redirect=/panier");
      return;
    }

    setCheckingOut(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: cart }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Erreur lors de la création du paiement");
      setCheckingOut(false);
    }
  }

  const total = products.reduce((sum, p) => sum + p.price, 0);

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
        <div className="flex items-center gap-4">
          <Link href="/boutique" className="text-gray-400 hover:text-white transition">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">🛒 Mon Panier</h1>
        </div>
      </header>

      {/* Contenu */}
      <main className="p-6 max-w-2xl mx-auto">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Votre panier est vide.</p>
            <Link
              href="/boutique"
              className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition"
            >
              Découvrir les bougies →
            </Link>
          </div>
        ) : (
          <>
            {/* Liste des produits */}
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🕯️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-indigo-300 font-bold">{(product.price / 100).toFixed(2)} €</p>
                    <p className="text-gray-500 text-xs">Réf. {product.stockId}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="text-red-400 hover:text-red-300 p-2 transition"
                    title="Retirer"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* Récapitulatif */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-6">
              <div className="flex justify-between items-center text-lg mb-4">
                <span>Total ({products.length} article{products.length > 1 ? "s" : ""})</span>
                <span className="font-bold text-xl">{(total / 100).toFixed(2)} €</span>
              </div>

              {!session && (
                <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm flex items-center gap-2">
                  <FaLock />
                  Connectez-vous pour finaliser votre achat
                </div>
              )}

              <button
                onClick={checkout}
                disabled={checkingOut || products.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold"
              >
                {checkingOut ? (
                  "Redirection vers Stripe..."
                ) : (
                  <>
                    <FaCreditCard />
                    {session ? "Procéder au paiement" : "Se connecter et payer"}
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-xs mt-3">
                Paiement sécurisé via Stripe 🔒
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
