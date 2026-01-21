import { renderHook } from '@testing-library/react';
import { useChats } from './useChats';
import { useChatStore } from '../store/chatStore';

jest.mock('../store/chatStore');

describe('useChats', () => {
  const mockFetchChats = jest.fn();
  const mockSelectChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useChatStore).mockReturnValue({
      chats: [],
      selectedChatId: null,
      isLoading: false,
      error: null,
      fetchChats: mockFetchChats,
      selectChat: mockSelectChat
    } as unknown as ReturnType<typeof useChatStore>);
  });

  it('should not automatically fetch chats on mount', () => {
    renderHook(() => useChats());

    // Hook no longer fetches automatically - fetching is handled in App.tsx
    expect(mockFetchChats).not.toHaveBeenCalled();
  });

  it('should return chats and selectedChat', () => {
    const mockChats = [
      { id: 'chat-1', name: 'Test', avatar: '', lastMessage: null, unreadCount: 0 }
    ];

    jest.mocked(useChatStore).mockReturnValue({
      chats: mockChats,
      selectedChatId: 'chat-1',
      isLoading: false,
      error: null,
      fetchChats: mockFetchChats,
      selectChat: mockSelectChat
    } as unknown as ReturnType<typeof useChatStore>);

    const { result } = renderHook(() => useChats());

    expect(result.current.chats).toEqual(mockChats);
    expect(result.current.selectedChat).toEqual(mockChats[0]);
    expect(result.current.selectedChatId).toBe('chat-1');
  });

  it('should return null for selectedChat when no chat is selected', () => {
    jest.mocked(useChatStore).mockReturnValue({
      chats: [{ id: 'chat-1', name: 'Test', avatar: '', lastMessage: null, unreadCount: 0 }],
      selectedChatId: null,
      isLoading: false,
      error: null,
      fetchChats: mockFetchChats,
      selectChat: mockSelectChat
    } as unknown as ReturnType<typeof useChatStore>);

    const { result } = renderHook(() => useChats());

    expect(result.current.selectedChat).toBeNull();
  });

  it('should expose selectChat function', () => {
    const { result } = renderHook(() => useChats());

    result.current.selectChat('chat-2');

    expect(mockSelectChat).toHaveBeenCalledWith('chat-2');
  });

  it('should expose refetch function', () => {
    const { result } = renderHook(() => useChats());

    result.current.refetch();

    expect(mockFetchChats).toHaveBeenCalled();
  });
});
