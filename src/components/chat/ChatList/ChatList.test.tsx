import { render, screen, fireEvent } from '@testing-library/react';
import { ChatList } from './ChatList';
import { useChatStore } from '../../../store/chatStore';

jest.mock('../../../store/chatStore');

describe('ChatList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading spinner when isLoading is true', () => {
    jest.mocked(useChatStore).mockReturnValue({
      chats: [],
      selectedChatId: null,
      isLoading: true,
      error: null,
      selectChat: jest.fn()
    } as unknown as ReturnType<typeof useChatStore>);

    render(<ChatList />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render error message when there is an error', () => {
    jest.mocked(useChatStore).mockReturnValue({
      chats: [],
      selectedChatId: null,
      isLoading: false,
      error: 'Failed to load chats',
      selectChat: jest.fn()
    } as unknown as ReturnType<typeof useChatStore>);

    render(<ChatList />);

    expect(screen.getByText('Failed to load chats')).toBeInTheDocument();
  });

  it('should render "No chats available" when chats array is empty', () => {
    jest.mocked(useChatStore).mockReturnValue({
      chats: [],
      selectedChatId: null,
      isLoading: false,
      error: null,
      selectChat: jest.fn()
    } as unknown as ReturnType<typeof useChatStore>);

    render(<ChatList />);

    expect(screen.getByText('No chats available')).toBeInTheDocument();
  });

  it('should render chat items when chats are available', () => {
    const mockChats = [
      {
        id: 'chat-1',
        name: 'User One',
        avatar: 'https://example.com/avatar1.jpg',
        lastMessage: null,
        unreadCount: 0
      },
      {
        id: 'chat-2',
        name: 'User Two',
        avatar: 'https://example.com/avatar2.jpg',
        lastMessage: null,
        unreadCount: 2
      }
    ];

    jest.mocked(useChatStore).mockReturnValue({
      chats: mockChats,
      selectedChatId: null,
      isLoading: false,
      error: null,
      selectChat: jest.fn()
    } as unknown as ReturnType<typeof useChatStore>);

    render(<ChatList />);

    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
  });

  it('should call selectChat when a chat item is clicked', () => {
    const mockSelectChat = jest.fn();
    const mockChats = [
      {
        id: 'chat-1',
        name: 'User One',
        avatar: 'https://example.com/avatar1.jpg',
        lastMessage: null,
        unreadCount: 0
      }
    ];

    jest.mocked(useChatStore).mockReturnValue({
      chats: mockChats,
      selectedChatId: null,
      isLoading: false,
      error: null,
      selectChat: mockSelectChat
    } as unknown as ReturnType<typeof useChatStore>);

    render(<ChatList />);

    fireEvent.click(screen.getByText('User One'));

    expect(mockSelectChat).toHaveBeenCalledWith('chat-1');
  });

  it('should mark selected chat as selected', () => {
    const mockChats = [
      {
        id: 'chat-1',
        name: 'User One',
        avatar: 'https://example.com/avatar1.jpg',
        lastMessage: null,
        unreadCount: 0
      }
    ];

    jest.mocked(useChatStore).mockReturnValue({
      chats: mockChats,
      selectedChatId: 'chat-1',
      isLoading: false,
      error: null,
      selectChat: jest.fn()
    } as unknown as ReturnType<typeof useChatStore>);

    render(<ChatList />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-current', 'true');
  });
});
