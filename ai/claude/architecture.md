# ARCHITECTURE RULES

MAIN RULES:
- Layered structure: frontend, backend, shared libraries
- Frontend may depend on shared libraries; backend may depend on shared libs
- No circular dependencies between layers
- Forbidden imports listed in dependencies.md
- Each module has a clear boundary

MONOREPO:
- apps/cv-portfolio — main CV application
- apps/ui-kit — shared component library
- backend — Express server for AI chat API

BOUNDARIES:
- cv-portfolio may consume ui-kit
- ui-kit must NOT depend on cv-portfolio
- frontend must NOT call OpenAI directly
- backend is the only place allowed to talk to OpenAI API

FRONTEND RULES:
- Components split by responsibility
- No business logic in presentational components
- API calls live in api/services layer
- State management via Zustand only

UI KIT:
- Atomic design (atoms → molecules)
- No app-specific logic
- No routing, no side effects

BACKEND:
- Thin HTTP layer
- Validate all input