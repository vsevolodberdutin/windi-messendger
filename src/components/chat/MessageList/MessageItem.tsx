import type { CSSProperties } from 'react';
import type { Message } from '../../../types';
import { CURRENT_USER } from '../../../types/user';
import { formatMessageTime } from '../../../utils/formatters';

interface MessageItemProps {
  message: Message;
  style: CSSProperties;
}

function MessageStatus({ status }: { status: Message['status'] }) {
  const statusIcons = {
    sending: '○',
    sent: '✓',
    delivered: '✓✓',
    read: '✓✓',
    failed: '✗'
  };

  const statusColors = {
    sending: 'text-gray-400',
    sent: 'text-gray-400',
    delivered: 'text-gray-400',
    read: 'text-blue-500',
    failed: 'text-red-500'
  };

  return (
    <span className={`text-xs ${statusColors[status]}`} title={status === 'failed' ? 'Failed to send' : ''}>
      {statusIcons[status]}
    </span>
  );
}

export function MessageItem({ message, style }: MessageItemProps) {
  const isCurrentUser = message.senderId === CURRENT_USER.id;

  return (
    <div
      style={style}
      className={`flex px-4 py-1
        ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] px-3 py-2
          rounded-2xl
          ${isCurrentUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.text}
        </p>
        <div
          className={`flex items-center gap-1 mt-1
            ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        >
          <span
            className={`text-xs
              ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}
          >
            {formatMessageTime(message.timestamp)}
          </span>
          {isCurrentUser && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}
