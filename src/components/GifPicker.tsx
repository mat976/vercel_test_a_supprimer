"use client";

import { useEffect, useRef, useState } from "react";

const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? "dc6zaTOxFJmzC";

interface GifResult {
  id: string;
  images: { fixed_height_small: { url: string } };
  url: string;
  title: string;
}

export default function GifPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function search(q: string) {
    setLoading(true);
    const endpoint = q.trim()
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=12&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=12&rating=g`;
    const res = await fetch(endpoint);
    const data = await res.json();
    setGifs(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    search("");
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  }

  return (
    <div className="bg-gray-700 rounded-xl p-3 mb-2 w-full">
      <input
        type="text"
        placeholder="🔍 Rechercher un GIF..."
        value={query}
        onChange={handleChange}
        className="w-full px-3 py-2 mb-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {loading ? (
        <p className="text-center text-gray-400 text-xs py-2">Chargement...</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              onClick={() => onSelect(gif.images.fixed_height_small.url)}
              className="rounded-lg overflow-hidden hover:scale-105 transition-transform"
              title={gif.title}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gif.images.fixed_height_small.url}
                alt={gif.title}
                className="w-full h-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1 text-right">Powered by GIPHY</p>
    </div>
  );
}
