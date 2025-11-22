# Elysia Project Structure

## Overview
Elysia is a conversational AI system with a Next.js frontend and FastAPI backend. The backend manages AI model interactions, decision trees, and user configurations stored in Weaviate.

## Repository Locations

### Frontend (this repo)
```
../elysia-frontend/
```
- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk
- **State**: React Context (11 providers)
- **API Client**: `lib/api/client.ts`

### Backend
```
../elysia/
```
- **Framework**: FastAPI (Python)
- **DB**: Weaviate (vector DB for configs and conversation trees)
- **Port**: `http://localhost:8000`

## Architecture

### API Communication
Frontend → Backend via REST + WebSocket
- REST: Config management, user initialization, tree operations
- WebSocket: Live query processing and streaming responses

### Key Backend Routes
```
/init/user                      POST   - Initialize user, load default config
/init/tree/{conv_id}            POST   - Create new conversation tree
/api/config                     GET    - Get current user config (in-memory)
/api/config/models              GET    - Get available AI models
/api/config/list                GET    - List all saved configs
/api/config/new                 POST   - Create new config (returns ID)
/api/config/{id}                POST   - Save config to Weaviate
/api/config/{id}/load           GET    - Load config from Weaviate
/api/config/{id}                DELETE - Delete config from Weaviate
/tree/config/{conv_id}          GET    - Get conversation-specific config
/ws/query                       WS     - Query processing websocket
/api/dashboard/kpis             GET    - Dashboard KPIs (filtered)
/api/dashboard/deviations       GET    - Dashboard deviation records
/api/dashboard/metadata         GET    - Dashboard metadata (projects, workflows, etc.)
/api/dashboard/cache/invalidate POST   - Invalidate dashboard cache
```

### State Hierarchy

**User → Configs → Conversations**

1. **User Session** (`UserManager`)
   - One active config at a time (in-memory)
   - Affects all new conversations

2. **Configs** (Weaviate: `ELYSIA_CONFIG__`)
   - Stored configs with `default: bool` flag
   - Contains: models, API keys, style, agent description
   - One marked as default per user

3. **Conversations** (Weaviate: `ELYSIA_TREE__`)
   - Each conversation snapshots config at creation time
   - Independent from user's current config

## Critical Code Paths

### Config Creation Flow
```
Frontend: SessionContext.handleCreateConfig()
  ├─> POST /api/config/new (creates config object)
  └─> POST /api/config/{id} (persists to Weaviate)
      └─> GET /api/config/list (refresh list)
```

### New Conversation Flow
```
Frontend: ConversationContext.addConversation()
  └─> POST /init/tree/{conversation_id}
      ├─> Loads default config (if exists)
      ├─> Updates user session config
      └─> Creates tree with that config
```

### Default Config Logic
```python
# Backend: elysia/api/routes/init.py
async def get_default_config():
    # Queries Weaviate for config where:
    # - default == True
    # - user_id == current_user
    # Returns first match
```

## Important Files

### Frontend Structure

#### React Contexts (11 providers)
```
app/components/contexts/
├── SessionContext.tsx          # User config management, API key handling
├── ConversationContext.tsx     # Conversation/tree management, message history
├── SocketContext.tsx           # WebSocket connection management
├── ChatContext.tsx             # Active conversation state
├── ProcessingContext.tsx       # Query processing state
├── RouterContext.tsx           # Client-side routing (page navigation)
├── DisplayContext.tsx          # UI display preferences
├── ThemeContext.tsx            # Theme management (light/dark)
├── CollectionContext.tsx       # Weaviate collection management
├── EvaluationContext.tsx       # Model evaluation state
└── ToastContext.tsx            # Toast notification system
```

#### Pages (8 routes)
```
app/pages/
├── ChatPage.tsx                # Main chat interface with decision tree visualization
├── DashboardPage.tsx           # Analytics dashboard (cost/delay analysis)
├── SettingsPage.tsx            # Config editor (models, API keys, agent settings)
├── DisplayPage.tsx             # Conversation display/review
├── CollectionPage.tsx          # Weaviate collection browser
├── DataPage.tsx                # Data exploration interface
├── EvalPage.tsx                # Model evaluation tools
└── FeedbackPage.tsx            # User feedback collection
```

#### API Clients
```
app/api/
├── getModels.ts                # GET /api/config/models
├── getConfig.ts                # GET /api/config
├── createConfig.ts             # POST /api/config/new
├── saveConfig.ts               # POST /api/config/{id}
├── loadConfig.ts               # GET /api/config/{id}/load
├── deleteConfig.ts             # DELETE /api/config/{id}
├── getConfigList.ts            # GET /api/config/list
├── initializeTree.ts           # POST /init/tree/{id}
├── getDashboardKPIs.ts         # GET /api/dashboard/kpis
├── getDashboardDeviations.ts  # GET /api/dashboard/deviations
├── getDashboardMetadata.ts    # GET /api/dashboard/metadata
└── [20+ more endpoints]
```

