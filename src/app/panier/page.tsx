"use client";

import Product from "@/types/Product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaTrash, FaCreditCard } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

// Neumorphism pastel styles
const bgColor = "bg-[#f0e6e6]";
const textColor = "text-[#5a4a4a]";
const softShadow = "shadow-[8px_8px_16px_#d1c4c4,-8px_-8px_16px_#ffffff]";
const insetShadow = "shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";
const btnShadow = "shadow-[4px_4px_8px_#d1c4c4,-4px_-4px_8px_#ffffff]";
const btnShadowHover = "hover:shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";

export default function PanierPage() {
  const [cart, setCart] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
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
    
    // Filtrer ceux qui sont dans le panier ET existent encore
    const cartProducts = allProducts.filter((p: Product) => ids.includes(p._id));
    
    // Nettoyer le panier des produits qui n'existent plus
    const validIds = cartProducts.map((p: Product) => p._id);
    if (validIds.length !== ids.length) {
      setCart(validIds);
      localStorage.setItem("cart", JSON.stringify(validIds));
    }
    
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
    // Pour les guests, vérifier l'email
    if (!session) {
      if (!guestEmail || !guestEmail.includes('@')) {
        alert("Veuillez entrer une adresse email valide pour recevoir la confirmation.");
        return;
      }
    }

    setCheckingOut(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productIds: cart,
        email: session ? undefined : guestEmail 
      }),
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
          <h1 className="text-xl font-bold text-[#8b6b6b]">🛒 Mon Panier</h1>
        </div>
      </header>

      {/* Contenu - Neumorphism */}
      <main className="p-6 max-w-2xl mx-auto">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-block p-8 rounded-3xl ${bgColor} ${softShadow}`}>
              <p className="text-[#8b6b6b] text-lg">Votre panier est vide.</p>
              <Link
                href="/boutique"
                className={`inline-block mt-4 px-6 py-3 rounded-xl ${bgColor} ${btnShadow} ${btnShadowHover} transition-all text-[#5a4a4a]`}
              >
                Découvrir les bougies →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Liste des produits - Neumorphism */}
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`flex items-center gap-4 rounded-2xl p-4 ${bgColor} ${softShadow}`}
                >
                  <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 ${bgColor} ${insetShadow}`}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover p-1 rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🕯️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#5a4a4a] truncate">{product.name}</h3>
                    <p className="text-[#a08080] font-bold">{(product.price / 100).toFixed(2)} €</p>
                    <p className="text-[#8b6b6b] text-xs">Réf. {product.stockId}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-[#c08080] ${bgColor} ${btnShadow} ${btnShadowHover} transition-all`}
                    title="Retirer"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* Récapitulatif - Neumorphism */}
            <div className={`mt-6 rounded-3xl p-6 ${bgColor} ${softShadow}`}>
              <div className="flex justify-between items-center text-lg mb-4 text-[#5a4a4a]">
                <span>Total ({products.length} article{products.length > 1 ? "s" : ""})</span>
                <span className="font-bold text-2xl text-[#8b6b6b]">{(total / 100).toFixed(2)} €</span>
              </div>

              {/* Email pour guests */}
              {!session && (
                <div className="mb-4">
                  <label className="block text-sm text-[#8b6b6b] mb-2">
                    📧 Email pour la confirmation de commande *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className={`w-full rounded-xl px-4 py-3 text-[#5a4a4a] placeholder-[#a08080] focus:outline-none ${bgColor} ${insetShadow}`}
                    required
                  />
                  <p className="text-xs text-[#a08080] mt-1">
                    Votre reçu et confirmation seront envoyés à cette adresse.
                  </p>
                </div>
              )}

              <button
                onClick={checkout}
                disabled={checkingOut || products.length === 0 || (!session && !guestEmail)}
                className={`w-full px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold ${(checkingOut || (!session && !guestEmail)) ? 'opacity-50 cursor-not-allowed' : ''} bg-[#a5d4c8] shadow-[4px_4px_8px_#84b0a5,-4px_-4px_8px_#c6f8ec] hover:shadow-[inset_4px_4px_8px_#84b0a5,inset_-4px_-4px_8px_#c6f8ec] text-[#5a4a4a]`}
              >
                {checkingOut ? (
                  "Redirection vers Stripe..."
                ) : (
                  <>
                    <FaCreditCard />
                    {session ? "Procéder au paiement" : "Payer sans compte"}
                  </>
                )}
              </button>

              <p className="text-center text-[#a08080] text-xs mt-3">
                Paiement sécurisé via Stripe 🔒
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
