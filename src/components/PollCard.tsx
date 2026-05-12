"use client";

import Poll from "@/types/Poll";
import { FaTrash } from "react-icons/fa";

export default function PollCard({ poll, userId, onVote, onDelete }: {
  poll: Poll;
  userId: string | undefined;
  onVote: (pollId: string, optionIndex: number) => void;
  onDelete: (pollId: string) => void;
}) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voters.length, 0);
  const userVote = poll.options.findIndex((o) => userId && o.voters.includes(userId));
  const isOwn = poll.createdBy === userId;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 w-full max-w-sm">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <span className="text-xs text-indigo-300 font-medium">📊 Sondage · {poll.createdByName}</span>
          <p className="font-semibold text-white mt-0.5">{poll.question}</p>
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(poll._id)}
            className="text-red-400 hover:text-red-300 transition shrink-0"
            title="Supprimer"
          >
            <FaTrash size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {poll.options.map((option, i) => {
          const pct = totalVotes > 0 ? Math.round((option.voters.length / totalVotes) * 100) : 0;
          const voted = userVote === i;
          return (
            <button
              key={i}
              onClick={() => userId && onVote(poll._id, i)}
              className={`relative w-full text-left px-3 py-2 rounded-xl text-sm font-medium overflow-hidden transition
                ${voted ? "ring-2 ring-indigo-400" : "hover:bg-white/10"}`}
            >
              <div
                className={`absolute inset-0 rounded-xl transition-all ${voted ? "bg-indigo-600/50" : "bg-white/5"}`}
                style={{ width: `${pct}%` }}
              />
              <span className="relative z-10 flex justify-between">
                <span>{voted ? "✅ " : ""}{option.text}</span>
                <span className="text-gray-300">{pct}% · {option.voters.length}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-2 text-right">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
    </div>
  );
}
