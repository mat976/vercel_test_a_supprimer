"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import CardMessage from "./CardMessage";
import PollCard from "./PollCard";
import Message from "@/types/Message";
import Poll from "@/types/Poll";

export default function ChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const { data: session } = authClient.useSession();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchAll() {
    const [msgRes, pollRes] = await Promise.all([
      fetch("/api/messages"),
      fetch("/api/polls"),
    ]);
    if (msgRes.ok) setMessages(await msgRes.json());
    if (pollRes.ok) setPolls(await pollRes.json());
  }

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, []);

  async function handleVote(pollId: string, optionIndex: number) {
    await fetch("/api/polls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, optionIndex }),
    });
    fetchAll();
  }

  async function handleDeletePoll(pollId: string) {
    await fetch("/api/polls", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId }),
    });
    fetchAll();
  }

  type FeedItem =
    | { type: "message"; data: Message; createdAt: string }
    | { type: "poll"; data: Poll; createdAt: string };

  const feed: FeedItem[] = [
    ...messages.map((m) => ({ type: "message" as const, data: m, createdAt: m.createdAt })),
    ...polls.map((p) => ({ type: "poll" as const, data: p, createdAt: p.createdAt })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (feed.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
        <span className="text-4xl">💬</span>
        <p className="text-sm">Aucun message pour l&apos;instant. Sois le premier !</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-3"
      >
        {feed.map((item) =>
          item.type === "message" ? (
            <CardMessage m={item.data} userId={session?.user.id} key={item.data._id} />
          ) : (
            <div key={item.data._id} className={`flex ${item.data.createdBy === session?.user.id ? "justify-end" : "justify-start"}`}>
              <PollCard
                poll={item.data}
                userId={session?.user.id}
                onVote={handleVote}
                onDelete={handleDeletePoll}
              />
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>
      {showScroll && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2 shadow-lg transition z-10"
          title="Descendre"
        >
          <FaArrowDown size={14} />
        </button>
      )}
    </div>
  );
}
