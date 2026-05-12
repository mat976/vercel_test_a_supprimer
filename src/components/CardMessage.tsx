"use client";

import Message from "@/types/Message";
import { FaTrash } from "react-icons/fa";

function isGifUrl(text: string) {
  return /^https?:\/\/.+\.(gif|webp)(\?.*)?$/i.test(text.trim());
}

function isImageUrl(text: string) {
  return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(text.trim());
}

function renderContent(content: string) {
  const trimmed = content.trim();
  if (isImageUrl(trimmed)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={trimmed}
        alt="image"
        className="max-w-xs max-h-60 rounded-xl object-cover"
      />
    );
  }
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return (
    <span>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-200 break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function CardMessage({
  m,
  userId,
}: {
  m: Message;
  userId: string | undefined;
}) {
  const isOwn = m.userId === userId;

  async function deleteMessage(_id: string, userId: string | undefined) {
    const request = await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id, userId }),
    });
    if (!request.ok) {
      const data = await request.json();
      console.log(data);
    }
  }

  function handleClick() {
    deleteMessage(m._id, userId);
  }

  const isMedia = isImageUrl(m.content.trim());

  return (
    <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
      {!isOwn && (
        <span className="text-xs font-semibold text-indigo-300 px-1">
          😊 {m.userName}
        </span>
      )}
      <div
        className={`relative group max-w-xs px-4 py-2 rounded-2xl text-sm shadow-sm ${
          isMedia ? "bg-transparent p-0" :
          isOwn
            ? "bg-indigo-600 text-white rounded-tr-none"
            : "bg-white text-gray-800 rounded-tl-none"
        }`}
      >
        {renderContent(m.content)}
        {isOwn && (
          <button
            onClick={handleClick}
            className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs"
            title="Supprimer"
          >
            <FaTrash size={10} />
          </button>
        )}
      </div>
      <span className="text-xs text-gray-400 px-1">
        {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
