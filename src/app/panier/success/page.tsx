"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaShoppingBag } from "react-icons/fa";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Vider le panier après achat réussi
    localStorage.removeItem("cart");

    // Vérifier la session (optionnel, pour le feedback)
    if (sessionId) {
      // On pourrait appeler une API pour vérifier, mais le webhook s'en charge
      setVerified(true);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-green-400 text-4xl" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
        <p className="text-gray-300 mb-6">
          Merci pour votre commande. Vos bougies artisanales vous seront expédiées prochainement.
        </p>

        {verified && (
          <p className="text-gray-500 text-sm mb-6">
            Numéro de transaction : {sessionId?.slice(-12)}
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/boutique"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition"
          >
            <FaShoppingBag />
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
