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
    set((state) => ({
      // Current complexity: O(n log n) - map O(n) + sort O(n log n)
      // For 1000+ chats, consider optimization: remove chat O(n) + binary search O(log n) + insert O(n) = O(n)
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              lastCurrentUserMessageTimestamp:
                message.senderId === CURRENT_USER.id
                  ? message.timestamp
                  : chat.lastCurrentUserMessageTimestamp
            }
          : chat
      ).sort((a, b) => {
        const aTimestamp = a.lastCurrentUserMessageTimestamp ?? 0;
        const bTimestamp = b.lastCurrentUserMessageTimestamp ?? 0;
        return bTimestamp - aTimestamp;
      })
    }));
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