#### Type System
```
app/types/
├── objects.ts                  # Core types (BackendConfig, FrontendConfig, User, etc.)
├── payloads.ts                 # API request/response types
└── dashboard.ts                # Dashboard-specific types (KPIs, deviations, filters)

Type Hierarchy:
- objects.ts: Foundation types shared across app
- payloads.ts: Extends objects.ts with API-specific shapes
- dashboard.ts: Domain-specific types for analytics
```

#### Other Key Files
```
app/components/
├── layouts/AuthenticatedLayout.tsx  # Clerk auth wrapper for all pages
├── chat/                            # Chat UI components
│   ├── components/                  # Shared chat components
│   ├── displays/                    # Message display types
│   └── nodes/                       # Flow node components (@xyflow/react)
├── dashboard/                       # Dashboard chart components (8 charts)
├── configuration/                   # Config management UI
└── navigation/                      # Sidebar, navigation components

lib/
├── api/client.ts                    # Base API client with auth
├── constants.ts                     # App-wide constants
└── utils.ts                         # Utility functions

docs/
└── DASHBOARD_ARCHITECTURE.md        # Detailed dashboard architecture
```

### Backend
```
elysia/api/routes/
├── init.py                     # User + tree initialization
├── user_config.py              # Config CRUD operations (mounted at /api/config)
├── tree_config.py              # Per-conversation configs
├── query.py                    # WebSocket query handler
├── processor.py                # WebSocket response streaming
└── dashboard.py                # Dashboard API endpoints

elysia/api/services/
├── user.py                     # UserManager class
├── tree.py                     # TreeManager class
└── dashboard_queries.py        # Dashboard data aggregation

elysia/config.py                # Settings (models, API keys)
elysia/util/client.py           # ClientManager (model connections)
```

## Environment Setup

### Frontend `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Backend `.env`
```bash
CLERK_PEM_PUBLIC_KEY="..."
WCD_URL=https://...             # Weaviate cluster
WCD_API_KEY=...                 # Weaviate API key
CLIENT_TIMEOUT=3
TREE_TIMEOUT=10
```

## Development Commands

### Frontend
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
```

### Backend
```bash
cd elysia/
python -m elysia.api.app  # Start FastAPI server (port 8000)
```

## WebSocket Protocol

### Query Request
```json
{
  "query": "user question",
  "conversation_id": "uuid",
  "enabled_collections": {"collection_name": true}
}
```

### Response Stream
```json
{"type": "node_update", "data": {...}}
{"type": "query_complete", "data": {...}}
{"type": "error", "data": {...}}
```

## Key Concepts

### Decision Tree
Each conversation is a tree of nodes representing:
- User queries
- Agent decisions
- Search operations
- Results

Visualized using @xyflow/react with dagre layout.

### Collections
Vector databases that agents can query (e.g., document collections in Weaviate). Managed via CollectionContext and CollectionPage.

### Config Persistence
- **In-memory**: UserManager holds current config
- **Persisted**: Weaviate stores all saved configs
- **Snapshot**: Each conversation stores its config independently

### Dashboard Analytics
Analytics dashboard for cost and delay analysis across projects. See `docs/DASHBOARD_ARCHITECTURE.md` for:
- Detailed architecture and data flow
- KPI calculations and aggregations
- Caching strategy (2-hour TTL, project-scoped)
- Filter system (date ranges, projects)
- Chart components and their data sources

## Authentication

### Flow
```
1. User signs in via Clerk (browser)
2. Clerk issues JWT token
3. Frontend includes token in all API requests: Authorization: Bearer <token>
4. Backend ClerkAuthMiddleware validates token using PEM key
5. User ID extracted from token, used for data isolation
```

### Implementation
- Frontend: `@clerk/nextjs` with `AuthenticatedLayout` wrapper
- Backend: `ClerkAuthMiddleware` in FastAPI
- All protected routes require valid Clerk JWT

### Admin Access Control

Admin functionality is controlled via Clerk organization metadata:

**Admin Check Logic** (`lib/utils/checkIsAdmin.ts`):
```typescript
organization.publicMetadata.admin === true
```

**Admin-Only Pages** (`lib/constants/adminPages.ts`):
- `data` - Data exploration interface
- `collection` - Weaviate collection browser
- `settings` - Config editor
- `eval` - Model evaluation tools
- `feedback` - User feedback collection
- `elysia` - System admin page
- `display` - Conversation display/review

**Public Pages** (no admin required):
- `dashboard` - Analytics dashboard
- `chat` - Main chat interface

**Enforcement**:
- Next.js middleware (`middleware.ts`) checks organization metadata before allowing page access
- Non-admin users attempting to access admin pages are redirected to chat page
- Client-side routing (`RouterContext`) also checks admin status for UI control