import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMessages } from './useMessages';
import { useMessageStore } from '../store/messageStore';
import { useChatStore } from '../store/chatStore';

vi.mock('../store/messageStore');
vi.mock('../store/chatStore');

describe('useMessages', () => {
  const mockFetchMessages = vi.fn();
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useChatStore).mockReturnValue('chat-1' as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useMessageStore).mockReturnValue({
      messages: {},
      isLoading: {},
      error: null,
      fetchMessages: mockFetchMessages,
      sendMessage: mockSendMessage
    } as unknown as ReturnType<typeof useMessageStore>);
  });

  it('should fetch messages on mount when chatId is provided', () => {
    renderHook(() => useMessages('chat-1'));

    expect(mockFetchMessages).toHaveBeenCalledWith('chat-1');
  });

  it('should use selectedChatId when no chatId is provided', () => {
    renderHook(() => useMessages());

    expect(mockFetchMessages).toHaveBeenCalledWith('chat-1');
  });

  it('should not fetch if messages already exist', () => {
    vi.mocked(useMessageStore).mockReturnValue({
      messages: { 'chat-1': [{ id: 'msg-1' }] },
      isLoading: {},
      error: null,
      fetchMessages: mockFetchMessages,
      sendMessage: mockSendMessage
    } as unknown as ReturnType<typeof useMessageStore>);

    renderHook(() => useMessages('chat-1'));

    expect(mockFetchMessages).not.toHaveBeenCalled();
  });

  it('should not fetch if already loading', () => {
    vi.mocked(useMessageStore).mockReturnValue({
      messages: {},
      isLoading: { 'chat-1': true },
      error: null,
      fetchMessages: mockFetchMessages,
      sendMessage: mockSendMessage
    } as unknown as ReturnType<typeof useMessageStore>);

    renderHook(() => useMessages('chat-1'));

    expect(mockFetchMessages).not.toHaveBeenCalled();
  });

  it('should return messages for the chat', () => {
    const mockMessages = [{ id: 'msg-1', text: 'Hello' }];

    vi.mocked(useMessageStore).mockReturnValue({
      messages: { 'chat-1': mockMessages },
      isLoading: {},
      error: null,
      fetchMessages: mockFetchMessages,
      sendMessage: mockSendMessage
    } as unknown as ReturnType<typeof useMessageStore>);

    const { result } = renderHook(() => useMessages('chat-1'));

    expect(result.current.messages).toEqual(mockMessages);
  });

  it('should return empty array when no messages exist', () => {
    vi.mocked(useMessageStore).mockReturnValue({
      messages: {},
      isLoading: {},
      error: null,
      fetchMessages: mockFetchMessages,
      sendMessage: mockSendMessage
    } as unknown as ReturnType<typeof useMessageStore>);

    const { result } = renderHook(() => useMessages('chat-1'));

    expect(result.current.messages).toEqual([]);
  });

  it('should return loading state for the chat', () => {
    vi.mocked(useMessageStore).mockReturnValue({
      messages: {},
      isLoading: { 'chat-1': true },
      error: null,
      fetchMessages: mockFetchMessages,
      sendMessage: mockSendMessage
    } as unknown as ReturnType<typeof useMessageStore>);

    const { result } = renderHook(() => useMessages('chat-1'));

    expect(result.current.isLoading).toBe(true);
  });

  it('should send message with chatId', () => {
    const { result } = renderHook(() => useMessages('chat-1'));

    result.current.sendMessage('Hello');

    expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'Hello');
  });

  it('should not send message if chatId is not available', () => {
    vi.mocked(useChatStore).mockReturnValue(null as unknown as ReturnType<typeof useChatStore>);

    const { result } = renderHook(() => useMessages());

    result.current.sendMessage('Hello');

    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
