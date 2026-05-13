"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Poll from "@/types/Poll";
import PollCard from "@/components/PollCard";
import { authClient } from "@/lib/auth-client";

export default function PollPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { data: session } = authClient.useSession();

  async function fetchPoll() {
    const res = await fetch(`/api/polls/${id}`);
    if (!res.ok) { setNotFound(true); setLoading(false); return; }
    setPoll(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchPoll(); }, [id]);

  async function handleVote(pollId: string, optionIndex: number) {
    await fetch(`/api/polls/${pollId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIndex }),
    });
    fetchPoll();
  }

  async function handleDelete(pollId: string) {
    await fetch("/api/polls", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId }),
    });
    setPoll(null);
    setNotFound(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.3)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.2)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📊</div>
          <h1 className="text-white font-bold text-xl">Sondage</h1>
        </div>

        {loading && <p className="text-center text-gray-400">Chargement...</p>}

        {notFound && (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-300 text-lg">Sondage introuvable ou supprimé.</p>
          </div>
        )}

        {poll && !notFound && (
          <>
            <PollCard
              poll={poll}
              userId={session?.user.id}
              onVote={handleVote}
              onDelete={handleDelete}
              fullPage
            />
            {!poll.isPublic && !session && (
              <p className="text-center text-amber-300 text-sm mt-4">
                🔒 Connecte-toi pour voter sur ce sondage privé.
              </p>
            )}
          </>
        )}

        <div className="text-center mt-6">
          <a href="/chat" className="text-indigo-300 hover:text-indigo-200 text-sm transition">
            ← Retour au chat
          </a>
        </div>
      </div>
    </div>
  );
}
