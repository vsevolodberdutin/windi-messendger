# TESTING — Windi Messenger

## Stack
- **Runner**: Vitest (Jest-compatible, Vite-native)
- **DOM**: jsdom
- **Components**: @testing-library/react
- **User Events**: @testing-library/user-event
- **Coverage**: @vitest/coverage-v8

## Commands
```bash
yarn test           # Watch mode
yarn test:run       # Single run
yarn test:cov       # With coverage report
```

## Coverage Target: 80%+

## Current Coverage (117 tests)
| Area | Coverage |
|------|----------|
| Stores | 94.5% |
| Hooks | 100% |
| Components | 100% (tested) |
| Utils | 100% |
| API Services | 85% |

## Test File Locations
Tests are co-located with source files:
```
src/store/chatStore.test.ts
src/store/messageStore.test.ts
src/hooks/useChats.test.ts
src/hooks/useMessages.test.ts
src/hooks/useWebSocket.test.ts
src/components/chat/ChatList/ChatList.test.tsx
src/components/chat/ChatList/ChatListItem.test.tsx
src/components/chat/MessageList/MessageItem.test.tsx
src/components/chat/MessageInput/MessageInput.test.tsx
src/components/ui/Avatar.test.tsx
src/components/ui/Spinner.test.tsx
src/api/chatService.test.ts
src/api/websocket.test.ts
src/utils/formatters.test.ts
```

## Testing Patterns
- Mock Zustand stores with `vi.mock()`
- Use `vi.useFakeTimers()` for async/WebSocket tests
- Test optimistic updates by checking immediate state changes
- Test message alignment via CSS class assertions
