"use client";

import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function CreatePoll({ onClose }: { onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  function addOption() {
    if (options.length < 6) setOptions([...options, ""]);
  }

  function removeOption(i: number) {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  }

  function updateOption(i: number, val: string) {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    setLoading(true);
    await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options: validOptions }),
    });
    setLoading(false);
    onClose();
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">📊 Créer un sondage</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
          <FaTimes size={14} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Ta question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={100}
          required
          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              maxLength={60}
              required
              className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-300 transition">
                <FaTimes size={12} />
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 transition"
          >
            <FaPlus size={10} /> Ajouter une option
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-sm font-semibold rounded-xl transition"
        >
          {loading ? "Création..." : "Publier le sondage 📊"}
        </button>
      </form>
    </div>
  );
}
