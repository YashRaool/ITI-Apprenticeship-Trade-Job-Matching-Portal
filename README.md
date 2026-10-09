# ITI Trade Job Matching Portal

Monorepo — React (Vite) + Express + PostgreSQL + Redis.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| PostgreSQL | ≥ 15 |
| Redis | ≥ 7 |

## First-time Setup

```bash
# 1. Install all dependencies (root + workspaces)
npm install

# 2. Configure server environment
cp server/.env.example server/.env
# Edit server/.env — set DATABASE_URL, JWT secrets, REDIS_URL

# 3. Configure client environment
cp client/.env.example client/.env
# Edit client/.env if API runs on a non-default port

# 4. Generate Prisma client
cd server && npx prisma generate && cd ..

# 5. Run DB migrations
npm run db:migrate

# 6. Seed TradeSkill data
npm run db:seed
```

## Development

```bash
# Run client (port 5173) + server (port 5000) concurrently
npm run dev

# Or individually:
npm run dev --workspace=client
npm run dev --workspace=server
```

## Other Commands

```bash
# Build all packages
npm run build

# Lint all packages
npm run lint

# Prisma Studio (DB GUI)
npm run db:studio

# Re-run migrations after schema changes
npm run db:migrate
```

## Project Structure

```
/
├── client/          # React + Vite + Tailwind
│   └── src/
│       ├── pages/   # Route-level components
│       └── styles/  # tokens.css + index.css
├── server/          # Express + Prisma + BullMQ
│   ├── prisma/      # schema.prisma + seed.ts
│   └── src/
│       ├── config/  # env validation (Zod)
│       ├── lib/     # prisma, redis, jwt, queues
│       ├── routes/  # (Phase 1+)
│       ├── services/
│       └── repositories/
└── shared/          # Shared TypeScript enums + types
    └── src/index.ts
```

## Health Check

```bash
curl http://localhost:5000/health
# → { "status": "ok", "timestamp": "..." }
```

## Phase Roadmap

| Phase | Scope |
|-------|-------|
| **0 (done)** | Scaffold, config, DB schema, design tokens |
| 1 | Auth — register, login, JWT refresh, role guards |
| 2 | Student & Employer profiles |
| 3 | Job postings + search |
| 4 | Applications + status workflow |
| 5 | Certifications + ratings |
| 6 | Admin dashboard |
