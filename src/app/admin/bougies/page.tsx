"use client";

import Product from "@/types/Product";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaCheck, FaTimes, FaTrash, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";

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
    if (session && !(session.user as { isAdmin?: boolean }).isAdmin) {
      router.push("/chat");
      return;
    }
    fetchProducts();
  }, [session, router]);

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
          <Link href="/chat" className="text-gray-400 hover:text-white transition">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">🔧 Admin - Gestion des Bougies</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setTab("inventory")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 transition ${
            tab === "inventory" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <FaEdit />
          Inventaire ({products.length})
        </button>
        <button
          onClick={() => setTab("add")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 transition ${
            tab === "add" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>

      {/* Contenu */}
      <main className="p-6 max-w-4xl mx-auto">
        {tab === "add" ? (
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Nouvelle Bougie</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prix (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Identifiant Stock *</label>
                <input
                  type="text"
                  value={form.stockId}
                  onChange={(e) => setForm({ ...form, stockId: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ex: BOUGIE-2024-001"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">URL Image</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition"
            >
              Ajouter au catalogue
            </button>
          </form>
        ) : (
          <>
            {/* Filtres */}
            <div className="flex gap-2 mb-4">
              {(["all", "available", "sold"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    filter === f
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {f === "all" && "Tous"}
                  {f === "available" && "Disponibles"}
                  {f === "sold" && "Vendus"}
                </button>
              ))}
            </div>

            {/* Liste */}
            <div className="space-y-3">
              {filteredProducts.map((p) => (
                <div
                  key={p._id}
                  className={`flex items-center gap-4 bg-white/10 backdrop-blur-sm border rounded-xl p-4 ${
                    p.sold ? "border-red-500/30" : "border-white/15"
                  }`}
                >
                  <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🕯️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-indigo-300 text-sm">{(p.price / 100).toFixed(2)} €</p>
                    <p className="text-gray-500 text-xs">{p.stockId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.sold ? (
                      <span className="text-red-400 text-sm flex items-center gap-1">
                        <FaTimes />
                        Vendu
                      </span>
                    ) : (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <FaCheck />
                        Dispo
                      </span>
                    )}
                    <button
                      onClick={() => toggleSold(p._id, p.sold)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                      title="Changer statut"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
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
