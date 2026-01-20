# ARCHITECTURE RULES — Windi Messenger

## Project Overview

Chat interface prototype with virtualized message list (5000+ messages), mock API services, and real-time WebSocket simulation.

## Folder Structure

```
src/
├── api/                    # Mock API layer
│   ├── chatService.ts      # getChats(), getMessages(), sendMessage()
│   ├── mockData.ts         # Generates 5000+ messages per chat
│   └── websocket.ts        # Mock WebSocket (sends every 3-7 sec)
├── components/
│   ├── chat/               # Feature components
│   │   ├── ChatList/       # Left column - chat sidebar
│   │   ├── MessageList/    # Right column - virtualized (react-window)
│   │   └── MessageInput/   # Input field + Send button
│   └── ui/                 # Reusable atoms (Avatar, Button, Input, Spinner)
├── store/                  # Zustand state management
│   ├── chatStore.ts        # Chats, selection, unread counts
│   └── messageStore.ts     # Messages per chat, optimistic updates
├── hooks/                  # Custom React hooks
│   ├── useChats.ts         # Chat list operations
│   ├── useMessages.ts      # Message operations
│   └── useWebSocket.ts     # WebSocket connection
├── types/                  # TypeScript interfaces
│   ├── chat.ts             # Chat interface
│   ├── message.ts          # Message interface
│   └── user.ts             # User interface + CURRENT_USER constant
└── utils/                  # Helper functions
    └── formatters.ts       # Date formatting, text truncation
```

## Data Flow

1. **App Mount** → `fetchChats()` → stores in `chatStore`
2. **Chat Selection** → `selectChat(id)` → triggers `fetchMessages(id)`
3. **Send Message** → optimistic add → API call → status updates (sending→sent→delivered→read)
4. **WebSocket** → `mockWebSocket.onMessage()` → `addMessage()` → updates store + increments unread

## Key Patterns

- **Optimistic Updates**: Messages appear immediately with `status: 'sending'`
- **Virtualization**: `react-window` List component for 5000+ messages
- **Message Alignment**: User messages right (blue), others left (gray)
- **Store Cross-Communication**: `messageStore` calls `chatStore.updateLastMessage()`

## Boundaries

- Components do NOT call API directly (use stores/hooks)
- Stores are the single source of truth
- UI components are presentational only
- Mock services simulate network latency (300-800ms)

---

## Architecture Decisions

### 1. Feature-Based Folder Structure

**Decision:** Co-locate components, tests, and index files in feature folders.

```
components/chat/ChatList/
  ├── ChatList.tsx
  ├── ChatListItem.tsx
  ├── ChatList.test.tsx
  └── index.ts
```

**Rationale:**

- Everything related to a feature is in one place
- Easier to delete/refactor entire features
- Tests live next to the code they test
- Scales better than file-type organization

### 2. Separate Stores (chatStore + messageStore)

**Decision:** Two communicating stores instead of one monolithic store.

```typescript
// messageStore calls chatStore
chatStore.updateLastMessage(chatId, message);
chatStore.incrementUnreadCount(chatId);
```

**Rationale:**

- **Single Responsibility**: Each store handles one domain
- **Performance**: Selecting from messageStore won't re-render chat list
- **Testability**: Stores can be tested in isolation
- **Scalability**: Easy to add userStore, settingsStore later

### 3. API Layer Abstraction

**Decision:** Separate API layer with mock implementations.

```
api/
  ├── chatService.ts    # Business methods
  ├── mockData.ts       # Data generation
  └── websocket.ts      # Real-time simulation
```

**Rationale:**

- Swap mocks with real API without touching components
- Mock entire service in tests
- Components don't know if data is mock or real

### 4. Custom Hooks as Facade

**Decision:** Hooks wrap store logic and side effects.

```typescript
function useMessages(chatId?: string) {
  const { messages, fetchMessages } = useMessageStore();
  useEffect(() => {
    if (chatId) fetchMessages(chatId);
  }, [chatId]);
  return { messages, ... };
}
```

**Rationale:**

- Hide store implementation from components
- Reuse same logic across multiple components
- Easier to mock one hook than multiple store calls

### 5. Shared Types Directory

**Decision:** Flat types folder with re-exports.

```
types/
  ├── chat.ts, message.ts, user.ts
  └── index.ts  # re-exports all
```

**Rationale:**

- Types are shared across stores, components, API
- Single source of truth for data contracts
- Simple imports: `import { Chat } from '../types'`

### 6. Pure Presentational UI Components

**Decision:** UI components have no business logic.

```typescript
function Avatar({ src, alt, size }: AvatarProps) {
  return <img ... />;
}
```

**Rationale:**

- Reusable anywhere (chat list, headers, etc.)
- Testable without mocking stores
- Single responsibility = render based on props

---

## Decision Summary Table

| Decision           | Principle              | Benefit                   |
| ------------------ | ---------------------- | ------------------------- |
| Feature folders    | Co-location            | Easier maintenance        |
| Split stores       | Single Responsibility  | Performance + testability |
| API abstraction    | Dependency Inversion   | Swappable backends        |
| Custom hooks       | Facade pattern         | Clean component code      |
| Shared types       | DRY                    | Type safety across app    |
| Pure UI components | Separation of concerns | Reusability               |
