# ITI Apprenticeship & Trade Job Matching Portal

An end-to-end vocational employment platform connecting Industrial Training Institute (ITI) graduates and certified tradespersons with verified workshops, manufacturing plants, and MSMEs across India.

The portal provides structured apprenticeship and full-time job matching, trade credential verification, applicant pipeline tracking, direct messaging, and interview scheduling within a unified monorepo.

---

## Table of Contents

- [Problem Statement & Objectives](#problem-statement--objectives)
- [Key Features](#key-features)
  - [Student & Candidate Capabilities](#student--candidate-capabilities)
  - [Employer & Workshop Capabilities](#employer--workshop-capabilities)
  - [Administrator Capabilities](#administrator-capabilities)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local Installation & Setup](#local-installation--setup)
- [Environment Configuration](#environment-configuration)
- [Database Management](#database-management)
- [Available Scripts](#available-scripts)
- [Health Check & Verification](#health-check--verification)
- [Deployment Overview](#deployment-overview)
- [Security Architecture & Limitations](#security-architecture--limitations)
- [Project Status & Future Roadmap](#project-status--future-roadmap)

---

## Problem Statement & Objectives

### The Problem
In India, hundreds of thousands of candidates graduate each year from ITIs in trades such as Electrician, Fitter, Welder, Machinist, Turner, and COPA. Despite heavy demand across manufacturing and service clusters:
- Job discovery is fragmented across informal networks, local notice boards, and unverified listings.
- Candidates lack a standardized digital profile highlighting trade certifications and practical competencies.
- Small and medium workshops face high friction verifying credentials and scheduling apprentice interviews.

### Project Objectives
1. **Bridge the Vocational Discovery Gap**: Create a digital marketplace tailored to trade skills rather than generic white-collar resumes.
2. **Ensure Trust Through Verification**: Enable candidate certificate reviews and workshop verification workflows.
3. **Streamline Hiring Logistics**: Integrate job search, application pipelines, in-app messaging, and interview scheduling.
4. **Maintain Administrative Oversight**: Provide administrators with tools to moderate postings, prevent fraud, and inspect platform activity.

---

## Key Features

### Student & Candidate Capabilities
- **Trade-Centric Profiles**: Select specialized ITI trades (Electrical, Mechanical, Fabrication, Civil, IT), institute name, contact details, and location.
- **Certificate & Resume Management**: Upload trade qualification certificates with verification tracking (`pending`, `verified`, `rejected`) and resume links.
- **Targeted Job Search**: Search and filter opportunities by trade category, location, and employment type (Apprenticeship vs. Full-time).
- **Application Tracking**: Monitor application progression through a defined status lifecycle (`Applied` → `Viewed` → `Shortlisted` → `Hired` / `Rejected`).
- **Direct Employer Messaging**: Communicate directly with prospective employers regarding application details.
- **Interview Scheduling**: View scheduled interviews (date, time, notes, online vs. in-person mode) and response details.
- **Mutual Ratings**: Provide post-hiring feedback and star ratings for workshops.

### Employer & Workshop Capabilities
- **Workshop Profile & Verification**: Register workshop details, industry domain, physical location, and contact information with admin verification workflows.
- **Job Posting Management**: Create, edit, and close job and apprenticeship listings with trade requirements and descriptions.
- **Applicant Pipeline Management**: Review applicants, inspect qualifications and uploaded certificates, and advance candidates through hiring stages.
- **Direct Candidate Chat**: Message candidates in dedicated application threads.
- **Interview Scheduling**: Propose and manage interview slots with mode selection (`ONLINE` or `IN_PERSON`) and custom notes.
- **Two-Way Ratings**: Rate student performance upon engagement completion.

### Administrator Capabilities
- **Employer Verification Queue**: Review submitted workshop profiles, approving legitimate businesses and rejecting incomplete or suspicious submissions.
- **Job Moderation & Anti-Fraud**: Flag fraudulent postings, hide violative listings from public search, and record moderation reasons.
- **User Account Management**: Toggle account active states to suspend offending users or re-enable accounts.
- **Platform Analytics**: Monitor aggregate metrics covering total users, active listings, submitted applications, and verification queues.
- **Application Configuration**: Manage platform-wide operational settings and trade skills registry.

---

## Architecture & Tech Stack

The application is structured as an npm workspaces monorepo containing three coordinated packages:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client (SPA)                               │
│       React 18 • TypeScript • Vite • Tailwind CSS • Framer Motion       │
│                 Three.js Hero Scene • Lucide React Icons                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Server (API)                               │
│        Node.js • Express • TypeScript • Prisma ORM • Zod Validation     │
│             JWT (Access + Refresh Rotation) • Helmet • Multer           │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   PostgreSQL Database  │       │     Redis & BullMQ     │
       │    Relational Storage  │       │ (Optional / Task Queue)│
       └────────────────────────┘       └────────────────────────┘
                    ▲                                 ▲
                    └────────────────┬────────────────┘
                                     │
                     ┌───────────────────────────────┐
                     │       @iti-portal/shared      │
                     │  DTOs, Enums, Zod Contracts   │
                     └───────────────────────────────┘
```

### Technology Breakdown

| Component | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Single-page application UI with responsive layout and dark/light themes |
| **Motion & 3D** | Framer Motion, Three.js | Interactive hero visualization with hardware-adapted fallback |
| **Backend API** | Node.js, Express, TypeScript | RESTful service layer handling auth, profiles, jobs, chat, and admin endpoints |
| **Data Layer** | PostgreSQL, Prisma ORM | Relational schema modeling users, profiles, trade skills, applications, and messages |
| **Background Queues** | Redis, BullMQ | Asynchronous queue infrastructure; gracefully optional during development |
| **Validation** | Zod | Runtime type safety and payload validation across client and server |
| **Authentication** | JWT, bcryptjs, `@react-oauth/google` | Dual-token authentication with HTTP-only cookies and Google OAuth support |

---

## Repository Structure

```
.
├── client/                     # Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI components & forms
│   │   ├── context/            # AuthContext and ThemeContext providers
│   │   ├── lib/                # API client adapters and animation utilities
│   │   ├── pages/              # Route views (Landing, Dashboards, Search, Chat)
│   │   └── styles/             # Tailwind imports and CSS tokens
│   ├── .env.example            # Client environment template
│   └── vite.config.ts          # Vite build and dev configuration
│
├── server/                     # Backend API Service
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma relational data model
│   │   ├── migrations/         # Versioned SQL migration history
│   │   └── seed.ts             # Trade skills, admin, and realistic fixture seeder
│   ├── src/
│   │   ├── config/             # Zod environment variable validation
│   │   ├── lib/                # Prisma client, JWT utilities, Redis handler
│   │   ├── middleware/         # Authentication & role guard middleware
│   │   ├── repositories/       # Data-access layer using Prisma
│   │   ├── routes/             # Express route definitions
│   │   └── services/           # Business logic layer
│   └── .env.example            # Server environment template
│
├── shared/                     # Shared TypeScript Definitions
│   └── src/
│       └── index.ts            # Shared enums, interfaces, DTOs, and Zod schemas
│
└── package.json                # Root monorepo workspace configuration
```

---

## Prerequisites

Before running the project locally, ensure the following dependencies are installed:

| Tool | Minimum Version | Notes |
|---|---|---|
| **Node.js** | `>= 20.x` | Node runtime for workspace packages |
| **npm** | `>= 10.x` | Package manager supporting npm workspaces |
| **PostgreSQL** | `>= 15.x` | Primary relational database |
| **Redis** | `>= 7.x` | **Optional** for local runtime; core API degrades gracefully if offline |

---

## Local Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YashRaool/ITI-Apprenticeship-Trade-Job-Matching-Portal.git
cd ITI-Apprenticeship-Trade-Job-Matching-Portal
```

### 2. Install Dependencies

Install all dependencies across root and workspace packages (`client`, `server`, `shared`):

```bash
npm install
```

### 3. Configure Environment Variables

Create environment configuration files using the provided templates:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

Review and adjust variables in `server/.env` and `client/.env` as detailed in [Environment Configuration](#environment-configuration).

### 4. Build Shared Types & Generate Prisma Client

```bash
# Build the shared contract package
npm run build --workspace=shared

# Generate Prisma Client types
npm run db:generate --workspace=server
```

### 5. Apply Database Migrations & Seed Data

Ensure your PostgreSQL service is running and accessible via the `DATABASE_URL` specified in `server/.env`.

```bash
# Run database migrations for development
npm run db:migrate

# Seed trade skills, admin user, and initial demo data
npm run db:seed
```

### 6. Run the Application

Start the backend API and frontend development server concurrently:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

Alternatively, run workspaces independently:

```bash
# Backend only
npm run dev --workspace=server

# Frontend only
npm run dev --workspace=client
```

---

## Environment Configuration

### Server Environment (`server/.env`)

Refer to `server/.env.example` for the full reference:

```env
# Server Runtime
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:password@localhost:5432/iti_portal

# Redis (Optional in local development)
REDIS_URL=redis://localhost:6379

# JWT Secrets (Generate with: openssl rand -base64 48)
JWT_ACCESS_SECRET=your_secure_access_secret_min_32_characters
JWT_REFRESH_SECRET=your_secure_refresh_secret_min_32_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth (Optional - required for Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary Storage (Optional placeholder)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Initial Admin Seeding (Used when running npm run db:seed)
ADMIN_EMAIL=admin@itiportal.local
ADMIN_PASSWORD=ChangeThisSecurePassword123!
```

### Client Environment (`client/.env`)

Refer to `client/.env.example`:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000

# Google OAuth Client ID (Matches server configuration)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> **Security Note**: Never commit `.env` files with production credentials or sensitive keys to Git. Keep actual secret values in secure environment secret stores.

---

## Database Management

Prisma ORM handles schema migrations and database interactions.

```bash
# Development: Create and apply migrations from schema.prisma
npm run db:migrate

# Production: Apply pending migrations in deployment pipelines without altering schema
npm run db:deploy

# Seed: Populate trade categories, default admin, and realistic test fixtures
npm run db:seed

# Prisma Studio: Launch a visual browser interface for inspecting records
npm run db:studio
```

---

## Available Scripts

| Script | Workspace | Description |
|---|---|---|
| `npm run dev` | Root | Runs client and server concurrently |
| `npm run build` | Root | Builds `shared`, `server`, and `client` packages for production |
| `npm run lint` | Root | Runs ESLint across all workspaces |
| `npm run db:migrate` | Root (`server`) | Runs `prisma migrate dev` |
| `npm run db:deploy` | Root (`server`) | Runs `prisma migrate deploy` (for production releases) |
| `npm run db:seed` | Root (`server`) | Seeds trade skills, admin, and demo data |
| `npm run db:studio` | Root (`server`) | Launches Prisma Studio database inspector |
| `npm run preview` | `client` | Previews the compiled frontend build locally |

---

## Health Check & Verification

Verify that the backend service is running and responsive:

```bash
curl -X GET http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-10-10T00:00:00.000Z"
}
```

---

## Deployment Overview

Deployment configuration is pending, but the architecture is designed for modern cloud environments:

### 1. Frontend Client
- Run `npm run build --workspace=client` to produce static output in `client/dist`.
- Deploy to static hosting platforms such as **Vercel**, **Netlify**, **Cloudflare Pages**, or **AWS S3 + CloudFront**.
- Configure SPA routing fallbacks to `index.html`.

### 2. Backend Service
- Run `npm run build --workspace=server` to compile TypeScript to `server/dist`.
- Deploy as a long-running Node service to **Render**, **Railway**, **Fly.io**, or a virtual server.
- Start using `node dist/index.js` with `NODE_ENV=production`.

### 3. PostgreSQL Database
- Provision a managed PostgreSQL instance (e.g., **Supabase**, **Neon**, **AWS RDS**).
- Run `npm run db:deploy` in your deployment or release phase to execute pending schema migrations safely.

---

## Security Architecture & Limitations

### Implemented Safeguards
- **Password Security**: Passwords are hashed using `bcryptjs` with a cost factor of 12.
- **Token Rotation**: Short-lived access tokens (15m) paired with refresh token rotation stored in HTTP-only cookies.
- **Route Authorization**: Middleware guards enforce role separation (`student`, `employer`, `admin`) on sensitive endpoints.
- **Request Validation**: All incoming requests and environment variables are strictly parsed with Zod schemas.
- **HTTP Hardening**: Helmet sets security headers, CORS restricts allowed origins, and rate-limiting protects against brute-force attacks.

### Current Limitations
- **File Storage**: Document and certificate attachments currently utilize placeholder/local storage adapters pending production cloud bucket wiring (e.g., S3/Cloudinary).
- **Asynchronous Queues**: Background worker execution (BullMQ) gracefully degrades if Redis is absent; production environments should supply an active Redis instance for queue processing.
- **Testing**: Automated integration and end-to-end test suites are pending implementation.

---

## Project Status & Future Roadmap

### Current Status
All core functional capabilities across candidate onboarding, employer workflows, job listings, application pipelines, chat messaging, and administrative moderation are fully implemented and running in the local development environment.

### Planned Enhancements
- **Multilingual Support**: Hindi, Marathi, and regional language localization for trade workers with limited English proficiency.
- **SMS & WhatsApp Alerts**: Notification webhooks for interview invitations and status changes to accommodate low-bandwidth users.
- **Skill-Based Recommendations**: Machine-learning driven matching between student trade competencies and job requirements.
- **National Apprenticeship Integration**: Sync workflows with government apprenticeship programs (NAPS / NATS).
- **Automated Test Suite**: Integration test coverage with Vitest and Playwright.
