import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMessageStore } from './messageStore';
import { useChatStore } from './chatStore';
import type { Message } from '../types';

vi.mock('../api/chatService', () => ({
  getMessages: vi.fn((chatId: string) =>
    Promise.resolve([
      {
        id: 'msg-1',
        chatId,
        text: 'Hello',
        senderId: 'user-1',
        timestamp: Date.now() - 1000,
        status: 'read' as const
      },
      {
        id: 'msg-2',
        chatId,
        text: 'Hi there',
        senderId: 'current-user',
        timestamp: Date.now(),
        status: 'read' as const
      }
    ])
  ),
  sendMessage: vi.fn(() => Promise.resolve({ id: 'sent-msg-id' }))
}));

describe('messageStore', () => {
  beforeEach(() => {
    useMessageStore.setState({
      messages: {},
      isLoading: {},
      loadedChats: {},
      error: null
    });
    useChatStore.setState({
      chats: [
        {
          id: 'chat-1',
          name: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
          lastMessage: null,
          unreadCount: 0
        }
      ],
      selectedChatId: null,
      isLoading: false,
      error: null
    });
    vi.clearAllMocks();
  });

  describe('fetchMessages', () => {
    it('should fetch and store messages for a chat', async () => {
      const { fetchMessages } = useMessageStore.getState();

      await fetchMessages('chat-1');

      const state = useMessageStore.getState();
      expect(state.messages['chat-1']).toHaveLength(2);
      expect(state.isLoading['chat-1']).toBe(false);
    });

    it('should not refetch if messages already exist', async () => {
      const { getMessages } = await import('../api/chatService');
      const { fetchMessages } = useMessageStore.getState();

      await fetchMessages('chat-1');
      await fetchMessages('chat-1');

      expect(getMessages).toHaveBeenCalledTimes(1);
    });

    it('should set isLoading while fetching', async () => {
      const { fetchMessages } = useMessageStore.getState();

      const promise = fetchMessages('chat-1');

      expect(useMessageStore.getState().isLoading['chat-1']).toBe(true);

      await promise;

      expect(useMessageStore.getState().isLoading['chat-1']).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('should add a message to a chat', () => {
      const { addMessage } = useMessageStore.getState();

      const newMessage: Message = {
        id: 'new-msg',
        chatId: 'chat-1',
        text: 'New message',
        senderId: 'user-1',
        timestamp: Date.now(),
        status: 'sent'
      };

      addMessage(newMessage);

      const messages = useMessageStore.getState().messages['chat-1'];
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(newMessage);
    });

    it('should update last message in chat store', () => {
      const { addMessage } = useMessageStore.getState();

      const newMessage: Message = {
        id: 'new-msg',
        chatId: 'chat-1',
        text: 'New message',
        senderId: 'user-1',
        timestamp: Date.now(),
        status: 'sent'
      };

      addMessage(newMessage);

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.lastMessage).toEqual(newMessage);
    });

    it('should increment unread count for messages from others', () => {
      const { addMessage } = useMessageStore.getState();

      const newMessage: Message = {
        id: 'new-msg',
        chatId: 'chat-1',
        text: 'New message',
        senderId: 'other-user',
        timestamp: Date.now(),
        status: 'sent'
      };

      addMessage(newMessage);

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.unreadCount).toBe(1);
    });

    it('should not increment unread count for own messages', () => {
      const { addMessage } = useMessageStore.getState();

      const newMessage: Message = {
        id: 'new-msg',
        chatId: 'chat-1',
        text: 'New message',
        senderId: 'current-user',
        timestamp: Date.now(),
        status: 'sent'
      };

      addMessage(newMessage);

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.unreadCount).toBe(0);
    });
  });

  describe('sendMessage', () => {
    it('should add optimistic message immediately', async () => {
      await useMessageStore.getState().fetchMessages('chat-1');
      const { sendMessage } = useMessageStore.getState();

      sendMessage('chat-1', 'Test message');

      const messages = useMessageStore.getState().messages['chat-1'];
      const lastMessage = messages[messages.length - 1];

      expect(lastMessage.text).toBe('Test message');
      expect(lastMessage.senderId).toBe('current-user');
      expect(lastMessage.status).toBe('sending');
    });

    it('should update message status after sending', async () => {
      vi.useFakeTimers();
      await useMessageStore.getState().fetchMessages('chat-1');
      const { sendMessage } = useMessageStore.getState();

      sendMessage('chat-1', 'Test message');

      const messages = useMessageStore.getState().messages['chat-1'];
      const lastMessage = messages[messages.length - 1];
      const messageId = lastMessage.id;

      await vi.runAllTimersAsync();

      const updatedMessages = useMessageStore.getState().messages['chat-1'];
      const updatedMessage = updatedMessages.find((m) => m.id === messageId);

      expect(updatedMessage?.status).toBe('read');

      vi.useRealTimers();
    });
  });

  describe('updateMessageStatus', () => {
    it('should update message status', async () => {
      await useMessageStore.getState().fetchMessages('chat-1');
      const { updateMessageStatus } = useMessageStore.getState();

      updateMessageStatus('chat-1', 'msg-1', 'delivered');

      const messages = useMessageStore.getState().messages['chat-1'];
      const updatedMessage = messages.find((m) => m.id === 'msg-1');

      expect(updatedMessage?.status).toBe('delivered');
    });
  });

  describe('clearMessages', () => {
    it('should clear messages for a chat', async () => {
      await useMessageStore.getState().fetchMessages('chat-1');
      const { clearMessages } = useMessageStore.getState();

      expect(useMessageStore.getState().messages['chat-1']).toHaveLength(2);

      clearMessages('chat-1');

      expect(useMessageStore.getState().messages['chat-1']).toBeUndefined();
    });
  });
});
