# Windi Messenger

Chat interface prototype with virtualized message list (5000+ messages), mock API services, and real-time WebSocket simulation.

**Live Demo:** [https://windi-messendger.vercel.app](https://windi-messendger.vercel.app)  
You can see the working chat interface directly in your browser.

## Quick Start

```bash
yarn install
yarn dev          # Development server at http://localhost:5173
yarn build        # Production build
yarn test         # Run tests in watch mode
yarn test:cov     # Run tests with coverage
```

## Technology Choices

### State Management: Zustand
**Why Zustand over Redux/MobX:**
- Minimal boilerplate — no actions, reducers, or providers needed
- Excellent TypeScript support with full type inference
- Simple API that scales well for medium-sized applications
- Easy integration with mock WebSocket (just call `addMessage()` from listener)
- Stores can communicate directly (`messageStore` updates `chatStore.lastMessage`)

### Virtualization: react-window
**Why react-window over react-virtualized:**
- Lightweight (6KB vs 30KB gzipped)
- Better performance with large datasets (5000+ messages)
- Modern API, easier to integrate
- Actively maintained by Brian Vaughn (React core team member)
- Supports variable height items and overscan

### Build Tool: Vite
**Why Vite over CRA/Webpack:**
- Blazing fast HMR (Hot Module Replacement)
- Modern ESM-first architecture
- Excellent TypeScript support out of the box
- Best developer experience for React 18+

### Styling: Tailwind CSS
**Why Tailwind over CSS-in-JS/SCSS:**
- Utility-first approach speeds up prototyping
- Small production bundle with automatic purging
- No runtime overhead (unlike styled-components)
- Consistent design system via configuration

### Why Not Next.js?
**Next.js strengths that don't apply to this chat app:**
- **SSR/SSG** - Chat messages are real-time, user-specific, and private (no SEO benefit)
- **Static optimization** - Content is dynamic and requires authentication
- **Image optimization** - Not an image-heavy application
- **File-based routing** - Single-page chat interface doesn't need complex routing

**What matters for chat app performance:**
- ✅ **Virtualization** (handled by react-window for 5000+ messages)
- ✅ **WebSocket optimization** (real-time message updates)
- ✅ **Optimistic updates** (instant UI feedback)
- ✅ **Efficient state management** (Zustand's minimal overhead)

**When you WOULD need Next.js:**
- Public marketing pages requiring SEO
- Blogs, documentation sites, or content-heavy sites
- E-commerce product pages benefiting from SSG
- Multi-page applications with complex routing needs

**Verdict:** Vite + React is more suitable for real-time chat applications. Next.js would add complexity without performance gains.

## Architecture

```
src/
├── api/                    # Mock services
│   ├── chatService.ts      # getChats(), getMessages(), sendMessage()
│   ├── mockData.ts         # Generates 5000+ messages per chat
│   └── websocket.ts        # Simulates real-time messages (every 3-7 sec)
├── components/
│   ├── chat/               # Feature components
│   │   ├── ChatList/       # Left sidebar
│   │   ├── MessageList/    # Virtualized message area
│   │   └── MessageInput/   # Input + send button
│   └── ui/                 # Reusable components
├── store/                  # Zustand stores
│   ├── chatStore.ts        # Chat list, selection, unread counts
│   └── messageStore.ts     # Messages, optimistic updates
├── hooks/                  # Custom hooks
├── types/                  # TypeScript interfaces
└── utils/                  # Helpers (formatters)
```

## Key Features

| Feature | Implementation |
|---------|----------------|
| Two-column layout | Sidebar (320px) + main area |
| Virtualized messages | react-window List with 5000+ items |
| Optimistic updates | Message appears instantly with `status: 'sending'` |
| WebSocket simulation | Random messages every 3-7 seconds |
| Unread badges | Auto-increment, reset on chat selection |
| Message alignment | User → right (blue), Others → left (gray) |

## Testing

- **117 tests** passing
- **76% coverage** (target: 80%)
- Tests co-located with source files (`*.test.ts`, `*.test.tsx`)

```bash
yarn test:cov     # View coverage report
```

## Performance

- **Virtualization**: Only visible messages rendered (react-window)
- **Memoization**: Store selectors prevent unnecessary re-renders
- **Lazy loading**: Messages fetched only when chat selected
- **Optimistic UI**: No waiting for server response on send
