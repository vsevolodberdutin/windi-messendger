import { create } from 'zustand';
import type { Chat, Message } from '../types';
import { getChats } from '../api/chatService';

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
      set({ chats, isLoading: false });
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
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage: message }
          : chat
      ).sort(
        (a, b) => (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0)
      )
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
