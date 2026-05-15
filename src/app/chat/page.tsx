import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import LogoutButton from "@/components/LogoutButton";
import PollBannerWrapper from "@/components/PollBannerWrapper";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#0f0c29] via-[#1a1740] to-[#0f0c29] text-white">
      <header className="flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-lg shadow-md">💬</div>
          <div>
            <h1 className="font-bold text-lg leading-none text-white">ProjectLike</h1>
            <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Canal général</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/boutique"
            className="flex items-center gap-2 bg-amber-600/80 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            🕯️ Boutique
          </Link>
          <LogoutButton />
        </div>
      </header>
      <PollBannerWrapper />
      <ChatMessages />
      <ChatInput />
    </div>
  );
}
