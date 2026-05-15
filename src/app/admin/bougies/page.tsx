"use client";

import Product from "@/types/Product";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaCheck, FaTimes, FaTrash, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Neumorphism pastel styles
const bgColor = "bg-[#f0e6e6]";
const textColor = "text-[#5a4a4a]";
const softShadow = "shadow-[8px_8px_16px_#d1c4c4,-8px_-8px_16px_#ffffff]";
const insetShadow = "shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";
const btnShadow = "shadow-[4px_4px_8px_#d1c4c4,-4px_-4px_8px_#ffffff]";
const btnShadowHover = "hover:shadow-[inset_4px_4px_8px_#d1c4c4,inset_-4px_-4px_8px_#ffffff]";

export default function AdminBougiesPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<"add" | "inventory">("inventory");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "available" | "sold">("all");

  // Formulaire d'ajout
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    stockId: "",
  });

  useEffect(() => {
    checkAdminAndFetch();
  }, [session, router]);

  async function checkAdminAndFetch() {
    if (!session) {
      setLoading(false);
      return;
    }
    
    // Vérifier le statut admin via l'API
    const adminCheck = await fetch("/api/admin/check");
    if (!adminCheck.ok) {
      router.push("/chat");
      return;
    }
    
    fetchProducts();
  }

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      setProducts(await res.json());
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceInCents = Math.round(parseFloat(form.price) * 100);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: priceInCents,
        image: form.image,
        stockId: form.stockId,
      }),
    });

    if (res.ok) {
      setForm({ name: "", description: "", price: "", image: "", stockId: "" });
      fetchProducts();
      setTab("inventory");
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de l'ajout");
    }
  }

  async function toggleSold(id: string, currentStatus: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sold: !currentStatus }),
    });
    fetchProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  const filteredProducts = products.filter((p) => {
    if (filter === "available") return !p.sold;
    if (filter === "sold") return p.sold;
    return true;
  });

  if (!session || loading) {
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
          <h1 className="text-xl font-bold text-[#8b6b6b]">🔧 Admin - Camille Shop</h1>
        </div>
      </header>

      {/* Tabs - Neumorphism */}
      <div className={`flex p-2 ${bgColor}`}>
        <button
          onClick={() => setTab("inventory")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all ${
            tab === "inventory" 
              ? `${bgColor} ${btnShadow} text-[#8b6b6b]` 
              : `${bgColor} ${btnShadowHover} text-[#a08080]`
          }`}
        >
          <FaEdit />
          Inventaire ({products.length})
        </button>
        <button
          onClick={() => setTab("add")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all ml-2 ${
            tab === "add" 
              ? `${bgColor} ${btnShadow} text-[#8b6b6b]` 
              : `${bgColor} ${btnShadowHover} text-[#a08080]`
          }`}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>

      {/* Contenu - Neumorphism */}
      <main className="p-6 max-w-4xl mx-auto">
        {tab === "add" ? (
          <form onSubmit={handleSubmit} className={`rounded-3xl p-6 space-y-4 ${bgColor} ${softShadow}`}>
            <h2 className="text-xl font-semibold mb-4 text-[#8b6b6b]">Nouvelle Bougie</h2>

            <div>
              <label className="block text-sm text-[#8b6b6b] mb-1">Nom *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full rounded-xl px-4 py-2 text-[#5a4a4a] placeholder-[#a08080] focus:outline-none ${bgColor} ${insetShadow}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#8b6b6b] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={`w-full rounded-xl px-4 py-2 text-[#5a4a4a] placeholder-[#a08080] focus:outline-none ${bgColor} ${insetShadow}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8b6b6b] mb-1">Prix (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={`w-full rounded-xl px-4 py-2 text-[#5a4a4a] placeholder-[#a08080] focus:outline-none ${bgColor} ${insetShadow}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b6b6b] mb-1">Identifiant Stock *</label>
                <input
                  type="text"
                  value={form.stockId}
                  onChange={(e) => setForm({ ...form, stockId: e.target.value })}
                  className={`w-full rounded-xl px-4 py-2 text-[#5a4a4a] placeholder-[#a08080] focus:outline-none ${bgColor} ${insetShadow}`}
                  placeholder="ex: BOUGIE-2024-001"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#8b6b6b] mb-1">URL Image</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={`w-full rounded-xl px-4 py-2 text-[#5a4a4a] placeholder-[#a08080] focus:outline-none ${bgColor} ${insetShadow}`}
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold transition-all bg-[#a5d4c8] shadow-[4px_4px_8px_#84b0a5,-4px_-4px_8px_#c6f8ec] hover:shadow-[inset_4px_4px_8px_#84b0a5,inset_-4px_-4px_8px_#c6f8ec] text-[#5a4a4a]`}
            >
              Ajouter au catalogue
            </button>
          </form>
        ) : (
          <>
            {/* Filtres - Neumorphism */}
            <div className="flex gap-2 mb-4">
              {(["all", "available", "sold"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    filter === f
                      ? `${bgColor} ${btnShadow} text-[#8b6b6b]`
                      : `${bgColor} ${btnShadowHover} text-[#a08080]`
                  }`}
                >
                  {f === "all" && "Tous"}
                  {f === "available" && "Disponibles"}
                  {f === "sold" && "Vendus"}
                </button>
              ))}
            </div>

            {/* Liste - Neumorphism */}
            <div className="space-y-4">
              {filteredProducts.map((p) => (
                <div
                  key={p._id}
                  className={`flex items-center gap-4 rounded-2xl p-4 ${bgColor} ${softShadow}`}
                >
                  <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 ${bgColor} ${insetShadow}`}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover p-1 rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🕯️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#5a4a4a] truncate">{p.name}</h3>
                    <p className="text-[#a08080] text-sm">{(p.price / 100).toFixed(2)} €</p>
                    <p className="text-[#8b6b6b] text-xs">{p.stockId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.sold ? (
                      <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${bgColor} shadow-[2px_2px_4px_#d1c4c4,-2px_-2px_4px_#ffffff] text-[#c08080]`}>
                        <FaTimes />
                        Vendu
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${bgColor} shadow-[2px_2px_4px_#d1c4c4,-2px_-2px_4px_#ffffff] text-[#80c0a0]`}>
                        <FaCheck />
                        Dispo
                      </span>
                    )}
                    <button
                      onClick={() => toggleSold(p._id, p.sold)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${bgColor} ${btnShadow} ${btnShadowHover} text-[#8b6b6b]`}
                      title="Changer statut"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${bgColor} ${btnShadow} ${btnShadowHover} text-[#c08080]`}
                      title="Supprimer"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
