import { getChats, getMessages, sendMessage } from './chatService';

jest.mock('./mockData', () => ({
  MOCK_CHATS: [
    {
      id: 'chat-1',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      lastMessage: {
        id: 'msg-1',
        chatId: 'chat-1',
        text: 'Hello',
        senderId: 'user-1',
        timestamp: 1000,
        status: 'read'
      },
      unreadCount: 0
    },
    {
      id: 'chat-2',
      name: 'Another User',
      avatar: 'https://example.com/avatar2.jpg',
      lastMessage: {
        id: 'msg-2',
        chatId: 'chat-2',
        text: 'Hi there',
        senderId: 'user-2',
        timestamp: 2000,
        status: 'read'
      },
      unreadCount: 1
    }
  ],
  getMockMessagesForChat: jest.fn(() => [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      text: 'Message 1',
      senderId: 'user-1',
      timestamp: Date.now() - 1000,
      status: 'read'
    },
    {
      id: 'msg-2',
      chatId: 'chat-1',
      text: 'Message 2',
      senderId: 'current-user',
      timestamp: Date.now(),
      status: 'read'
    }
  ])
}));

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChats', () => {
    it('should return chats sorted by last message timestamp', async () => {
      const chats = await getChats();

      expect(chats).toHaveLength(2);
      expect(chats[0].id).toBe('chat-2');
      expect(chats[1].id).toBe('chat-1');
    });

    it('should return array of chats', async () => {
      const chats = await getChats();

      expect(Array.isArray(chats)).toBe(true);
      expect(chats[0]).toHaveProperty('id');
      expect(chats[0]).toHaveProperty('name');
      expect(chats[0]).toHaveProperty('avatar');
    });
  });

  describe('getMessages', () => {
    it('should return messages for a chat', async () => {
      const messages = await getMessages('chat-1');

      expect(Array.isArray(messages)).toBe(true);
      expect(messages).toHaveLength(2);
    });

    it('should return messages with expected properties', async () => {
      const messages = await getMessages('chat-1');

      expect(messages[0]).toHaveProperty('id');
      expect(messages[0]).toHaveProperty('chatId');
      expect(messages[0]).toHaveProperty('text');
      expect(messages[0]).toHaveProperty('senderId');
      expect(messages[0]).toHaveProperty('timestamp');
      expect(messages[0]).toHaveProperty('status');
    });
  });

  describe('sendMessage', () => {
    it('should return a message with sent status', async () => {
      const message = await sendMessage('chat-1', 'Test message');

      expect(message.chatId).toBe('chat-1');
      expect(message.text).toBe('Test message');
      expect(message.senderId).toBe('current-user');
      expect(message.status).toBe('sent');
    });

    it('should generate unique message id', async () => {
      const message1 = await sendMessage('chat-1', 'Message 1');
      const message2 = await sendMessage('chat-1', 'Message 2');

      expect(message1.id).not.toBe(message2.id);
    });

    it('should set timestamp to current time', async () => {
      const before = Date.now();
      const message = await sendMessage('chat-1', 'Test');
      const after = Date.now();

      expect(message.timestamp).toBeGreaterThanOrEqual(before);
      expect(message.timestamp).toBeLessThanOrEqual(after);
    });
  });
});
