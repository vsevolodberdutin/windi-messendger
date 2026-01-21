import { useChatStore } from '../store';

/**
 * Custom hook for accessing chat state and actions
 *
 * Note: This hook does NOT fetch chats automatically.
 * Initial fetching is handled in App.tsx to prevent duplicate requests.
 * Use the refetch function if you need to manually refresh the chat list.
 */
export function useChats() {
  const { chats, selectedChatId, isLoading, error, fetchChats, selectChat } =
    useChatStore();

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
