import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatListItem } from './ChatListItem';
import type { Chat } from '../../../types';

describe('ChatListItem', () => {
  const mockChat: Chat = {
    id: 'chat-1',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    lastMessage: {
      id: 'msg-1',
      chatId: 'chat-1',
      text: 'Hello there!',
      senderId: 'user-1',
      timestamp: Date.now(),
      status: 'read'
    },
    unreadCount: 3
  };

  it('should render chat name', () => {
    render(
      <ChatListItem chat={mockChat} isSelected={false} onClick={() => {}} />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render last message preview', () => {
    render(
      <ChatListItem chat={mockChat} isSelected={false} onClick={() => {}} />
    );

    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  it('should render unread count badge when there are unread messages', () => {
    render(
      <ChatListItem chat={mockChat} isSelected={false} onClick={() => {}} />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not render unread badge when count is 0', () => {
    const chatWithNoUnread: Chat = { ...mockChat, unreadCount: 0 };

    render(
      <ChatListItem chat={chatWithNoUnread} isSelected={false} onClick={() => {}} />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render "99+" when unread count exceeds 99', () => {
    const chatWithManyUnread: Chat = { ...mockChat, unreadCount: 150 };

    render(
      <ChatListItem chat={chatWithManyUnread} isSelected={false} onClick={() => {}} />
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should show "You:" prefix for own messages', () => {
    const chatWithOwnMessage: Chat = {
      ...mockChat,
      lastMessage: {
        ...mockChat.lastMessage!,
        senderId: 'current-user'
      }
    };

    render(
      <ChatListItem chat={chatWithOwnMessage} isSelected={false} onClick={() => {}} />
    );

    expect(screen.getByText(/You:/)).toBeInTheDocument();
  });

  it('should apply selected styles when isSelected is true', () => {
    render(
      <ChatListItem chat={mockChat} isSelected={true} onClick={() => {}} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-current', 'true');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();

    render(
      <ChatListItem chat={mockChat} isSelected={false} onClick={handleClick} />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show "No messages yet" when lastMessage is null', () => {
    const chatWithNoMessages: Chat = { ...mockChat, lastMessage: null };

    render(
      <ChatListItem chat={chatWithNoMessages} isSelected={false} onClick={() => {}} />
    );

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });
});
