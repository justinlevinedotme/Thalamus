# Thalamus Development Guide

## Architecture Overview

Thalamus is a monorepo with:
- `apps/web` - React frontend (Vite)
- `apps/api` - Cloudflare Workers API with BetterAuth

## Database: Cloudflare D1

The API uses Cloudflare D1 (SQLite) with Drizzle ORM.

### Database Configuration

- **D1 Database**: `thalamus-auth` (defined in `wrangler.toml`)
- **Schema**: `apps/api/src/lib/schema.ts`
- **Migrations**: `apps/api/migrations/`

### Running Migrations

```bash
# Local development
cd apps/api
npx wrangler d1 migrations apply thalamus-auth --local

# Staging
npx wrangler d1 migrations apply thalamus-auth --env staging

# Production
npx wrangler d1 migrations apply thalamus-auth --env production
```

### Querying D1 Directly

```bash
# Local
npx wrangler d1 execute thalamus-auth --local --command "SELECT * FROM ba_user"

# Production
npx wrangler d1 execute thalamus-auth --env production --command "SELECT * FROM ba_user"
```

## Authentication: BetterAuth with D1

Authentication uses BetterAuth with the Drizzle adapter configured for D1/SQLite.

### Key Configuration Notes

1. **Custom Table Names**: BetterAuth tables use `ba_` prefix (e.g., `ba_user`, `ba_session`)

2. **Field Mappings**: D1 uses camelCase column names. Explicit field mappings in `auth.ts` ensure BetterAuth matches the Drizzle schema:
   ```typescript
   user: {
     modelName: "ba_user",
     fields: {
       emailVerified: "emailVerified",
       twoFactorEnabled: "twoFactorEnabled",
       // ... other fields
     },
   }
   ```

3. **Schema Keys**: The drizzleAdapter schema uses custom modelNames as keys:
   ```typescript
   drizzleAdapter(db, {
     provider: "sqlite",
     usePlural: false,
     schema: {
       ba_user: schema.baUser,
       ba_session: schema.baSession,
       // ...
     },
   })
   ```

4. **twoFactor Plugin Requirement**: If using the `twoFactor` plugin, the user table MUST include a `twoFactorEnabled` column. This is a common source of `unable_to_create_user` errors.

5. **Drizzle Relations**: Required for the adapter - defined in `schema.ts` as `baUserRelations`, `baSessionRelations`, etc.

### Debugging Auth Issues

Use `wrangler tail` to capture production logs:
```bash
cd apps/api
npx wrangler tail thalamus-api --format json
```

Common errors:
- `unable_to_create_user`: Usually a schema mismatch - check that all required fields exist
- `Model X not found in DB`: Schema key mismatch in drizzleAdapter config

## Deployment

### GitHub Actions

CI/CD is configured in `.github/workflows/`:
- `deploy-staging.yml` - Deploys on push to dev/develop/staging branches and PRs to main
- `deploy-production.yml` - Deploys on push to main

Both workflows deploy the Worker. D1 migrations are run manually via wrangler or MCP.

### Manual Deployment

