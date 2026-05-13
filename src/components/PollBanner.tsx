"use client";

import Poll from "@/types/Poll";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCopy, FaCheck, FaStop, FaTrash } from "react-icons/fa";

function useCountdown(endsAt?: string) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!endsAt) return;
    function update() {
      const diff = new Date(endsAt!).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Expiré"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

function PollItem({ poll, userId, onVote, onStop, onDelete, onCopy }: {
  poll: Poll;
  userId: string | undefined;
  onVote: (pollId: string, optionIndex: number) => void;
  onStop: (pollId: string) => void;
  onDelete: (pollId: string) => void;
  onCopy: (pollId: string, slug?: string) => void;
}) {
  const countdown = useCountdown(poll.endsAt);
  const isOwn = poll.createdBy === userId;
  const isClosed = poll.isClosed || (!!poll.endsAt && new Date() > new Date(poll.endsAt));
  const totalVotes = poll.options.reduce((s, o) => s + o.voters.length, 0);
  const userVote = poll.options.findIndex((o) => userId && o.voters.includes(userId));

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-indigo-300 truncate">📊 {poll.question}</span>
        {isClosed
          ? <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full shrink-0">Fermé</span>
          : poll.endsAt && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full shrink-0">⏳ {countdown}</span>
        }
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${poll.isPublic ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
          {poll.isPublic ? "🔓" : "🔒"}
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {poll.options.map((opt, i) => {
          const pct = totalVotes > 0 ? Math.round((opt.voters.length / totalVotes) * 100) : 0;
          const voted = userVote === i;
          return (
            <button
              key={i}
              onClick={() => !isClosed && userId && onVote(poll._id, i)}
              disabled={isClosed}
              className={`relative flex flex-col overflow-hidden rounded-lg border text-xs font-medium transition min-w-[80px]
                ${voted ? "border-indigo-400 bg-indigo-600/40" : "border-white/10 bg-white/5 hover:bg-white/10"}
                ${isClosed ? "cursor-default opacity-80" : ""}`}
            >
              {opt.gif && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opt.gif} alt="" className="w-full h-10 object-cover" />
              )}
              <div className="relative px-2 py-1">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-b-lg" style={{ width: `${pct}%` }} />
                <span className="relative z-10 text-white">{voted ? "✅ " : ""}{opt.text}</span>
                <span className="relative z-10 text-gray-400 ml-1">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-1">{totalVotes} vote{totalVotes !== 1 ? "s" : ""} · {poll.createdByName}</p>
    </div>
  );
}

export default function PollBanner({ userId }: { userId: string | undefined }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  async function fetchPolls() {
    const res = await fetch("/api/polls");
    if (res.ok) setPolls(await res.json());
  }

  useEffect(() => {
    fetchPolls();
    const id = setInterval(fetchPolls, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (index >= polls.length && polls.length > 0) setIndex(polls.length - 1);
  }, [polls.length, index]);

  async function handleVote(pollId: string, optionIndex: number) {
    await fetch("/api/polls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, optionIndex }),
    });
    fetchPolls();
  }

  async function handleStop(pollId: string) {
    await fetch("/api/polls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, close: true }),
    });
    fetchPolls();
  }

  async function handleDelete(pollId: string) {
    await fetch("/api/polls", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId }),
    });
    fetchPolls();
  }

  function handleCopy(pollId: string, slug?: string) {
    const url = `${window.location.origin}/poll/${slug || pollId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (polls.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10 text-xs text-gray-500">
        📊 Aucun sondage actif
      </div>
    );
  }

  const poll = polls[index];
  const isOwn = poll.createdBy === userId;
  const isClosed = poll.isClosed || (!!poll.endsAt && new Date() > new Date(poll.endsAt));

  return (
    <div className="flex items-start gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
      <button
        onClick={() => setIndex((i) => (i - 1 + polls.length) % polls.length)}
        className="text-gray-400 hover:text-white transition mt-1 shrink-0"
        disabled={polls.length <= 1}
      >
        <FaArrowLeft size={12} />
      </button>

      <PollItem
        poll={poll}
        userId={userId}
        onVote={handleVote}
        onStop={handleStop}
        onDelete={handleDelete}
        onCopy={handleCopy}
      />

      <div className="flex flex-col gap-1 shrink-0 mt-1">
        <button onClick={() => handleCopy(poll._id, poll.slug)} className="text-gray-400 hover:text-indigo-300 transition" title="Copier le lien">
          {copied ? <FaCheck size={12} className="text-green-400" /> : <FaCopy size={12} />}
        </button>
        {isOwn && !isClosed && (
          <button onClick={() => handleStop(poll._id)} className="text-amber-400 hover:text-amber-300 transition" title="Arrêter le sondage">
            <FaStop size={12} />
          </button>
        )}
        {isOwn && (
          <button onClick={() => handleDelete(poll._id)} className="text-red-400 hover:text-red-300 transition" title="Supprimer">
            <FaTrash size={12} />
          </button>
        )}
      </div>

      <button
        onClick={() => setIndex((i) => (i + 1) % polls.length)}
        className="text-gray-400 hover:text-white transition mt-1 shrink-0"
        disabled={polls.length <= 1}
      >
        <FaArrowRight size={12} />
      </button>

      <span className="text-xs text-gray-500 mt-1 shrink-0">{index + 1}/{polls.length}</span>
    </div>
  );
}
