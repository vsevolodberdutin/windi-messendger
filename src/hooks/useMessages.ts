import { useEffect } from 'react';
import { useMessageStore, useChatStore } from '../store';

export function useMessages(chatId?: string) {
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const targetChatId = chatId ?? selectedChatId;

  const { messages, isLoading, error, fetchMessages, sendMessage } =
    useMessageStore();

  useEffect(() => {
    if (targetChatId && !messages[targetChatId] && !isLoading[targetChatId]) {
      fetchMessages(targetChatId);
    }
  }, [targetChatId, messages, isLoading, fetchMessages]);

  const chatMessages = targetChatId ? messages[targetChatId] ?? [] : [];
  const isChatLoading = targetChatId ? isLoading[targetChatId] ?? false : false;

  const send = (text: string) => {
    if (targetChatId) {
      sendMessage(targetChatId, text);
    }
  };

  return {
    messages: chatMessages,
    isLoading: isChatLoading,
    error,
    sendMessage: send
  };
}
