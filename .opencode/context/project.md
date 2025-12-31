# Project Context: Thalamus

Thalamus is a visual graph/mind-mapping editor built as a monorepo with a React frontend and Cloudflare Workers backend.

## Stack

- **Language**: TypeScript
- **Monorepo**: Turborepo with npm workspaces
- **Package Manager**: npm (v11.6.2)
- **Linting**: ESLint 9 + Prettier + Husky + Commitlint (conventional commits)

### Frontend (`apps/web`)

- **Framework**: React 18 + Vite
- **UI**: shadcn/ui (new-york style) + Radix UI + Tailwind CSS
- **State**: Zustand
- **Routing**: React Router v6
- **Graph Editor**: @xyflow/react (React Flow v12)
- **Rich Text**: TipTap
- **Auto-layout**: elkjs (via Web Worker)

### Backend (`apps/api`)

- **Framework**: Hono (on Cloudflare Workers)
- **Database**: Drizzle ORM + Cloudflare D1 (SQLite)
- **Auth**: better-auth (email/password + OAuth: GitHub, Google, Apple, GitLab, Atlassian)
- **Email**: React Email + Resend
- **Deployment**: Cloudflare Workers (Wrangler)

---

## Project Structure

```
thalamus/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Shared UI components
│   │   │   │   ├── ui/      # shadcn/ui components (24+)
│   │   │   │   └── icons/   # Custom SVG icons
│   │   │   ├── features/    # Feature modules (domain logic)
│   │   │   │   ├── editor/  # Graph editor, nodes, helper lines
│   │   │   │   ├── composer/# Visual node builder
│   │   │   │   ├── search/  # Node search + focus mode
│   │   │   │   ├── share/   # Graph sharing
│   │   │   │   ├── cloud/   # Cloud persistence API
│   │   │   │   └── billing/ # Subscription features
│   │   │   ├── routes/      # Page components (12 routes)
│   │   │   ├── store/       # Zustand stores
│   │   │   ├── lib/         # Utilities (apiClient, authClient, etc.)
│   │   │   ├── App.tsx      # Root with routing
│   │   │   └── main.tsx     # Entry point
│   │   └── components.json  # shadcn/ui config
│   │
│   └── api/                 # Cloudflare Workers backend
│       ├── migrations/      # D1 SQL migrations
│       ├── src/
│       │   ├── emails/      # React Email templates
│       │   │   └── components/  # Reusable email components
│       │   ├── lib/         # Core services
│       │   │   ├── auth.ts  # BetterAuth config
│       │   │   ├── db.ts    # D1/SQLite factory
│       │   │   ├── email.ts # Resend service
│       │   │   └── schema.ts# Drizzle schema
│       │   ├── middleware/  # Session middleware
│       │   ├── routes/      # API handlers
│       │   └── index.worker.ts  # Workers entry
│       └── wrangler.toml    # Cloudflare config
│
├── turbo.json               # Turborepo config
├── eslint.config.js         # ESLint flat config
└── package.json             # Root with workspaces
```

---

## Key Files

### Frontend

