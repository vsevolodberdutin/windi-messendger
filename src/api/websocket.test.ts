import { mockWebSocket } from './websocket';

jest.mock('./mockData', () => ({
  MOCK_USERS: [
    {
      id: 'user-1',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      isOnline: true
    }
  ]
}));

describe('mockWebSocket', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWebSocket.disconnect();
  });

  afterEach(() => {
    mockWebSocket.disconnect();
    jest.useRealTimers();
  });

  describe('connect', () => {
    it('should set connected to true', () => {
      expect(mockWebSocket.connected).toBe(false);

      mockWebSocket.connect();

      expect(mockWebSocket.connected).toBe(true);
    });

    it('should not reconnect if already connected', () => {
      mockWebSocket.connect();
      expect(mockWebSocket.connected).toBe(true);

      mockWebSocket.connect();
      expect(mockWebSocket.connected).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should set connected to false', () => {
      mockWebSocket.connect();
      expect(mockWebSocket.connected).toBe(true);

      mockWebSocket.disconnect();

      expect(mockWebSocket.connected).toBe(false);
    });

    it('should not error if not connected', () => {
      expect(() => mockWebSocket.disconnect()).not.toThrow();
    });
  });

  describe('onMessage', () => {
    it('should add listener', () => {
      const callback = jest.fn();

      const unsubscribe = mockWebSocket.onMessage(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const callback = jest.fn();

      const unsubscribe = mockWebSocket.onMessage(callback);
      unsubscribe();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should receive messages when connected', async () => {
      const callback = jest.fn();

      mockWebSocket.onMessage(callback);
      mockWebSocket.connect();

      await jest.advanceTimersByTimeAsync(10000);

      expect(callback).toHaveBeenCalled();
    });

    it('should not receive messages after unsubscribe', async () => {
      const callback = jest.fn();

      const unsubscribe = mockWebSocket.onMessage(callback);
      mockWebSocket.connect();

      unsubscribe();

      await jest.advanceTimersByTimeAsync(10000);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('connected getter', () => {
    it('should return current connection state', () => {
      expect(mockWebSocket.connected).toBe(false);

      mockWebSocket.connect();
      expect(mockWebSocket.connected).toBe(true);

      mockWebSocket.disconnect();
      expect(mockWebSocket.connected).toBe(false);
    });
  });

  describe('message format', () => {
    it('should send messages with correct structure', async () => {
      const callback = jest.fn();

      mockWebSocket.onMessage(callback);
      mockWebSocket.connect();

      await jest.advanceTimersByTimeAsync(10000);

      expect(callback).toHaveBeenCalled();
      const message = callback.mock.calls[0][0];

      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('chatId');
      expect(message).toHaveProperty('text');
      expect(message).toHaveProperty('senderId');
      expect(message).toHaveProperty('timestamp');
      expect(message).toHaveProperty('status');
    });
  });
});
