import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';
import { mockWebSocket } from '../api/websocket';
import { useMessageStore } from '../store/messageStore';

vi.mock('../api/websocket', () => ({
  mockWebSocket: {
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    onMessage: vi.fn(() => vi.fn())
  }
}));

vi.mock('../store/messageStore');

describe('useWebSocket', () => {
  const mockAddMessage = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let onMessageCallback: ((message: any) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMessageStore).mockReturnValue({
      addMessage: mockAddMessage
    } as unknown as ReturnType<typeof useMessageStore>);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(mockWebSocket.onMessage).mockImplementation((callback: any) => {
      onMessageCallback = callback;
      return vi.fn();
    });
  });

  afterEach(() => {
    onMessageCallback = null;
  });

  it('should return initial connected state', () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.isConnected).toBe(false);
  });

  it('should call connect when connect is called', () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect();
    });

    expect(mockWebSocket.connect).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(true);
  });

  it('should call disconnect when disconnect is called', () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(mockWebSocket.disconnect).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
  });

  it('should subscribe to messages on mount', () => {
    renderHook(() => useWebSocket());

    expect(mockWebSocket.onMessage).toHaveBeenCalled();
  });

  it('should add message when received', () => {
    renderHook(() => useWebSocket());

    const testMessage = { id: 'msg-1', text: 'Hello' };

    act(() => {
      if (onMessageCallback) {
        onMessageCallback(testMessage);
      }
    });

    expect(mockAddMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(mockWebSocket.onMessage).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useWebSocket());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
