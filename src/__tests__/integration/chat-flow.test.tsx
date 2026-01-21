import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { useChatStore, useMessageStore } from '../../store';
import * as chatService from '../../api/chatService';

// Mock the API services
vi.mock('../../api/chatService');

// Mock WebSocket hook to prevent connection errors in tests
vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: false,
    connect: vi.fn(),
    disconnect: vi.fn()
  })
}));

const mockChats = [
  {
    id: '1',
    name: 'Alice Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    lastMessage: {
      id: 'm1',
      senderId: 'user-1',
      text: 'Hey, how are you?',
      timestamp: new Date('2024-01-20T10:30:00'),
      status: 'read' as const
    },
    unreadCount: 2
  },
  {
    id: '2',
    name: 'Bob Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    lastMessage: {
      id: 'm2',
      senderId: 'user-2',
      text: 'See you tomorrow!',
      timestamp: new Date('2024-01-20T09:15:00'),
      status: 'delivered' as const
    },
    unreadCount: 0
  }
];

const mockMessagesAlice = [
  {
    id: 'm1',
    chatId: '1',
    senderId: 'user-1',
    text: 'Hey, how are you?',
    timestamp: new Date('2024-01-20T10:30:00'),
    status: 'read' as const
  },
  {
    id: 'm2',
    chatId: '1',
    senderId: 'current-user',
    text: 'I am good, thanks!',
    timestamp: new Date('2024-01-20T10:31:00'),
    status: 'delivered' as const
  }
];

const mockMessagesBob = [
  {
    id: 'm3',
    chatId: '2',
    senderId: 'user-2',
    text: 'See you tomorrow!',
    timestamp: new Date('2024-01-20T09:15:00'),
    status: 'delivered' as const
  }
];

describe('Chat Flow Integration Tests', () => {
  beforeEach(() => {
    // Reset stores to initial state
    useChatStore.setState({ chats: [], selectedChatId: null });
    useMessageStore.setState({
      messages: {},
      isLoading: {},
      loadedChats: {},
      error: null,
      pendingTimeouts: {}
    });

    // Setup mocks
    vi.mocked(chatService.getChats).mockResolvedValue(mockChats);
    vi.mocked(chatService.getMessages).mockImplementation(async (chatId) => {
      if (chatId === '1') return mockMessagesAlice;
      if (chatId === '2') return mockMessagesBob;
      return [];
    });
  });

  it('should display initial chat list on app load', async () => {
    render(<App />);

    // Wait for chats to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    // Verify unread count is displayed
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display "Select a chat" message when no chat is selected', () => {
    render(<App />);

    expect(screen.getByText(/Select a chat to start messaging/i)).toBeInTheDocument();
  });

  it('should select a chat and display messages', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for chats to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    // Click on Alice's chat
    const aliceChat = screen.getByText('Alice Johnson').closest('button');
    expect(aliceChat).toBeInTheDocument();
    await user.click(aliceChat!);

    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Hey, how are you?')).toBeInTheDocument();
      expect(screen.getByText('I am good, thanks!')).toBeInTheDocument();
    });

    // Verify chat header shows selected chat
    const header = screen.getAllByText('Alice Johnson');
    expect(header.length).toBeGreaterThan(0);
  });

  it('should switch between chats and display correct messages', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for chats to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    // Select Alice's chat
    const aliceChat = screen.getByText('Alice Johnson').closest('button');
    await user.click(aliceChat!);

    await waitFor(() => {
      expect(screen.getByText('Hey, how are you?')).toBeInTheDocument();
    });

    // Switch to Bob's chat
    const bobChat = screen.getByText('Bob Smith').closest('button');
    await user.click(bobChat!);

    await waitFor(() => {
      expect(screen.getByText('See you tomorrow!')).toBeInTheDocument();
    });

    // Alice's messages should not be visible
    expect(screen.queryByText('Hey, how are you?')).not.toBeInTheDocument();
  });

  it('should send a message in the selected chat', async () => {
    const user = userEvent.setup();

    // Mock sendMessage
    const sendMessageMock = vi.fn().mockResolvedValue({
      id: 'm4',
      chatId: '1',
      senderId: 'current-user',
      text: 'New test message',
      timestamp: new Date(),
      status: 'sent' as const
    });
    vi.mocked(chatService.sendMessage).mockImplementation(sendMessageMock);

    render(<App />);

    // Wait for chats and select Alice
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const aliceChat = screen.getByText('Alice Johnson').closest('button');
    await user.click(aliceChat!);

    await waitFor(() => {
      expect(screen.getByText('Hey, how are you?')).toBeInTheDocument();
    });

    // Find message input and send button
    const messageInput = screen.getByPlaceholderText(/Type a message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Type a message
    await user.type(messageInput, 'New test message');
    expect(messageInput).toHaveValue('New test message');

    // Send the message
    await user.click(sendButton);

    // Verify message was sent
    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith('1', 'New test message');
    });

    // Input should be cleared after sending
    expect(messageInput).toHaveValue('');
  });

  it('should display loading state while fetching messages', async () => {
    const user = userEvent.setup();

    // Make fetchMessages slow
    vi.mocked(chatService.getMessages).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockMessagesAlice), 100))
    );

    render(<App />);

    // Wait for chats and select Alice
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const aliceChat = screen.getByText('Alice Johnson').closest('button');
    await user.click(aliceChat!);

    // Should show loading state
    expect(screen.getByText(/Loading messages/i)).toBeInTheDocument();

    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Hey, how are you?')).toBeInTheDocument();
    }, { timeout: 200 });

    // Loading should be gone
    expect(screen.queryByText(/Loading messages/i)).not.toBeInTheDocument();
  });

  it('should show error state when message fetch fails', async () => {
    const user = userEvent.setup();

    // Make fetchMessages fail
    vi.mocked(chatService.getMessages).mockRejectedValue(
      new Error('Failed to fetch messages')
    );

    render(<App />);

    // Wait for chats and select Alice
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const aliceChat = screen.getByText('Alice Johnson').closest('button');
    await user.click(aliceChat!);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch messages/i)).toBeInTheDocument();
    });

    // Should have retry button
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should toggle sidebar on mobile', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Find toggle button
    const toggleButton = screen.getByRole('button', { name: /sidebar/i });
    expect(toggleButton).toBeInTheDocument();

    // Click to close sidebar
    await user.click(toggleButton);

    // Click again to open sidebar
    await user.click(toggleButton);

    // Sidebar should still be functional
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });
});
