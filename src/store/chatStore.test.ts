import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from './chatStore';
import type { Message } from '../types';

vi.mock('../api/chatService', () => ({
  getChats: vi.fn(() =>
    Promise.resolve([
      {
        id: 'chat-1',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        lastMessage: null,
        unreadCount: 0
      },
      {
        id: 'chat-2',
        name: 'Another User',
        avatar: 'https://example.com/avatar2.jpg',
        lastMessage: {
          id: 'msg-1',
          chatId: 'chat-2',
          text: 'Hello',
          senderId: 'user-2',
          timestamp: Date.now(),
          status: 'read' as const
        },
        unreadCount: 2
      }
    ])
  )
}));

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      chats: [],
      selectedChatId: null,
      isLoading: false,
      error: null
    });
  });

  describe('fetchChats', () => {
    it('should fetch and store chats', async () => {
      const { fetchChats } = useChatStore.getState();

      await fetchChats();

      const state = useChatStore.getState();
      expect(state.chats).toHaveLength(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set isLoading to true while fetching', async () => {
      const { fetchChats } = useChatStore.getState();

      const promise = fetchChats();

      expect(useChatStore.getState().isLoading).toBe(true);

      await promise;

      expect(useChatStore.getState().isLoading).toBe(false);
    });
  });

  describe('selectChat', () => {
    it('should select a chat by id', async () => {
      const { fetchChats, selectChat } = useChatStore.getState();

      await fetchChats();
      selectChat('chat-1');

      expect(useChatStore.getState().selectedChatId).toBe('chat-1');
    });

    it('should reset unread count when selecting a chat', async () => {
      const { fetchChats, selectChat } = useChatStore.getState();

      await fetchChats();

      const chatBefore = useChatStore.getState().chats.find((c) => c.id === 'chat-2');
      expect(chatBefore?.unreadCount).toBe(2);

      selectChat('chat-2');

      const chatAfter = useChatStore.getState().chats.find((c) => c.id === 'chat-2');
      expect(chatAfter?.unreadCount).toBe(0);
    });
  });

  describe('updateLastMessage', () => {
    it('should update the last message for a chat', async () => {
      const { fetchChats, updateLastMessage } = useChatStore.getState();

      await fetchChats();

      const newMessage: Message = {
        id: 'new-msg',
        chatId: 'chat-1',
        text: 'New message',
        senderId: 'user-1',
        timestamp: Date.now(),
        status: 'sent'
      };

      updateLastMessage('chat-1', newMessage);

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.lastMessage).toEqual(newMessage);
    });

    it('should sort chats by last message timestamp', async () => {
      const { fetchChats, updateLastMessage } = useChatStore.getState();

      await fetchChats();

      const newMessage: Message = {
        id: 'new-msg',
        chatId: 'chat-1',
        text: 'New message',
        senderId: 'user-1',
        timestamp: Date.now() + 1000,
        status: 'sent'
      };

      updateLastMessage('chat-1', newMessage);

      const chats = useChatStore.getState().chats;
      expect(chats[0].id).toBe('chat-1');
    });
  });

  describe('incrementUnreadCount', () => {
    it('should increment unread count for a chat', async () => {
      const { fetchChats, incrementUnreadCount } = useChatStore.getState();

      await fetchChats();

      incrementUnreadCount('chat-1');

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.unreadCount).toBe(1);
    });

    it('should not increment unread count for selected chat', async () => {
      const { fetchChats, selectChat, incrementUnreadCount } = useChatStore.getState();

      await fetchChats();
      selectChat('chat-1');
      incrementUnreadCount('chat-1');

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.unreadCount).toBe(0);
    });
  });

  describe('resetUnreadCount', () => {
    it('should reset unread count for a chat', async () => {
      const { fetchChats, resetUnreadCount } = useChatStore.getState();

      await fetchChats();

      const chatBefore = useChatStore.getState().chats.find((c) => c.id === 'chat-2');
      expect(chatBefore?.unreadCount).toBe(2);

      resetUnreadCount('chat-2');

      const chatAfter = useChatStore.getState().chats.find((c) => c.id === 'chat-2');
      expect(chatAfter?.unreadCount).toBe(0);
    });
  });
});
