import { nanoid } from 'nanoid';
import type { Message } from '../types';
import { MOCK_USERS } from './mockData';
import { logError } from '../utils/logger';

type MessageCallback = (message: Message) => void;

const SAMPLE_INCOMING_MESSAGES = [
  "Hey, are you there?",
  "Just wanted to check in",
  "Got a minute to chat?",
  "Quick update for you",
  "FYI - meeting moved to 3pm",
  "Thanks for your help earlier!",
  "Did you see my email?",
  "Let me know when you're free",
  "Coffee later? ☕",
  "Great work on the project!",
  "Can we sync tomorrow?",
  "Just finished the review",
  "Looks good to me 👍",
  "One small change needed",
  "All done on my end"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

class MockWebSocket {
  private listeners: Set<MessageCallback> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isConnected = false;

  connect(): void {
    if (this.isConnected) return;

    this.isConnected = true;
    this.startRandomMessages();
  }

  disconnect(): void {
    if (!this.isConnected) return;

    this.isConnected = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startRandomMessages(): void {
    const sendRandomMessage = (): void => {
      if (!this.isConnected || MOCK_USERS.length === 0) return;

      const randomUser = getRandomElement(MOCK_USERS);
      const message: Message = {
        id: nanoid(),
        chatId: randomUser.id,
        text: getRandomElement(SAMPLE_INCOMING_MESSAGES),
        senderId: randomUser.id,
        timestamp: Date.now(),
        status: 'delivered'
      };

      this.notifyListeners(message);
    };

    const scheduleNextMessage = (): void => {
      const delay = 3000 + Math.random() * 4000;
      this.intervalId = setTimeout(() => {
        sendRandomMessage();
        if (this.isConnected) {
          scheduleNextMessage();
        }
      }, delay);
    };

    scheduleNextMessage();
  }

  private notifyListeners(message: Message): void {
    this.listeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        logError('Error in message listener', error, { component: 'WebSocket' });
      }
    });
  }

  onMessage(callback: MessageCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export const mockWebSocket = new MockWebSocket();
