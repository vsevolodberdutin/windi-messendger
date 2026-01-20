import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Message, MessageStatus } from '../types';
import { getMessages, sendMessage as apiSendMessage } from '../api/chatService';
import { CURRENT_USER } from '../types/user';
import { useChatStore } from './chatStore';

interface MessageState {
  messages: Record<string, Message[]>;
  isLoading: Record<string, boolean>;
  loadedChats: Record<string, boolean>;
  error: string | null;

  fetchMessages: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  sendMessage: (chatId: string, text: string) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => void;
  clearMessages: (chatId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: {},
  loadedChats: {},
  error: null,

  fetchMessages: async (chatId: string) => {
    const { loadedChats, isLoading } = get();

    if (loadedChats[chatId] || isLoading[chatId]) {
      return;
    }

    set((state) => ({
      isLoading: { ...state.isLoading, [chatId]: true },
      error: null
    }));

    try {
      const fetchedMessages = await getMessages(chatId);
      set((state) => ({
        messages: { ...state.messages, [chatId]: fetchedMessages },
        isLoading: { ...state.isLoading, [chatId]: false },
        loadedChats: { ...state.loadedChats, [chatId]: true }
      }));

      // Update chat's last message with the actual last message from MessageList
      if (fetchedMessages.length > 0) {
        const actualLastMessage = fetchedMessages[fetchedMessages.length - 1];
        const chatStore = useChatStore.getState();
        chatStore.updateLastMessage(chatId, actualLastMessage);
      }
    } catch (error) {
      set((state) => ({
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        isLoading: { ...state.isLoading, [chatId]: false }
      }));
    }
  },

  addMessage: (message: Message) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] ?? [];
      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message]
        }
      };
    });

    const chatStore = useChatStore.getState();
    chatStore.updateLastMessage(message.chatId, message);

    if (message.senderId !== CURRENT_USER.id) {
      chatStore.incrementUnreadCount(message.chatId);
    }
  },

  sendMessage: (chatId: string, text: string) => {
    const optimisticId = nanoid();
    const optimisticMessage: Message = {
      id: optimisticId,
      chatId,
      text,
      senderId: CURRENT_USER.id,
      timestamp: Date.now(),
      status: 'sending'
    };

    get().addMessage(optimisticMessage);

    apiSendMessage(chatId, text)
      .then(() => {
        get().updateMessageStatus(chatId, optimisticId, 'sent');

        setTimeout(() => {
          get().updateMessageStatus(chatId, optimisticId, 'delivered');
        }, 500 + Math.random() * 1000);

        setTimeout(() => {
          get().updateMessageStatus(chatId, optimisticId, 'read');
        }, 1500 + Math.random() * 2000);
      })
      .catch((error) => {
        console.error('Failed to send message:', error);
        get().updateMessageStatus(chatId, optimisticId, 'failed');
      });
  },

  updateMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => {
    set((state) => {
      const chatMessages = state.messages[chatId];
      if (!chatMessages) return state;

      return {
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg
          )
        }
      };
    });
  },

  clearMessages: (chatId: string) => {
    set((state) => {
      const newMessages = { ...state.messages };
      const newLoadedChats = { ...state.loadedChats };
      delete newMessages[chatId];
      delete newLoadedChats[chatId];
      return { messages: newMessages, loadedChats: newLoadedChats };
    });
  }
}));
