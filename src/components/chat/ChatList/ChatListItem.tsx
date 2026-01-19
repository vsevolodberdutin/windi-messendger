import type { Chat } from '../../../types';
import { Avatar } from '../../ui';
import { formatMessageTime, truncateText } from '../../../utils/formatters';
import { CURRENT_USER } from '../../../types/user';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const lastMessagePreview = chat.lastMessage
    ? chat.lastMessage.senderId === CURRENT_USER.id
      ? `You: ${truncateText(chat.lastMessage.text, 30)}`
      : truncateText(chat.lastMessage.text, 35)
    : 'No messages yet';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 text-left
        border-b border-gray-100
        transition-colors duration-150
        hover:bg-gray-50
        ${isSelected ? 'bg-blue-50' : ''}`}
      aria-current={isSelected ? 'true' : undefined}
    >
      <Avatar src={chat.avatar} alt={chat.name} size="lg" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 truncate">
            {chat.name}
          </span>
          {chat.lastMessage && (
            <span className="text-xs text-gray-500 shrink-0 ml-2">
              {formatMessageTime(chat.lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm text-gray-500 truncate">
            {lastMessagePreview}
          </span>
          {chat.unreadCount > 0 && (
            <span
              className="ml-2 shrink-0 flex items-center justify-center
                min-w-[20px] h-5 px-1.5
                rounded-full bg-blue-500
                text-xs font-medium text-white"
            >
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
