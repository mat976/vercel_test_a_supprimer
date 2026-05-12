"use client";

import { useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

const EMOJIS = ["😀","😂","😍","🥰","😎","🤔","😢","🔥","👍","❤️","🎉","💯","😭","🙏","💀","✨","👀","🤣","😅","🫶"];

export default function ChatInput() {
  const [content, setContent] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const request = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (request.ok) {
      setContent("");
      setShowEmojis(false);
    }
  }

  function addEmoji(emoji: string) {
    setContent((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  return (
    <div className="border-t border-gray-700 bg-gray-800 px-4 py-3">
      {showEmojis && (
        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-700 rounded-xl">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmojis((v) => !v)}
          className="text-2xl hover:scale-110 transition-transform"
          title="Emojis"
        >
          😊
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Votre message ou coller un lien GIF..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white p-2 rounded-xl transition"
          title="Envoyer"
        >
          <FaPaperPlane />
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-1 pl-8">
        💡 Colle un lien .gif ou .jpg pour envoyer une image
      </p>
    </div>
  );
}
