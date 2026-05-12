"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import CardMessage from "./CardMessage";
import Message from "@/types/Message";

export default function ChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { data: session } = authClient.useSession();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScroll(distFromBottom > 100);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMessages() {
    const request = await fetch("/api/messages");
    if (!request.ok) return;
    const data = await request.json();
    setMessages(data);
  }

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);


  if (messages.length === 0) {
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
        {messages.map((m) => (
          <CardMessage m={m} userId={session?.user.id} key={m._id} />
        ))}
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
