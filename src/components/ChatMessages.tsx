"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import CardMessage from "./CardMessage";
import Message from "@/types/Message";

export default function ChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function fetchMessages() {
      const request = await fetch("/api/messages");
      if (!request.ok) {
        console.log(request.status);
        return;
      }
      const data = await request.json();
      setMessages(data);
    }
    fetchMessages();
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
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.map((m) => (
        <CardMessage m={m} userId={session?.user.id} key={m._id} />
      ))}
    </div>
  );
}
