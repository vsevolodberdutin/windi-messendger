import type { Chat, Message } from '../types';
import { MOCK_CHATS, getMockMessagesForChat } from './mockData';
import { nanoid } from 'nanoid';
import { CURRENT_USER } from '../types/user';

function simulateNetworkDelay(): Promise<void> {
  const delay = 300 + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function getChats(): Promise<Chat[]> {
  await simulateNetworkDelay();
  return [...MOCK_CHATS].sort(
    (a, b) => (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0)
  );
}

export async function getMessages(chatId: string): Promise<Message[]> {
  await simulateNetworkDelay();
  return getMockMessagesForChat(chatId);
}

export async function sendMessage(
  chatId: string,
  text: string
): Promise<Message> {
  await simulateNetworkDelay();

  const message: Message = {
    id: nanoid(),
    chatId,
    text,
    senderId: CURRENT_USER.id,
    timestamp: Date.now(),
    status: 'sent'
  };

  return message;
}

export async function markMessageAsDelivered(
  messageId: string
): Promise<{ messageId: string; status: 'delivered' }> {
  await simulateNetworkDelay();
  return { messageId, status: 'delivered' };
}

export async function markMessageAsRead(
  messageId: string
): Promise<{ messageId: string; status: 'read' }> {
  await simulateNetworkDelay();
  return { messageId, status: 'read' };
}
