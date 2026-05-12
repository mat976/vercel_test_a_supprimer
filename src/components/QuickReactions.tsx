"use client";

const QUICK = [
  { label: "👍 Super", msg: "👍" },
  { label: "❤️ Love", msg: "❤️" },
  { label: "😂 Lol", msg: "😂" },
  { label: "🔥 Fire", msg: "🔥" },
  { label: "🎉 GG", msg: "🎉" },
  { label: "😢 Sad", msg: "😢" },
];

export default function QuickReactions() {
  async function send(msg: string) {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: msg }),
    });
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10 overflow-x-auto">
      <span className="text-xs text-gray-400 whitespace-nowrap">Quick :</span>
      {QUICK.map((q) => (
        <button
          key={q.label}
          onClick={() => send(q.msg)}
          className="flex-shrink-0 text-xs px-3 py-1 bg-white/10 hover:bg-indigo-600 border border-white/10 rounded-full transition whitespace-nowrap"
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
