# DEPENDENCIES — Windi Messenger

## Core Stack
| Category | Choice | Justification |
|----------|--------|---------------|
| Framework | React 18+ | Required by task |
| Language | TypeScript (strict) | Required by task |
| Build Tool | Vite | Fast HMR, ESM-first, best DX |
| State Management | Zustand | Minimal boilerplate, excellent TS support |
| Virtualization | react-window v2 | Lightweight (6KB), React core team maintained |
| Styling | Tailwind CSS v4 | Utility-first, fast prototyping, small bundle |
| Testing | Vitest + RTL | Fast, Vite-native, Jest-compatible |

## Production Dependencies
```
react, react-dom      - UI framework
zustand               - State management
react-window          - List virtualization
date-fns              - Date formatting
nanoid                - Unique ID generation
```

## Dev Dependencies
```
vite                  - Build tool
typescript            - Type checking
tailwindcss           - Styling
vitest                - Test runner
@testing-library/*    - Component testing
@vitest/coverage-v8   - Coverage reports
eslint                - Linting
```

## Forbidden
- Redux (overkill for this scope)
- Axios (fetch is sufficient)
- Moment.js (use date-fns instead)
- Any CSS-in-JS libraries (Tailwind is preferred)
