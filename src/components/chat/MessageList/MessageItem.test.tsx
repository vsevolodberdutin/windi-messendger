import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageItem } from './MessageItem';
import type { Message } from '../../../types';

describe('MessageItem', () => {
  const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'msg-1',
    chatId: 'chat-1',
    text: 'Test message',
    senderId: 'other-user',
    timestamp: Date.now(),
    status: 'read',
    ...overrides
  });

  it('should render message text', () => {
    const message = createMessage({ text: 'Hello, World!' });

    render(<MessageItem message={message} style={{}} />);

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should align own messages to the right', () => {
    const message = createMessage({ senderId: 'current-user' });

    const { container } = render(<MessageItem message={message} style={{}} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('justify-end');
  });

  it('should align other messages to the left', () => {
    const message = createMessage({ senderId: 'other-user' });

    const { container } = render(<MessageItem message={message} style={{}} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('justify-start');
  });

  it('should apply blue background for own messages', () => {
    const message = createMessage({ senderId: 'current-user' });

    render(<MessageItem message={message} style={{}} />);

    const bubble = screen.getByText('Test message').closest('div');
    expect(bubble).toHaveClass('bg-blue-500');
  });

  it('should apply white background for other messages', () => {
    const message = createMessage({ senderId: 'other-user' });

    render(<MessageItem message={message} style={{}} />);

    const bubble = screen.getByText('Test message').closest('div');
    expect(bubble).toHaveClass('bg-white');
  });

  it('should show sending status', () => {
    const message = createMessage({ senderId: 'current-user', status: 'sending' });

    render(<MessageItem message={message} style={{}} />);

    expect(screen.getByText('○')).toBeInTheDocument();
  });

  it('should show sent status', () => {
    const message = createMessage({ senderId: 'current-user', status: 'sent' });

    render(<MessageItem message={message} style={{}} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should show delivered status', () => {
    const message = createMessage({ senderId: 'current-user', status: 'delivered' });

    render(<MessageItem message={message} style={{}} />);

    expect(screen.getByText('✓✓')).toBeInTheDocument();
  });

  it('should show read status with blue color', () => {
    const message = createMessage({ senderId: 'current-user', status: 'read' });

    render(<MessageItem message={message} style={{}} />);

    const statusElement = screen.getByText('✓✓');
    expect(statusElement).toHaveClass('text-blue-200');
  });

  it('should not show status for other users messages', () => {
    const message = createMessage({ senderId: 'other-user', status: 'read' });

    render(<MessageItem message={message} style={{}} />);

    expect(screen.queryByText('✓✓')).not.toBeInTheDocument();
  });

  it('should apply passed style prop', () => {
    const message = createMessage();
    const customStyle = { height: 100, top: 50 };

    const { container } = render(<MessageItem message={message} style={customStyle} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ height: '100px', top: '50px' });
  });
});
