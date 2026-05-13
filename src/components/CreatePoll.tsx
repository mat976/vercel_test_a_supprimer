"use client";

import { useState } from "react";
import { FaPlus, FaTimes, FaCopy, FaCheck } from "react-icons/fa";
import GifPicker from "./GifPicker";

const DURATIONS = [
  { label: "Sans limite", value: 0 },
  { label: "15 minutes", value: 15 * 60 * 1000 },
  { label: "1 heure", value: 60 * 60 * 1000 },
  { label: "6 heures", value: 6 * 60 * 60 * 1000 },
  { label: "24 heures", value: 24 * 60 * 60 * 1000 },
  { label: "7 jours", value: 7 * 24 * 60 * 60 * 1000 },
];

interface OptionState { text: string; gif: string }

export default function CreatePoll({ onClose }: { onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<OptionState[]>([{ text: "", gif: "" }, { text: "", gif: "" }]);
  const [isPublic, setIsPublic] = useState(false);
  const [slug, setSlug] = useState("");
  const [durationMs, setDurationMs] = useState(0);
  const [gifPickerFor, setGifPickerFor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/poll/${createdSlug || createdId}`
    : "";

  function addOption() {
    if (options.length < 6) setOptions([...options, { text: "", gif: "" }]);
  }

  function removeOption(i: number) {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  }

  function updateOptionText(i: number, val: string) {
    const updated = [...options];
    updated[i] = { ...updated[i], text: val };
    setOptions(updated);
  }

  function setOptionGif(i: number, url: string) {
    const updated = [...options];
    updated[i] = { ...updated[i], gif: url };
    setOptions(updated);
    setGifPickerFor(null);
  }

  function clearOptionGif(i: number) {
    const updated = [...options];
    updated[i] = { ...updated[i], gif: "" };
    setOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const validOptions = options.filter((o) => o.text.trim());
    if (!question.trim() || validOptions.length < 2) {
      setError("Il faut au moins une question et 2 options.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        options: validOptions.map((o) => ({ text: o.text, gif: o.gif || undefined })),
        isPublic,
        slug: slug.trim() || undefined,
        durationMs: durationMs || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Erreur lors de la création"); return; }
    setCreatedId(String(data._id));
    setCreatedSlug(data.slug || null);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#1a1740] to-[#0f0c29] border border-white/15 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">📊 Créer un sondage</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><FaTimes size={16} /></button>
        </div>

        {createdId ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="text-5xl">✅</div>
            <p className="text-white font-semibold text-lg">Sondage créé !</p>
            <p className="text-gray-400 text-sm">Partage ce lien :</p>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 w-full">
              <span className="text-indigo-300 text-sm truncate flex-1">{shareUrl}</span>
              <button onClick={copyLink} className="text-white shrink-0">
                {copied ? <FaCheck size={14} className="text-green-400" /> : <FaCopy size={14} />}
              </button>
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && <p className="text-red-400 text-xs bg-red-900/30 border border-red-500 rounded-lg px-3 py-2">{error}</p>}

            <input
              type="text" placeholder="Ta question..." value={question}
              onChange={(e) => setQuestion(e.target.value)} maxLength={120} required
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text" placeholder={`Option ${i + 1}`} value={opt.text}
                      onChange={(e) => updateOptionText(i, e.target.value)} maxLength={60}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button type="button" onClick={() => setGifPickerFor(gifPickerFor === i ? null : i)}
                      className={`text-xs px-2 py-2 rounded-lg transition ${opt.gif ? "bg-indigo-600" : "bg-white/10 hover:bg-indigo-600"}`} title="GIF">
                      🎞️
                    </button>
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-300 transition">
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                  {opt.gif && (
                    <div className="relative w-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={opt.gif} alt="gif" className="w-24 h-16 object-cover rounded-lg" />
                      <button type="button" onClick={() => clearOptionGif(i)}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white">
                        <FaTimes size={8} />
                      </button>
                    </div>
                  )}
                  {gifPickerFor === i && <div className="mt-1"><GifPicker onSelect={(url) => setOptionGif(i, url)} /></div>}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button type="button" onClick={addOption} className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 transition">
                <FaPlus size={10} /> Ajouter une option
              </button>
            )}

            <div className="flex gap-3 mt-1">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">⏱ Durée</label>
                <select value={durationMs} onChange={(e) => setDurationMs(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {DURATIONS.map((d) => <option key={d.value} value={d.value} className="bg-gray-800">{d.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">🔒 Visibilité</label>
                <button type="button" onClick={() => setIsPublic((v) => !v)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-medium transition ${isPublic ? "bg-green-600/30 border-green-500 text-green-300" : "bg-white/10 border-white/10 text-gray-300"}`}>
                  {isPublic ? "🔓 Public" : "🔒 Privé"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">🔗 Slug personnalisé (optionnel)</label>
              <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                <span className="text-gray-500 text-sm">/poll/</span>
                <input type="text" placeholder="mon-sondage" value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} maxLength={40}
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold rounded-xl transition">
              {loading ? "Création..." : "Publier le sondage 📊"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
