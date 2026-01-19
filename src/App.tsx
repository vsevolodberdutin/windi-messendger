import { useEffect } from 'react';
import { useChatStore } from './store';
import { mockWebSocket } from './api';
import { useMessageStore } from './store';
import { ChatList, MessageList, MessageInput } from './components/chat';

function App() {
  const fetchChats = useChatStore((state) => state.fetchChats);
  const { addMessage } = useMessageStore();
  const selectedChat = useChatStore((state) =>
    state.chats.find((chat) => chat.id === state.selectedChatId)
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    mockWebSocket.connect();
    const unsubscribe = mockWebSocket.onMessage((message) => {
      addMessage(message);
    });

    return () => {
      unsubscribe();
      mockWebSocket.disconnect();
    };
  }, [addMessage]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Chat List */}
      <aside
        className="w-80 shrink-0 flex flex-col
          border-r border-gray-200"
      >
        <header
          className="flex items-center h-16 px-4
            border-b border-gray-200"
        >
          <h1 className="text-xl font-bold text-gray-900">Windi Messenger</h1>
        </header>
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </aside>

      {/* Main Content - Messages */}
      <main className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center h-16 px-4
            border-b border-gray-200 bg-white"
        >
          {selectedChat ? (
            <div className="flex items-center gap-3">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium text-gray-900">
                {selectedChat.name}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Select a chat</span>
          )}
        </header>

        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>

        <MessageInput />
      </main>
    </div>
  );
}

export default App;