| File                                           | Purpose                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/web/src/store/graphStore.ts`             | Central graph state (~1800 lines): nodes, edges, groups, undo/redo, selection  |
| `apps/web/src/store/authStore.ts`              | Auth state: user, session, OAuth                                               |
| `apps/web/src/features/editor/GraphCanvas.tsx` | Main React Flow canvas                                                         |
| `apps/web/src/features/editor/nodeTypes.ts`    | Node type registry                                                             |
| `apps/web/src/features/editor/nodes/`          | Custom node components (EditableNode, ComposedNode, TextNode, ShapeNode, etc.) |
| `apps/web/src/features/composer/`              | Visual node composition system                                                 |
| `apps/web/src/lib/apiClient.ts`                | Fetch wrapper with ApiError                                                    |
| `apps/web/src/lib/authClient.ts`               | BetterAuth client                                                              |

### Backend

| File                             | Purpose                                                                  |
| -------------------------------- | ------------------------------------------------------------------------ |
| `apps/api/src/index.worker.ts`   | Hono app entry, route mounting                                           |
| `apps/api/src/lib/schema.ts`     | Drizzle schema (users, graphs, share_links, profiles, email_preferences) |
| `apps/api/src/lib/auth.ts`       | BetterAuth with OAuth + 2FA + Turnstile                                  |
| `apps/api/src/routes/graphs.ts`  | Graph CRUD + sharing                                                     |
| `apps/api/src/routes/profile.ts` | User profile + email preferences                                         |

---

## Database Schema

### Core Tables

- `ba_user` - User accounts (better-auth managed)
- `ba_session` - Sessions with token, expiry, IP
- `graphs` - Graph documents (nodes, edges, groups as JSON)
- `share_links` - Public share tokens (7-day expiry)
- `profiles` - User plans/quotas
- `email_preferences` - Email opt-in/out settings

---

## Patterns

### Frontend Patterns

1. **Feature-based organization**: Domain logic grouped by feature, not layer
2. **shadcn/ui + CVA**: Type-safe variant styling with Radix primitives
3. **Zustand stores**: Lightweight hooks, no Redux boilerplate
4. **Barrel exports**: `index.ts` files expose public API per feature
5. **Web Workers**: Heavy layout computation offloaded to workers
6. **Undo/redo**: Snapshot-based history (max 50 states) in graphStore

### Backend Patterns

1. **Edge-first**: Cloudflare Workers with request-scoped D1
2. **Dual database**: D1 (production) / better-sqlite3 (local dev)
3. **Lazy initialization**: Auth and email clients created on first use
4. **Cascade deletes**: User deletion cascades to all related data
5. **Email compliance**: List-Unsubscribe headers for one-click unsubscribe

### Node Types

The graph editor supports these node kinds:

- `idea`, `question`, `evidence`, `goal` - Semantic node types
- `text`, `shape` - Generic content nodes
- `pathKey`, `nodeKey` - Legend/key nodes
- `composed` - User-composed custom nodes

---

## Commands

```bash
# Development
npm run dev              # Start all apps (turbo)
npm run dev -w @thalamus/web   # Web only
npm run dev -w @thalamus/api   # API only

# Build & Type Check
npm run build            # Build all
npm run typecheck        # Type check all

# Linting & Formatting
npm run lint             # ESLint
npm run lint:fix         # ESLint with fixes
npm run format           # Prettier write
npm run format:check     # Prettier check

# Database (in apps/api)
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply to D1 production
npm run db:migrate:local # Apply locally
npm run db:studio        # Drizzle Studio
npm run db:seed          # Seed data

# Email Development
npm run email:dev        # React Email preview (port 3002)

# Deploy
npm run deploy -w @thalamus/api  # Deploy to Cloudflare
```

---

## shadcn/ui Configuration

```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib"
  },
  "registries": {
    "@shadcnblocks": "https://shadcnblocks.com/r/{name}.json"
  }
}
```

---

## API Endpoints

| Route                        | Methods          | Auth | Purpose             |
| ---------------------------- | ---------------- | ---- | ------------------- |
| `/health`                    | GET              | No   | Health check        |
| `/auth/*`                    | ALL              | No   | BetterAuth flows    |
| `/graphs`                    | GET, POST        | Yes  | List/create graphs  |
| `/graphs/:id`                | GET, PUT, DELETE | Yes  | Graph CRUD          |
| `/graphs/:id/share`          | POST             | Yes  | Generate share link |
| `/share/:token`              | GET              | No   | Access shared graph |
| `/profile`                   | GET, PATCH       | Yes  | User profile        |
| `/profile/email-preferences` | GET, PATCH       | Yes  | Email settings      |
| `/unsubscribe`               | GET, POST        | No   | Email unsubscribe   |

---

## Environment Variables

### Web (`apps/web/.env`)

```
VITE_API_URL=http://localhost:8787
VITE_TURNSTILE_SITE_KEY=...
```

### API (`apps/api/.env`)

```
# See wrangler.toml for D1 bindings
RESEND_API_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
# ... other OAuth providers
```

---

## Notes

- Graph data (nodes, edges, groups) stored as JSON in D1
- Users have configurable `maxGraphs` quota (default 20)
- Share links auto-expire after 7 days
- Local dev uses better-sqlite3, production uses D1
- Commits must follow conventional commit format (enforced by commitlint)
