import type { Message } from './message';

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: Message | null;
  unreadCount: number;
}
