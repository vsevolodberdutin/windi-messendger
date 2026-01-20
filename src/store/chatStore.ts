import { create } from 'zustand';
import type { Chat, Message } from '../types';
import { getChats } from '../api/chatService';
import { CURRENT_USER } from '../types/user';

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchChats: () => Promise<void>;
  selectChat: (chatId: string) => void;
  updateLastMessage: (chatId: string, message: Message) => void;
  incrementUnreadCount: (chatId: string) => void;
  resetUnreadCount: (chatId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  selectedChatId: null,
  isLoading: false,
  error: null,

  fetchChats: async () => {
    set({ isLoading: true, error: null });

    try {
      const chats = await getChats();
      const sortedChats = chats.map((chat) => ({
        ...chat,
        lastCurrentUserMessageTimestamp:
          chat.lastMessage?.senderId === CURRENT_USER.id
            ? chat.lastMessage.timestamp
            : (chat.lastCurrentUserMessageTimestamp ?? 0)
      })).sort((a, b) => {
        const aTimestamp = a.lastCurrentUserMessageTimestamp ?? 0;
        const bTimestamp = b.lastCurrentUserMessageTimestamp ?? 0;
        return bTimestamp - aTimestamp;
      });
      set({ chats: sortedChats, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch chats',
        isLoading: false
      });
    }
  },

  selectChat: (chatId: string) => {
    set({ selectedChatId: chatId });
    get().resetUnreadCount(chatId);
  },

  updateLastMessage: (chatId: string, message: Message) => {
    set((state) => {
      // Optimized complexity: O(n) - find O(n) + filter O(n) + findIndex O(n) = O(n)
      // Much better than previous O(n log n) for frequent message updates

      // Find the chat to update
      const targetChat = state.chats.find((c) => c.id === chatId);
      if (!targetChat) return state;

      // Create updated chat with new message and timestamp
      const updatedChat: Chat = {
        ...targetChat,
        lastMessage: message,
        lastCurrentUserMessageTimestamp:
          message.senderId === CURRENT_USER.id
            ? message.timestamp
            : targetChat.lastCurrentUserMessageTimestamp
      };

      const updatedTimestamp = updatedChat.lastCurrentUserMessageTimestamp ?? 0;

      // Remove the target chat from the array
      const otherChats = state.chats.filter((c) => c.id !== chatId);

      // Find insertion position (first chat with lower timestamp)
      const insertionIndex = otherChats.findIndex(
        (chat) => (chat.lastCurrentUserMessageTimestamp ?? 0) < updatedTimestamp
      );

      // Insert at correct position
      const newChats =
        insertionIndex === -1
          ? [...otherChats, updatedChat] // Add at end if no lower timestamp found
          : [
              ...otherChats.slice(0, insertionIndex),
              updatedChat,
              ...otherChats.slice(insertionIndex)
            ];

      return { chats: newChats };
    });
  },

  incrementUnreadCount: (chatId: string) => {
    const { selectedChatId } = get();
    if (selectedChatId === chatId) return;

    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, unreadCount: chat.unreadCount + 1 }
          : chat
      )
    }));
  },

  resetUnreadCount: (chatId: string) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    }));
  }
}));