```bash
cd apps/api

# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

### Environment Variables

Required secrets in GitHub Actions:
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers and D1 permissions

Worker environment variables (set in Cloudflare dashboard or wrangler.toml):
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - API URL (e.g., https://api.thalamus.sh)
- `FRONTEND_URL` - Frontend URL (e.g., https://thalamus.sh)
- OAuth provider credentials (GITHUB_CLIENT_ID, etc.)

---

## System Documentation

### Master Index

```
Thalamus/
├── apps/
│   ├── api/                    # Cloudflare Workers API (Hono + D1)
│   │   ├── src/
│   │   │   ├── index.worker.ts # Entry point, middleware pipeline
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts     # BetterAuth configuration (309 lines)
│   │   │   │   ├── db.ts       # D1 database factory (42 lines)
│   │   │   │   ├── email.ts    # Resend email service
│   │   │   │   └── schema.ts   # Drizzle schema (162 lines)
│   │   │   ├── routes/
│   │   │   │   ├── graphs.ts   # Graph CRUD with quota (193 lines)
│   │   │   │   ├── share.ts    # Share link generation
│   │   │   │   ├── profile.ts  # User profile management
│   │   │   │   └── unsubscribe.ts
│   │   │   ├── middleware/
│   │   │   │   └── session.ts  # Auth session validation
│   │   │   └── emails/         # Email templates (React Email)
│   │   ├── migrations/         # D1 SQL migrations
│   │   └── wrangler.toml       # Cloudflare config
│   │
│   └── web/                    # React frontend (Vite + React Flow)
│       └── src/
│           ├── store/
│           │   ├── graphStore.ts      # Core editor state (1519 lines, 20 imports)
│           │   ├── authStore.ts       # Auth state wrapper (188 lines, 7 imports)
│           │   └── editorSettingsStore.ts
│           ├── lib/
│           │   ├── authClient.ts      # BetterAuth client (22 lines, 4 imports)
│           │   └── apiClient.ts       # Fetch wrapper (36 lines, 3 imports)
│           ├── features/
│           │   ├── cloud/             # Cloud sync
│           │   │   ├── graphApi.ts    # Graph API client (60 lines)
│           │   │   └── CloudPanel.tsx
│           │   ├── auth/              # Auth UI components
│           │   ├── graph/             # Graph editor
│           │   └── nodes/             # Node type components
│           ├── components/
│           │   └── ui/                # shadcn/ui components (70 imports)
│           └── pages/                 # Route pages
│
├── packages/                   # Shared packages (currently empty)
├── .github/workflows/          # CI/CD
└── turbo.json                  # Turborepo config
```

### Level 2: System Documentation

#### 1. Authentication System

**Location**: `apps/api/src/lib/auth.ts`, `apps/web/src/lib/authClient.ts`, `apps/web/src/store/authStore.ts`

**Purpose**: Full authentication with email/password, OAuth, 2FA, and session management.

**Server Components** (`auth.ts`):
- BetterAuth with Drizzle adapter for D1/SQLite
- OAuth: GitHub, Google, Apple, GitLab, Atlassian
- Plugins: twoFactor, haveIBeenPwned, captcha (Cloudflare Turnstile)
- Email verification with welcome emails
- Session: 7-day expiry, 1-day refresh, 5-min cookie cache

**Client Components** (`authClient.ts`):
```typescript
export const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: "/auth",
  plugins: [twoFactorClient()],
});
```

**State Management** (`authStore.ts`):
```typescript
type AuthState = {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  initialize: () => Promise<void>;
  signIn: (email, password, captchaToken?) => Promise<SignInResult>;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signUp: (email, password, captchaToken?) => Promise<boolean>;
  signOut: () => Promise<void>;
};
```

**Data Flow**:
```
Frontend authStore → authClient → /auth/* → BetterAuth → D1
```

#### 2. Data Storage System

**Location**: `apps/api/src/lib/db.ts`, `apps/api/src/lib/schema.ts`

**Purpose**: D1 SQLite database with Drizzle ORM.

**Database Factory** (`db.ts`):
```typescript
export function setD1(d1: D1Database): void     // Set binding per-request
export function getDb(): DrizzleD1Database      // Get Drizzle instance
export function resetDb(): void                 // Reset cache per-request
export { schema }
```

**Schema Tables** (`schema.ts`):
| Table | Purpose |
|-------|---------|
| `ba_user` | User accounts (id, email, emailVerified, twoFactorEnabled) |
| `ba_session` | Auth sessions (token, userId, expiresAt) |
| `ba_account` | OAuth accounts (providerId, accessToken) |
| `ba_verification` | Email verification tokens |
| `ba_two_factor` | 2FA secrets and backup codes |
| `graphs` | User diagrams (ownerId, title, data JSON) |
| `share_links` | Share tokens (graphId, token, expiresAt) |
| `profiles` | User quotas (plan, maxGraphs, retentionDays) |
| `email_preferences` | Marketing opt-outs |

#### 3. API Routing System

**Location**: `apps/api/src/index.worker.ts`, `apps/api/src/routes/*.ts`

**Purpose**: Hono-based REST API on Cloudflare Workers.

**Entry Point** (`index.worker.ts`):
```typescript
// Middleware pipeline
app.use("*", async (c, next) => {
  resetDb();
  setD1(c.env.DB);
  setAuthD1(c.env.DB);
  (globalThis as any).process = { env: c.env };
  await next();
});

// Routes
app.all("/auth/*", handler);    // BetterAuth passthrough
app.route("/graphs", graphs);   // CRUD with auth
app.route("/share", share);     // Public share access
app.route("/profile", profile);
```

**Route Contracts**:
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/auth/*` | ALL | No | BetterAuth handlers |
| `/graphs` | GET | Yes | List user graphs |
| `/graphs/:id` | GET/PUT/DELETE | Yes | Graph CRUD |
| `/graphs` | POST | Yes | Create (quota checked) |
| `/graphs/:id/share` | POST | Yes | Generate share link |
| `/share/:token` | GET | No | Get shared graph |

#### 4. Graph Editor System

**Location**: `apps/web/src/store/graphStore.ts`, `apps/web/src/features/graph/`, `apps/web/src/features/nodes/`

**Purpose**: Visual diagram editor using React Flow.

**State Store** (`graphStore.ts` - 1519 lines, 20 imports):
```typescript
export type GraphState = {
  // Data
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
  groups: NodeGroup[];
  graphTitle: string;

  // Selection & UI
  selectedNodes: string[];
  hoveredNodeId: string | null;
  isSelecting: boolean;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Actions (50+)
  addNode: (type, position, data) => void;
  updateNode: (id, data) => void;
  deleteNode: (id) => void;
  addEdge: (source, target, data) => void;
  // ... many more
};
```

**Node Types**: Event, Actor, System, State, Read Model, Command, Saga, Policy, Aggregate

**Key Features**:
- Undo/redo with full history
- Node grouping
- Custom edge labels
- Multiple selection
- Copy/paste/duplicate
- Auto-layout
- Export to JSON/PNG

#### 5. Cloud Sync System

**Location**: `apps/web/src/features/cloud/`

**Purpose**: Persist graphs to server with offline-first approach.

**API Client** (`graphApi.ts`):
```typescript
export async function listGraphs(): Promise<GraphRecord[]>
export async function getGraph(graphId: string): Promise<GraphRecord>
export async function createGraph(title, payload): Promise<GraphRecord>
export async function updateGraph(graphId, title, payload): Promise<GraphRecord>
export async function deleteGraph(graphId): Promise<void>
```

**Sync Flow**:
```
User edits → graphStore → CloudPanel → graphApi → /graphs/* → D1
                              ↓
                        debounced save (2s)
```

#### 6. Sharing System

**Location**: `apps/api/src/routes/share.ts`, `apps/api/src/routes/graphs.ts:157-190`

**Purpose**: Generate time-limited share links for read-only graph access.

**Flow**:
1. Owner calls `POST /graphs/:id/share`
2. Server generates UUID token, stores with 7-day expiry
3. Returns `{ token, expiresAt }`
4. Anyone with token calls `GET /share/:token`
5. Returns graph data (no auth required)

#### 7. Email System

**Location**: `apps/api/src/lib/email.ts`, `apps/api/src/emails/`

**Purpose**: Transactional and marketing emails via Resend.

**Templates** (React Email):
- `welcome.tsx` - Welcome after verification
- `confirmEmail.tsx` - Email verification
- `passwordReset.tsx` - Password reset link

**Categories**: `transactional` (always sent), `marketing` (respects preferences)

#### 8. UI Component System

**Location**: `apps/web/src/components/ui/`

**Purpose**: Shared UI primitives from shadcn/ui.

**Components** (70 total imports across codebase):
- `button`, `dialog`, `dropdown-menu`, `input`, `tooltip`
- `select`, `switch`, `tabs`, `checkbox`, `popover`
- `scroll-area`, `separator`, `slider`, `toast`

### Level 3: Critical Modules (3+ imports)

#### graphStore.ts (20 imports)

The central state store for the graph editor. Contains:
- All node/edge/group data
- 50+ actions for manipulation
- Full undo/redo history
- Selection state
- Style definitions

**Key exports**:
```typescript
export const useGraphStore: UseBoundStore<StoreApi<GraphState>>
export type RelationshipData = { label?: string; style?: EdgeStyle }
export type NodeGroup = { id, name, color, nodeIds[] }
export type NodeStyle = { fill, stroke, textColor, borderWidth, borderRadius }
export type EdgeStyle = { stroke, strokeWidth, animated, markerEnd }
export function getMarkerId(edgeStyle?: EdgeStyle): string
```

#### authStore.ts (7 imports)

Wraps BetterAuth client with Zustand for reactive state:
```typescript
export const useAuthStore: UseBoundStore<StoreApi<AuthState>>
export type OAuthProvider = "github" | "google" | "apple" | "gitlab" | "atlassian"
```

#### authClient.ts (4 imports)

BetterAuth client singleton:
```typescript
export const authClient: ReturnType<typeof createAuthClient>
export const { signIn, signUp, signOut, useSession, getSession, twoFactor, requestPasswordReset, changeEmail }
```

#### apiClient.ts (3 imports)

Generic fetch wrapper with credentials:
```typescript
export class ApiError extends Error { status: number }
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
```

#### db.ts (4 imports)

D1 connection factory:
```typescript
export function setD1(d1: D1Database): void
export function getDb(): DrizzleD1Database<typeof schema>
export function resetDb(): void
export { schema }
```

### Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  pages/* ──┬── features/graph/* ───── store/graphStore ◄────────┤
│            │                                  │                  │
│            ├── features/auth/* ──────── store/authStore ◄───────┤
│            │                                  │                  │
│            └── features/cloud/* ─────── lib/authClient ◄────────┤
│                      │                                           │
│                      └─────────────── lib/apiClient ◄────────────┤
│                                              │                   │
├──────────────────────────────────────────────┼───────────────────┤
│                     HTTP (credentials: include)                  │
├──────────────────────────────────────────────┼───────────────────┤
│                        Backend (Hono)         │                  │
├──────────────────────────────────────────────┼───────────────────┤
│  index.worker.ts                             ▼                   │
│       │                              /auth/*  ───► lib/auth      │
│       │                                              │           │
│       ├── routes/graphs.ts ──────────────────────────┤           │
│       ├── routes/share.ts ───────────────────────────┤           │
│       ├── routes/profile.ts ─────────────────────────┤           │
│       │                                              │           │
│       └── middleware/session.ts ─────────────────────┤           │
│                                                      ▼           │
│                                              lib/db ────► D1     │
│                                                 │                │
│                                              lib/schema          │
└─────────────────────────────────────────────────────────────────┘
```

---

<!-- CLAVIX:START -->
## Clavix Integration

This project uses Clavix for prompt improvement and PRD generation. The following slash commands are available:

> **Command Format:** Commands shown with colon (`:`) format. Some tools use hyphen (`-`): Claude Code uses `/clavix:improve`, Cursor uses `/clavix-improve`. Your tool autocompletes the correct format.

### Prompt Optimization

#### /clavix:improve [prompt]
Optimize prompts with smart depth auto-selection. Clavix analyzes your prompt quality and automatically selects the appropriate depth (standard or comprehensive). Use for all prompt optimization needs.

### PRD & Planning

#### /clavix:prd
Launch the PRD generation workflow. Clavix will guide you through strategic questions and generate both a comprehensive PRD and a quick-reference version optimized for AI consumption.

#### /clavix:plan
Generate an optimized implementation task breakdown from your PRD. Creates a phased task plan with dependencies and priorities.

#### /clavix:implement
Execute tasks or prompts with AI assistance. Auto-detects source: tasks.md (from PRD workflow) or prompts/ (from improve workflow). Supports automatic git commits and progress tracking.

Use `--latest` to implement most recent prompt, `--tasks` to force task mode.

### Session Management

#### /clavix:start
Enter conversational mode for iterative prompt development. Discuss your requirements naturally, and later use `/clavix:summarize` to extract an optimized prompt.

#### /clavix:summarize
Analyze the current conversation and extract key requirements into a structured prompt and mini-PRD.

### Refinement

#### /clavix:refine
Refine existing PRD or prompt through continued discussion. Detects available PRDs and saved prompts, then guides you through updating them with tracked changes.

### Agentic Utilities

These utilities provide structured workflows for common tasks. Invoke them using the slash commands below:

- **Verify** (`/clavix:verify`): Check implementation against PRD requirements. Runs automated validation and generates pass/fail reports.
- **Archive** (`/clavix:archive`): Archive completed work. Moves finished PRDs and outputs to archive for future reference.

**When to use which mode:**
- **Improve mode** (`/clavix:improve`): Smart prompt optimization with auto-depth selection
- **PRD mode** (`/clavix:prd`): Strategic planning with architecture and business impact

**Recommended Workflow:**
1. Start with `/clavix:prd` or `/clavix:start` for complex features
2. Refine requirements with `/clavix:refine` as needed
3. Generate tasks with `/clavix:plan`
4. Implement with `/clavix:implement`
5. Verify with `/clavix:verify`
6. Archive when complete with `/clavix:archive`

**Pro tip**: Start complex features with `/clavix:prd` or `/clavix:start` to ensure clear requirements before implementation.
<!-- CLAVIX:END -->
