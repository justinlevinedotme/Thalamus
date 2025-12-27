# Thalamus

Visual diagram editor for event-driven architecture modeling with React Flow, backed by Cloudflare Workers API.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Flow, shadcn/ui
- **Backend**: Cloudflare Workers, Hono, Cloudflare D1
- **ORM**: Drizzle ORM
- **Auth**: BetterAuth (email/password + OAuth)
- **Monorepo**: Turborepo with npm workspaces

## Local Development

### Prerequisites

- Node.js 20+
- npm 9+

### Quick Start

```bash
# Install dependencies
npm install

# Run migrations and seed the database (first time only)
cd apps/api
npm run db:migrate:local
npm run db:seed
cd ../..

# Start development servers
npm run dev
```

This starts:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8787

### Test Credentials

After running `npm run db:seed`:

- **Email**: `admin@admin.com`
- **Password**: `root123`

### Available Scripts

From the root directory:

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start all apps in development mode |
| `npm run build`     | Build all apps                     |
| `npm run lint`      | Run ESLint                         |
| `npm run format`    | Format code with Prettier          |
| `npm run typecheck` | Run TypeScript type checking       |

From `apps/api`:

| Command                    | Description                        |
| -------------------------- | ---------------------------------- |
| `npm run dev`              | Start API in development mode      |
| `npm run db:migrate:local` | Apply migrations to local SQLite   |
| `npm run db:seed`          | Seed database with test data       |
| `npm run db:generate`      | Generate new migration from schema |
| `npm run db:studio`        | Open Drizzle Studio (database GUI) |
| `npm run deploy`           | Deploy to production               |

### Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env` for local development:

```bash
cp apps/api/.env.example apps/api/.env
```

OAuth providers are optional - email/password authentication works without them.

### Local Database

Local development uses SQLite (`apps/api/local.db`) instead of Cloudflare D1. The database is automatically created when you run migrations.

To reset the database:

```bash
cd apps/api
rm local.db
npm run db:migrate:local
npm run db:seed
```

## Production Deployment

The API deploys to Cloudflare Workers with D1 for the database.

```bash
cd apps/api
npm run deploy
```

Database migrations for production:

```bash
cd apps/api
npm run db:migrate  # Applies to production D1
```

## Project Structure

```
Thalamus/
├── apps/
│   ├── api/          # Cloudflare Workers API
│   └── web/          # React frontend
├── packages/         # Shared packages
└── turbo.json        # Turborepo config
```

## License

MIT
