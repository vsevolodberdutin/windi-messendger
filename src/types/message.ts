export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  chatId: string;
  text: string;
  senderId: string;
  timestamp: number;
  status: MessageStatus;
}
