"use client";

import Poll from "@/types/Poll";
import { FaTrash } from "react-icons/fa";

export default function PollCard({ poll, userId, onVote, onDelete, fullPage = false }: {
  poll: Poll;
  userId: string | undefined;
  onVote: (pollId: string, optionIndex: number) => void;
  onDelete: (pollId: string) => void;
  fullPage?: boolean;
}) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voters.length, 0);
  const userVote = poll.options.findIndex((o) => userId && o.voters.includes(userId));
  const isOwn = poll.createdBy === userId;
  const isClosed = poll.isClosed || (!!poll.endsAt && new Date() > new Date(poll.endsAt));
  const hasVoted = userVote !== -1;
  const showStats = !fullPage || isOwn || isClosed;

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 w-full ${fullPage ? "" : "max-w-sm"}`}>
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-300 font-medium">📊 Sondage · {poll.createdByName}</span>
            {isClosed && <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full">Fermé</span>}
            {!isClosed && poll.endsAt && (
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">⏳</span>
            )}
          </div>
          <p className="font-semibold text-white mt-0.5">{poll.question}</p>
        </div>
        {isOwn && (
          <button onClick={() => onDelete(poll._id)} className="text-red-400 hover:text-red-300 transition shrink-0" title="Supprimer">
            <FaTrash size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {poll.options.map((option, i) => {
          const pct = totalVotes > 0 ? Math.round((option.voters.length / totalVotes) * 100) : 0;
          const voted = userVote === i;
          const canClick = !isClosed && userId && (!fullPage || !hasVoted);
          return (
            <button
              key={i}
              onClick={() => canClick && onVote(poll._id, i)}
              disabled={!canClick}
              className={`relative w-full text-left rounded-xl text-sm font-medium overflow-hidden transition
                ${voted ? "ring-2 ring-indigo-400" : canClick ? "hover:bg-white/10" : ""}
                ${!canClick ? "cursor-default" : ""}`}
            >
              {option.gif && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={option.gif} alt="" className={fullPage ? "w-full object-cover rounded-t-xl" : "w-full h-20 object-cover rounded-t-xl"} />
              )}
              <div className="px-3 py-2">
                {showStats && (
                  <div
                    className={`absolute inset-0 rounded-xl transition-all ${voted ? "bg-indigo-600/50" : "bg-white/5"}`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                {!showStats && voted && (
                  <div className="absolute inset-0 rounded-xl bg-indigo-600/50" />
                )}
                {!showStats && !voted && (
                  <div className="absolute inset-0 rounded-xl bg-white/5" />
                )}
                <span className="relative z-10 flex justify-between">
                  <span>{voted ? "✅ " : ""}{option.text}</span>
                  {showStats && <span className="text-gray-300">{pct}% · {option.voters.length}</span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {showStats && <p className="text-xs text-gray-400 mt-2 text-right">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>}
      {!showStats && hasVoted && <p className="text-xs text-indigo-400 mt-2 text-right">✅ Réponse enregistrée</p>}
      {!showStats && !hasVoted && <p className="text-xs text-gray-500 mt-2 text-right">Choisis une option pour voter</p>}
    </div>
  );
}
