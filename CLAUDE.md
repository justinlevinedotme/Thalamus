# CLAUDE.md - Thalamus Development Guide

> **Purpose**: This file provides context and instructions for AI coding assistants working on this project.

---

## Project Overview

**Project Name**: Thalamus
**Description**: Visual diagram editor for event-driven architecture modeling with React Flow, backed by Cloudflare Workers API
**Tech Stack**: React 18, TypeScript, Vite, Hono, Cloudflare D1, Drizzle ORM, BetterAuth
**Repository**: Monorepo with Turborepo

### Quick Start

```bash
# Install dependencies (from root)
npm install

# Run development (both apps) - just works!
npm run dev

# First time? Set up local database with test data:
cd apps/api
npm run db:migrate:local    # Apply migrations
npm run db:seed             # Create test user + sample graphs

# Run individual apps
cd apps/web && npm run dev    # Frontend at localhost:5173
cd apps/api && npm run dev    # API at localhost:8787

# Build
npm run build
```

**Test Credentials** (after seeding):

- Email: `admin@admin.com`
- Password: `root123`

---

## Git Workflow

**Branch Protection**: Direct pushes to `main` are not allowed. All changes must go through pull requests.

### Branch Naming Convention

Branches must follow the pattern: `type/description` (alphanumeric + hyphens)

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`, `hotfix`, `claude`

**Examples**:

- `feat/add-export-button`
- `fix/auth-session-bug`
- `claude/code-review-ABC123` (session IDs with mixed case allowed)

### Commit Message Convention

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type: description
```

**Examples**:

- `feat: add graph export functionality`
- `fix: resolve session timeout issue`
- `claude: update CLAUDE.md configuration`

### PR Workflow

1. Create a branch following the naming convention
2. Make commits following the message convention
3. Open a PR - title must match commit format: `type: description`
4. PR checks run automatically (commitlint, branch naming, PR title)
5. PRs are auto-labeled based on type (e.g., `feat`, `fix`, `claude`)

---

## Architecture Overview

```
Thalamus/
├── apps/
│   ├── api/                    # Cloudflare Workers API (Hono + D1)
│   │   ├── src/
│   │   │   ├── index.worker.ts # Entry point, middleware pipeline
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts     # BetterAuth configuration
│   │   │   │   ├── db.ts       # Database factory (D1 prod, SQLite local)
│   │   │   │   ├── email.ts    # Resend email service
│   │   │   │   └── schema.ts   # Drizzle schema
│   │   │   ├── routes/         # API route handlers
│   │   │   ├── middleware/     # Auth session validation
│   │   │   └── emails/         # Email templates (React Email)
│   │   ├── migrations/         # D1 SQL migrations
│   │   └── wrangler.toml       # Cloudflare config
│   │
│   └── web/                    # React frontend (Vite + React Flow)
│       └── src/
│           ├── store/          # Zustand state (graphStore, authStore)
│           ├── lib/            # API clients, utilities
│           ├── features/       # Feature modules (auth, cloud, graph, nodes)
│           ├── components/ui/  # shadcn/ui components
│           └── routes/         # Route pages
│
├── packages/                   # Shared packages (currently empty)
├── .github/workflows/          # CI/CD (production only)
└── turbo.json                  # Turborepo config
```

---

## Role-Based Instructions

Use these context keywords to activate specialized behavior.

### `/backend` - API Development

**Focus**: `apps/api/` - Hono routes, D1 database, BetterAuth

**Key Files**:

- `src/index.worker.ts` - Entry point, middleware
- `src/lib/auth.ts` - BetterAuth config (OAuth, 2FA, sessions)
- `src/lib/schema.ts` - Drizzle schema definitions
- `src/routes/*.ts` - API endpoints

**Before Starting**:

1. Check existing route patterns in `src/routes/`
2. Review schema in `src/lib/schema.ts`
3. Understand auth middleware in `src/middleware/session.ts`

