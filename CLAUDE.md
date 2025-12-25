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
