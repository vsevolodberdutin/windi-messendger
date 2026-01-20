import { nanoid } from 'nanoid';
import type { Chat, Message, User } from '../types';
import { CURRENT_USER } from '../types/user';

const SAMPLE_MESSAGES = [
  "Hey, how's it going?",
  "Did you see the new update?",
  "That sounds great!",
  "I'll check it out later",
  "Thanks for letting me know",
  "Can we schedule a call?",
  "Perfect, that works for me",
  "Let me think about it",
  "Sure, I can do that",
  "What time works for you?",
  "Just finished the task",
  "The meeting went well",
  "Can you send me the file?",
  "I'll be there in 10 minutes",
  "Let's grab lunch tomorrow",
  "Have you heard back yet?",
  "That's hilarious 😂",
  "Congrats on the promotion!",
  "Happy birthday! 🎉",
  "See you soon!",
  "Working on it now",
  "Almost done with the project",
  "Need more time for this",
  "Can you review my PR?",
  "LGTM! 👍",
  "Let's discuss this tomorrow",
  "Good morning!",
  "Good night! 🌙",
  "On my way",
  "Running a bit late",
  "Just saw your message",
  "That makes sense",
  "I agree with you",
  "Not sure about that",
  "Let me check and get back to you",
  "Thanks for your help!",
  "No problem at all",
  "Sounds like a plan",
  "Count me in!",
  "I'll pass on this one",
  "Can you explain more?",
  "Got it, thanks!",
  "Will do!",
  "Already on it",
  "Just a heads up",
  "FYI",
  "Quick question",
  "Any updates?",
  "All good here",
  "Take your time"
];

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Quinn', 'Avery', 'Charlie', 'Drew',
  'Emery', 'Finley', 'Harper', 'Jamie', 'Kendall',
  'Logan', 'Madison', 'Peyton', 'Reese', 'Skyler'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomUser(index: number): User {
  const firstName = getRandomElement(FIRST_NAMES);
  const lastName = getRandomElement(LAST_NAMES);
  const id = `user-${index}`;

  return {
    id,
    name: `${firstName} ${lastName}`,
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`,
    isOnline: Math.random() > 0.5
  };
}

export function generateMockUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => generateRandomUser(i + 1));
}

export function generateMockMessages(
  chatId: string,
  otherUserId: string,
  count: number
): Message[] {
  const messages: Message[] = [];
  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const startTime = now - 30 * MS_PER_DAY;

  for (let i = 0; i < count; i++) {
    const isCurrentUser = Math.random() > 0.5;
    const timestamp = startTime + ((now - startTime) * i) / count;

    messages.push({
      id: nanoid(),
      chatId,
      text: getRandomElement(SAMPLE_MESSAGES),
      senderId: isCurrentUser ? CURRENT_USER.id : otherUserId,
      timestamp,
      status: 'read'
    });
  }

  return messages;
}

export function generateMockChats(users: User[]): Chat[] {
  return users.map((user) => {
    const lastMessageTime = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;
    const isCurrentUserMessage = Math.random() > 0.5;

    const lastMessage: Message = {
      id: nanoid(),
      chatId: user.id,
      text: getRandomElement(SAMPLE_MESSAGES),
      senderId: isCurrentUserMessage ? CURRENT_USER.id : user.id,
      timestamp: lastMessageTime,
      status: 'read'
    };

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      lastMessage,
      unreadCount: Math.floor(Math.random() * 5)
    };
  });
}

export const MOCK_USERS = generateMockUsers(15);
export const MOCK_CHATS = generateMockChats(MOCK_USERS);

const messagesCache: Record<string, Message[]> = {};

export function getMockMessagesForChat(chatId: string): Message[] {
  if (!messagesCache[chatId]) {
    const messageCount = 5000 + Math.floor(Math.random() * 500);
    messagesCache[chatId] = generateMockMessages(chatId, chatId, messageCount);
  }
  return messagesCache[chatId];
}
