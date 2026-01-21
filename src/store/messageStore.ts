import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Message, MessageStatus } from '../types';
import { getMessages, sendMessage as apiSendMessage } from '../api/chatService';
import { CURRENT_USER } from '../types/user';
import { useChatStore } from './chatStore';
import { MESSAGE_STATUS_DELAYS } from '../constants';
import { logError } from '../utils/logger';

interface MessageState {
  messages: Record<string, Message[]>;
  isLoading: Record<string, boolean>;
  loadedChats: Record<string, boolean>;
  error: string | null;
  /** Stores timeout IDs for cleanup to prevent memory leaks */
  pendingTimeouts: Record<string, NodeJS.Timeout[]>;

  fetchMessages: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  sendMessage: (chatId: string, text: string) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => void;
  clearMessages: (chatId: string) => void;
  clearPendingTimeouts: (messageId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: {},
  loadedChats: {},
  error: null,
  pendingTimeouts: {},

  fetchMessages: async (chatId: string) => {
    const { loadedChats, isLoading, messages } = get();

    if (loadedChats[chatId] || isLoading[chatId]) {
      return;
    }

    // Save ALL existing messages (including WebSocket messages) before fetch
    const existingMessages = messages[chatId] ?? [];

    set((state) => ({
      isLoading: { ...state.isLoading, [chatId]: true },
      error: null
    }));

    try {
      const fetchedMessages = await getMessages(chatId);

      // Get any new messages that arrived during the fetch
      const currentMessages = get().messages[chatId] ?? [];

      // Create a map of all messages by ID to remove duplicates
      const messageMap = new Map<string, Message>();

      // Add fetched messages first (they are the source of truth for historical data)
      fetchedMessages.forEach(msg => messageMap.set(msg.id, msg));

      // Add existing messages (preserves WebSocket messages that aren't in fetched data)
      existingMessages.forEach(msg => {
        if (!messageMap.has(msg.id)) {
          messageMap.set(msg.id, msg);
        }
      });

      // Add messages that arrived during fetch
      currentMessages.forEach(msg => {
        if (!messageMap.has(msg.id)) {
          messageMap.set(msg.id, msg);
        }
      });

      // Convert back to array and sort by timestamp
      const allMessages = Array.from(messageMap.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      );

      set((state) => ({
        messages: { ...state.messages, [chatId]: allMessages },
        isLoading: { ...state.isLoading, [chatId]: false },
        loadedChats: { ...state.loadedChats, [chatId]: true }
      }));

      // Update chat's last message with the actual last message from MessageList
      if (allMessages.length > 0) {
        const actualLastMessage = allMessages[allMessages.length - 1];
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

        // Store timeout IDs for cleanup
        const deliveredTimeout = setTimeout(() => {
          get().updateMessageStatus(chatId, optimisticId, 'delivered');
        }, MESSAGE_STATUS_DELAYS.DELIVERED_MIN + Math.random() * MESSAGE_STATUS_DELAYS.DELIVERED_RANGE);

        const readTimeout = setTimeout(() => {
          get().updateMessageStatus(chatId, optimisticId, 'read');
          // Clean up timeouts after read status is set
          get().clearPendingTimeouts(optimisticId);
        }, MESSAGE_STATUS_DELAYS.READ_MIN + Math.random() * MESSAGE_STATUS_DELAYS.READ_RANGE);

        // Store timeouts for potential cleanup
        set((state) => ({
          pendingTimeouts: {
            ...state.pendingTimeouts,
            [optimisticId]: [deliveredTimeout, readTimeout]
          }
        }));
      })
      .catch((error) => {
        logError('Failed to send message', error, { chatId, component: 'MessageStore' });
        get().updateMessageStatus(chatId, optimisticId, 'failed');
        // Clean up timeouts on failure
        get().clearPendingTimeouts(optimisticId);
      });
  },

  updateMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => {
    set((state) => {
      const chatMessages = state.messages[chatId];
      if (!chatMessages) return state;

      const updatedMessages = chatMessages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      );

      // Update chat's lastMessage if the updated message is the last one
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage && lastMessage.id === messageId) {
        const chatStore = useChatStore.getState();
        chatStore.updateLastMessage(chatId, lastMessage);
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: updatedMessages
        }
      };
    });
  },

  clearMessages: (chatId: string) => {
    set((state) => {
      const newMessages = { ...state.messages };
      const newLoadedChats = { ...state.loadedChats };
      const newPendingTimeouts = { ...state.pendingTimeouts };

      // Clear all pending timeouts for messages in this chat
      const chatMessages = state.messages[chatId] || [];
      chatMessages.forEach((msg) => {
        const timeouts = newPendingTimeouts[msg.id];
        if (timeouts) {
          timeouts.forEach(clearTimeout);
          delete newPendingTimeouts[msg.id];
        }
      });

      delete newMessages[chatId];
      delete newLoadedChats[chatId];

      return {
        messages: newMessages,
        loadedChats: newLoadedChats,
        pendingTimeouts: newPendingTimeouts
      };
    });
  },

  clearPendingTimeouts: (messageId: string) => {
    set((state) => {
      const timeouts = state.pendingTimeouts[messageId];
      if (timeouts) {
        timeouts.forEach(clearTimeout);
        const newPendingTimeouts = { ...state.pendingTimeouts };
        delete newPendingTimeouts[messageId];
        return { pendingTimeouts: newPendingTimeouts };
      }
      return state;
    });
  }
}));
