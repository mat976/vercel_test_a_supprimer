"use client";

import Poll from "@/types/Poll";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCopy, FaCheck, FaStop, FaTrash, FaChevronDown, FaChevronUp, FaUsers } from "react-icons/fa";

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

function ScrollingText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  useEffect(() => {
    if (ref.current) setShouldScroll(ref.current.scrollWidth > ref.current.clientWidth);
  }, [text]);
  return (
    <span className="overflow-hidden block w-full">
      <span
        ref={ref}
        className={`inline-block whitespace-nowrap text-xs font-semibold text-indigo-200 ${shouldScroll ? "animate-marquee" : "truncate"}`}
      >
        📊 {text}
      </span>
    </span>
  );
}

export default function PollBanner({ userId }: { userId: string | undefined }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [votersFor, setVotersFor] = useState<number | null>(null);

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
    setOpen(false);
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
      <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border-b border-white/10 text-xs text-gray-500">
        📊 Aucun sondage actif
      </div>
    );
  }

  const poll = polls[index];
  const isOwn = poll.createdBy === userId;
  const isClosed = poll.isClosed || (!!poll.endsAt && new Date() > new Date(poll.endsAt));
  const totalVotes = poll.options.reduce((s, o) => s + o.voters.length, 0);
  const userVote = poll.options.findIndex((o) => userId && o.voters.includes(userId));

  return (
    <div className="bg-white/5 border-b border-white/10">
      {/* Barre accordéon fermée */}
      <div className="flex items-center gap-2 px-4 py-1.5">
        <button
          onClick={() => setIndex((i) => (i - 1 + polls.length) % polls.length)}
          className="text-gray-500 hover:text-white transition shrink-0"
          disabled={polls.length <= 1}
        >
          <FaArrowLeft size={10} />
        </button>

        <button className="flex-1 min-w-0 text-left" onClick={() => { setOpen((v) => !v); setVotersFor(null); }}>
          <ScrollingText text={poll.question} />
        </button>

        <span className="text-xs text-gray-500 shrink-0">{index + 1}/{polls.length}</span>

        <button onClick={() => { setOpen((v) => !v); setVotersFor(null); }} className="text-gray-400 hover:text-white transition shrink-0">
          {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </button>

        <button
          onClick={() => setIndex((i) => (i + 1) % polls.length)}
          className="text-gray-500 hover:text-white transition shrink-0"
          disabled={polls.length <= 1}
        >
          <FaArrowRight size={10} />
        </button>
      </div>

      {/* Panneau accordéon ouvert */}
      {open && (
        <div className="px-4 pb-3 border-t border-white/10">
          <div className="flex items-center justify-between mt-2 mb-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isClosed
                ? <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full">Fermé</span>
                : poll.endsAt && <CountdownBadge endsAt={poll.endsAt} />
              }
              <span className={`text-xs px-2 py-0.5 rounded-full ${poll.isPublic ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                {poll.isPublic ? "🔓 Public" : "🔒 Privé"}
              </span>
            </div>
            <div className="flex gap-2 items-center shrink-0">
              <button onClick={() => handleCopy(poll._id, poll.slug)} className="text-gray-400 hover:text-indigo-300 transition" title="Copier le lien">
                {copied ? <FaCheck size={12} className="text-green-400" /> : <FaCopy size={12} />}
              </button>
              {isOwn && !isClosed && (
                <button onClick={() => handleStop(poll._id)} className="text-amber-400 hover:text-amber-300 transition" title="Arrêter">
                  <FaStop size={12} />
                </button>
              )}
              {isOwn && (
                <button onClick={() => handleDelete(poll._id)} className="text-red-400 hover:text-red-300 transition" title="Supprimer">
                  <FaTrash size={12} />
                </button>
              )}
            </div>
          </div>

          <p className="text-sm font-semibold text-white mb-2">{poll.question}</p>

          <div className="flex flex-col gap-1.5">
            {poll.options.map((opt, i) => {
              const pct = totalVotes > 0 ? Math.round((opt.voters.length / totalVotes) * 100) : 0;
              const voted = userVote === i;
              const showingVoters = votersFor === i;
              return (
                <div key={i}>
                  <div className="flex gap-1 items-stretch">
                    <button
                      onClick={() => !isClosed && userId && handleVote(poll._id, i)}
                      disabled={isClosed}
                      className={`relative flex-1 text-left rounded-xl text-xs font-medium overflow-hidden transition
                        ${voted ? "ring-2 ring-indigo-400" : "hover:bg-white/10"}
                        ${isClosed ? "cursor-default opacity-80" : ""}`}
                    >
                      {opt.gif && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={opt.gif} alt="" className="w-full h-14 object-cover rounded-t-xl" />
                      )}
                      <div className={`relative px-3 py-1.5 ${opt.gif ? "" : "rounded-xl"} bg-white/5`}>
                        <div className="absolute inset-0 bg-indigo-500/25 transition-all" style={{ width: `${pct}%` }} />
                        <span className="relative z-10 flex justify-between gap-2">
                          <span className="text-white">{voted ? "✅ " : ""}{opt.text}</span>
                          <span className="text-gray-400 shrink-0">{pct}% · {opt.voters.length}</span>
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setVotersFor(showingVoters ? null : i)}
                      className="text-gray-500 hover:text-indigo-300 transition px-1"
                      title="Voir les votants"
                    >
                      <FaUsers size={12} />
                    </button>
                  </div>
                  {showingVoters && (
                    <div className="mt-1 ml-2 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">
                      {opt.voters.length === 0
                        ? "Aucun vote"
                        : <span>{opt.voters.length} vote{opt.voters.length > 1 ? "s" : ""} (IDs masqués)</span>
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">{totalVotes} vote{totalVotes !== 1 ? "s" : ""} · par {poll.createdByName}</p>
        </div>
      )}
    </div>
  );
}

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const remaining = useCountdown(endsAt);
  return <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">⏳ {remaining}</span>;
}
