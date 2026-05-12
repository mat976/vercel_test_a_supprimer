"use client";

import { useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import GifPicker from "./GifPicker";
import CreatePoll from "./CreatePoll";

const EMOJIS = ["😀","😂","😍","🥰","😎","🤔","😢","🔥","👍","❤️","🎉","💯","😭","🙏","💀","✨","👀","🤣","😅","🫶"];
const MAX = 500;

export default function ChatInput() {
  const [content, setContent] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendGif(url: string) {
    setShowGifs(false);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: url }),
    });
  }

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= MAX) setContent(e.target.value);
  }

  function addEmoji(emoji: string) {
    setContent((prev) => prev.length < MAX ? prev + emoji : prev);
    inputRef.current?.focus();
  }

  return (
    <div className="border-t border-white/10 bg-white/5 backdrop-blur-md px-4 py-3">
      {showEmojis && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-2 w-full">
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
      {showGifs && <GifPicker onSelect={sendGif} />}
      {showPoll && <CreatePoll onClose={() => setShowPoll(false)} />}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { setShowEmojis((v) => !v); setShowGifs(false); }}
          className="text-2xl hover:scale-110 transition-transform"
          title="Emojis"
        >
          😊
        </button>
        <button
          type="button"
          onClick={() => { setShowGifs((v) => !v); setShowEmojis(false); setShowPoll(false); }}
          className="text-xs font-bold px-2 py-1 bg-gray-700 hover:bg-indigo-600 rounded-lg transition"
          title="GIFs"
        >
          GIF
        </button>
        <button
          type="button"
          onClick={() => { setShowPoll((v) => !v); setShowEmojis(false); setShowGifs(false); }}
          className="text-xs font-bold px-2 py-1 bg-gray-700 hover:bg-indigo-600 rounded-lg transition"
          title="Sondage"
        >
          📊
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Votre message ou coller un lien GIF..."
          value={content}
          onChange={handleChange}
          maxLength={MAX}
          className="flex-1 bg-white/10 text-white placeholder-gray-400 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-white/10 transition"
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
      <div className="flex items-center justify-between mt-1 pl-8 pr-1">
        <p className="text-xs text-gray-500">💡 Colle un lien .gif ou .jpg pour envoyer une image</p>
        <span className={`text-xs font-mono ${content.length >= MAX ? "text-red-400" : content.length >= MAX * 0.8 ? "text-yellow-400" : "text-gray-500"}`}>
          {content.length}/{MAX}
        </span>
      </div>
    </div>
  );
}
