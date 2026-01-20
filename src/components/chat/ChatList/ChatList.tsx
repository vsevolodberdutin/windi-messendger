import { useChatStore } from '../../../store';
import { Spinner } from '../../ui';
import { ChatListItem } from './ChatListItem';

interface ChatListProps {
  isCollapsed?: boolean;
}

export function ChatList({ isCollapsed = false }: ChatListProps) {
  const { chats, selectedChatId, isLoading, error, selectChat } = useChatStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-gray-500 text-center">No chats available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          isCollapsed={isCollapsed}
          onClick={() => selectChat(chat.id)}
        />
      ))}
    </div>
  );
}
