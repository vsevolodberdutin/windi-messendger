import { useEffect } from "react";
import { useChatStore, useUIStore } from "./store";
import { useWebSocket } from "./hooks";
import { ChatList, MessageList, MessageInput } from "./components/chat";
import { Avatar } from "./components/ui";
import bgImage from "./assets/bg.png";

function App() {
  const fetchChats = useChatStore((state) => state.fetchChats);
  const { connect, disconnect } = useWebSocket();
  const selectedChat = useChatStore((state) =>
    state.chats.find((chat) => chat.id === state.selectedChatId)
  );
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Chat List */}
      <aside
        className={`shrink-0 flex flex-col ${isSidebarOpen ? "w-80" : "w-16"}
          border-r border-gray-200
          shadow-[8px_0_16px_-4px_rgba(0,0,0,0.1)]
          transition-all duration-300 ease-in-out`}>
        <header
          className={`flex items-center justify-between h-16 ${isSidebarOpen ? "pl-4 pr-1" : "px-4"}
            border-b border-gray-200`}>
          <h1
            className={`text-xl font-bold text-gray-900 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
            transition-opacity duration-200`}>
            Windi Messenger
          </h1>
          <button
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center cursor-pointer shrink-0
              rounded-lg p-2
              transition-colors duration-200
              hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}>
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-hidden">
          <ChatList isCollapsed={!isSidebarOpen} />
        </div>
      </aside>

      {/* Main Content - Messages */}
      <main className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center h-16 px-4
            border-b border-gray-200 bg-white
            shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">

          {selectedChat ? (
            <div className="flex items-center gap-3">
              <Avatar
                src={selectedChat.avatar}
                alt={selectedChat.name}
                size="md"
              />
              <span className="font-medium text-gray-900">
                {selectedChat.name}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Select a chat</span>
          )}
        </header>

        <div className="flex-1 overflow-hidden relative">
          {/* Background Image with Opacity */}
          <div
            className="absolute inset-0 z-0
              bg-cover bg-center bg-no-repeat
              opacity-10"
            style={{ backgroundImage: `url(${bgImage})` }}
            aria-hidden="true"
          />
          <MessageList />
        </div>

        <MessageInput />
      </main>
    </div>
  );
}

export default App;
