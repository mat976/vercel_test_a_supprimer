import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import LogoutButton from "@/components/LogoutButton";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h1 className="font-bold text-lg leading-none">DiscussLike</h1>
            <p className="text-xs text-green-400">● Canal général</p>
          </div>
        </div>
        <LogoutButton />
      </header>
      <ChatMessages />
      <ChatInput />
    </div>
  );
}
