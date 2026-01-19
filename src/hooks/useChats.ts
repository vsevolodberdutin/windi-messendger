import { useEffect } from 'react';
import { useChatStore } from '../store';

export function useChats() {
  const { chats, selectedChatId, isLoading, error, fetchChats, selectChat } =
    useChatStore();

  useEffect(() => {
    if (chats.length === 0 && !isLoading) {
      fetchChats();
    }
  }, [chats.length, isLoading, fetchChats]);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) ?? null;

  return {
    chats,
    selectedChat,
    selectedChatId,
    isLoading,
    error,
    selectChat,
    refetch: fetchChats
  };
}
