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
- **State**: React Context (SessionContext, ConversationContext)
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
/init/user              POST   - Initialize user, load default config
/init/tree/{conv_id}    POST   - Create new conversation tree
/user/config            GET    - Get current user config (in-memory)
/user/config/list       GET    - List all saved configs
/user/config/new        POST   - Create new config (returns ID)
/user/config/{id}       POST   - Save config to Weaviate
/user/config/{id}/load  GET    - Load config from Weaviate
/tree/config/{conv_id}  GET    - Get conversation-specific config
/ws/query               WS     - Query processing websocket
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
  ├─> POST /user/config/new (creates config object)
  └─> POST /user/config/{id} (persists to Weaviate)
      └─> GET /user/config/list (refresh list)
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

### Frontend
```
app/components/contexts/
├── SessionContext.tsx          # User config management
└── ConversationContext.tsx     # Conversation/tree management

app/pages/
├── ChatPage.tsx                # Main chat interface
└── SettingsPage.tsx            # Config editor

app/api/
├── createConfig.ts             # POST /user/config/new
├── saveConfig.ts               # POST /user/config/{id}
├── getConfigList.ts            # GET /user/config/list
└── initializeTree.ts           # POST /init/tree/{id}

app/types/
├── objects.ts                  # BackendConfig, FrontendConfig
└── payloads.ts                 # API response types
```

### Backend
```
elysia/api/routes/
├── init.py                     # User + tree initialization
├── user_config.py              # Config CRUD operations
├── tree_config.py              # Per-conversation configs
├── query.py                    # WebSocket query handler
└── processor.py                # WebSocket response streaming

elysia/api/services/
├── user.py                     # UserManager class
└── tree.py                     # TreeManager class

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

## Common Issues & Fixes

### Issue: New chats use old config
**Cause**: Backend `/init/tree` wasn't loading default config
**Fix**: Added `get_default_config()` call before tree creation (init.py:171-189)

### Issue: Created config doesn't appear in sidebar
**Cause**: Frontend wasn't persisting config to Weaviate after creation
**Fix**: Added auto-save step in `SessionContext.handleCreateConfig()` (SessionContext.tsx:319-332)

### Issue: Config ID is null when saving
**Cause**: Trying to save unpersisted config
**Fix**: Added null check in `saveConfig()` (saveConfig.ts:22-30)

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

### Collections
Vector databases that agents can query (e.g., document collections in Weaviate)

### Config Persistence
- **In-memory**: UserManager holds current config
- **Persisted**: Weaviate stores all saved configs
- **Snapshot**: Each conversation stores its config independently

## Authentication
Clerk JWT tokens in Authorization header:
```
Authorization: Bearer eyJhbGc...
```

Backend validates via Clerk PEM key (middleware: `ClerkAuthMiddleware`)
