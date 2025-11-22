# Elysia Frontend

BuildRight.ai risk management and analytics platform frontend.

## Architecture

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Backend**: FastAPI (Python) at `http://localhost:8000`
- **Database**: Weaviate (vector DB)
- **Auth**: Clerk (JWT-based)
- **Communication**: REST + WebSocket

## Prerequisites

- Node.js 18+
- Running Elysia backend (`../elysia/`)
- Clerk account and API keys
- Weaviate cluster (backend manages this)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment (`.env.local`):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

3. Start backend:
   ```bash
   cd ../elysia
   python -m elysia.api.app
   ```

4. Start frontend:
   ```bash
   npm run dev
   ```
   Access at `http://localhost:3000`

## Development

```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Production build
npm run lint   # ESLint
```

## Documentation

- [CLAUDE.md](CLAUDE.md) - Complete architecture reference (API routes, state management, file structure, authentication)
- [Dashboard Architecture](docs/DASHBOARD_ARCHITECTURE.md) - Analytics dashboard design details
- Backend docs: `../elysia/README.md`