**API Endpoints**:
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/auth/*` | ALL | No | BetterAuth handlers |
| `/graphs` | GET/POST | Yes | List/create graphs |
| `/graphs/:id` | GET/PUT/DELETE | Yes | Graph CRUD |
| `/graphs/:id/share` | POST | Yes | Generate share link |
| `/share/:token` | GET | No | Get shared graph |
| `/profile` | GET/PUT | Yes | User profile/quotas |

---

### `/frontend` - React Development

**Focus**: `apps/web/` - React Flow editor, shadcn/ui components

**Key Files**:

- `src/store/graphStore.ts` - Central state (nodes, edges, history)
- `src/store/authStore.ts` - Auth state wrapper
- `src/features/graph/` - Editor components
- `src/features/nodes/` - Node type components
- `src/components/ui/` - shadcn/ui primitives

**Before Starting**:

1. Check component patterns in `src/components/ui/`
2. Review graphStore for state management patterns
3. Understand React Flow integration in `src/features/graph/`

**Node Types**: Event, Actor, System, State, Read Model, Command, Saga, Policy, Aggregate

---

### `/fullstack` - End-to-End Features

**Workflow**:

1. Design schema changes in `apps/api/src/lib/schema.ts`
2. Create migration in `apps/api/migrations/`
3. Implement API route in `apps/api/src/routes/`
4. Build frontend components in `apps/web/src/features/`
5. Connect via API client in `apps/web/src/lib/apiClient.ts`

---

## Database: Cloudflare D1

### Configuration

- **D1 Database**: `thalamus-auth` (defined in `wrangler.toml`)
- **Schema**: `apps/api/src/lib/schema.ts`
- **Migrations**: `apps/api/migrations/`

### Schema Tables

| Table               | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `ba_user`           | User accounts (id, email, emailVerified, twoFactorEnabled) |
| `ba_session`        | Auth sessions (token, userId, expiresAt)                   |
| `ba_account`        | OAuth accounts (providerId, accessToken)                   |
| `ba_verification`   | Email verification tokens                                  |
| `ba_two_factor`     | 2FA secrets and backup codes                               |
| `graphs`            | User diagrams (ownerId, title, data JSON)                  |
| `share_links`       | Share tokens (graphId, token, expiresAt)                   |
| `profiles`          | User quotas (plan, maxGraphs, retentionDays)               |
| `email_preferences` | Marketing opt-outs                                         |

### Running Migrations

**Local Development** (SQLite):

```bash
cd apps/api

# Generate migration from schema changes
npm run db:generate

# Apply migrations to local.db
npm run db:migrate:local

# Seed test data (test user + sample graphs)
npm run db:seed

# Browse local database
npm run db:studio
```

**Production** (Cloudflare D1):

```bash
cd apps/api
npx wrangler d1 migrations apply thalamus-auth --env production
```

### Querying D1 Directly

```bash
# Local
npx wrangler d1 execute thalamus-auth --local --command "SELECT * FROM ba_user"

# Production
npx wrangler d1 execute thalamus-auth --env production --command "SELECT * FROM ba_user"
```

---

## Authentication: BetterAuth

### Key Configuration Notes

1. **Custom Table Names**: BetterAuth tables use `ba_` prefix (e.g., `ba_user`, `ba_session`)

2. **Field Mappings**: D1 uses camelCase column names. Explicit field mappings in `auth.ts`:

   ```typescript
   user: {
     modelName: "ba_user",
     fields: {
       emailVerified: "emailVerified",
       twoFactorEnabled: "twoFactorEnabled",
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
     },
   });
   ```

4. **twoFactor Plugin**: User table MUST include `twoFactorEnabled` column. Common source of `unable_to_create_user` errors.

5. **OAuth Providers**: GitHub, Google, Apple, GitLab, Atlassian

### Debugging Auth Issues

```bash
cd apps/api
npx wrangler tail thalamus-api --format json
```

Common errors:

- `unable_to_create_user`: Schema mismatch - check all required fields exist
- `Model X not found in DB`: Schema key mismatch in drizzleAdapter config

---

## Deployment

### GitHub Actions

- `deploy-production.yml` - Deploys on push to main

### Manual Deployment

```bash
cd apps/api
npm run deploy    # Production
```

### Environment Variables

**GitHub Actions Secrets**:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers and D1 permissions

**Worker Environment** (Cloudflare dashboard or wrangler.toml):

- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - API URL (e.g., https://api.thalamus.sh)
- `FRONTEND_URL` - Frontend URL (e.g., https://thalamus.sh)
- OAuth provider credentials (GITHUB_CLIENT_ID, etc.)

---

## Code Style Guidelines

### Naming Conventions

| Type               | Convention      | Example                            |
| ------------------ | --------------- | ---------------------------------- |
| Variables          | camelCase       | `userData`, `isLoading`            |
| Functions          | camelCase       | `processItems()`, `handleClick()`  |
| Components         | PascalCase      | `NodeStyleInspector`, `CloudPanel` |
| Types/Interfaces   | PascalCase      | `GraphState`, `NodeGroup`          |
| Constants          | SCREAMING_SNAKE | `MAX_RETRIES`, `API_URL`           |
| Files (Components) | PascalCase      | `GraphCanvas.tsx`                  |
| Files (Utilities)  | camelCase       | `apiClient.ts`                     |
| DB Columns         | camelCase       | `emailVerified`, `createdAt`       |

### TypeScript

- Use strict mode (enabled)
- Prefer interfaces for object shapes
- Use generics for reusable utilities
- Avoid `any` - use `unknown` with type guards when needed

### State Management

- Zustand for global state (`graphStore`, `authStore`)
- React state for component-local state
- No Redux - keep it simple

### Error Handling

- Use try/catch for async operations
- Log errors with `console.error` (appropriate for production)
- Return meaningful error messages to frontend

---

## Critical Modules

### graphStore.ts (20 imports)

Central state store for the graph editor:

```typescript
export const useGraphStore: UseBoundStore<StoreApi<GraphState>>
export type RelationshipData = { label?: string; style?: EdgeStyle }
export type NodeGroup = { id, name, color, nodeIds[] }
```

### authStore.ts (7 imports)

Auth state wrapper:

```typescript
export const useAuthStore: UseBoundStore<StoreApi<AuthState>>;
export type OAuthProvider = "github" | "google" | "apple" | "gitlab" | "atlassian";
```

### apiClient.ts (3 imports)

Generic fetch wrapper:

```typescript
export class ApiError extends Error {
  status: number;
}
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>;
```

### db.ts (4 imports)

D1 connection factory:

```typescript
export function setD1(d1: D1Database): void;
export function getDb(): DrizzleD1Database<typeof schema>;
export function resetDb(): void;
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  routes/* ──┬── features/graph/* ───── store/graphStore         │
│             ├── features/auth/* ────── store/authStore          │
│             └── features/cloud/* ───── lib/apiClient            │
├─────────────────────────────────────────────────────────────────┤
│                     HTTP (credentials: include)                  │
├─────────────────────────────────────────────────────────────────┤
│                        Backend (Hono)                            │
├─────────────────────────────────────────────────────────────────┤
│  index.worker.ts                                                 │
│       ├── /auth/*  ────────► lib/auth (BetterAuth)              │
│       ├── routes/graphs.ts ─► lib/db                            │
│       ├── routes/share.ts ──► lib/db                            │
│       └── routes/profile.ts ► lib/db ────────► D1               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pitfalls to Avoid

- **BetterAuth schema mismatch**: Always verify field mappings match between `auth.ts` and `schema.ts`
- **D1 type assertions**: Use `as unknown as` pattern for Cloudflare Workers env types
- **Missing twoFactorEnabled**: Required column if using twoFactor plugin
- **Icon library types**: Use type assertions for dynamic icon imports (lucide, simple-icons)

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
