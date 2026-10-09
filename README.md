# 🛠️ ITI Apprenticeship & Trade Job Matching Portal

### 🚀 Connecting ITI Students with Apprenticeships & Trade Jobs

A full-stack web platform designed to connect ITI graduates and diploma students with apprenticeship opportunities and trade-related jobs offered by workshops, factories, and manufacturing businesses.

Find opportunities, showcase technical skills, apply for jobs, and help employers discover skilled candidates—all through one unified platform.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Status](https://img.shields.io/badge/Status-Deployment%20Preparation-orange)

---

## 🌟 About the Project

Finding suitable apprenticeship opportunities can be challenging for vocational students, while workshops and manufacturing businesses often struggle to find candidates with the right technical skills.

The **ITI Apprenticeship & Trade Job Matching Portal** addresses this gap by bringing students and employers together on a centralized digital platform.

Students can create professional profiles, explore trade-specific opportunities, and track their applications. Employers can publish openings, review candidates, shortlist suitable applicants, and communicate directly with them. Administrators help maintain platform quality through employer verification and job moderation.

🎯 **Our goal:** Make apprenticeship discovery and trade-based hiring simpler, more accessible, and more organized.

## ✨ Key Features

### 👨‍🎓 Student & Apprentice Portal

- 📝 Create accounts and build professional profiles.
- 🔧 Add trade skills, ITI institute details, qualifications, and certifications.
- 📄 Maintain resume and certificate records.
- 🔍 Search and filter jobs by trade skills, location, and opportunity type.
- 📩 Apply for jobs and track application status.
- 💬 Communicate directly with employers.
- 📅 View scheduled interview details.

### 🏭 Employer & Workshop Portal

- 🏢 Create and manage workshop or factory profiles.
- 📢 Publish apprenticeship and trade-job openings.
- ⚙️ Define required skills, qualifications, and job requirements.
- 👥 Review applicants and their available profile information.
- ⭐ Shortlist candidates and update application statuses.
- 💬 Communicate with applicants.
- 📅 Schedule and manage interviews.

### 🛡️ Admin Dashboard

- 👤 Manage student and employer accounts.
- ✅ Review employer verification requests.
- 🔎 Monitor job postings and moderate inappropriate listings.
- 🚫 Manage account activation and moderation actions.
- 📊 View platform analytics and activity.
- ⚙️ Manage platform settings and trade-skill information.

### 🔐 Security & User Experience

- 🔑 Email/password authentication and Google Sign-In.
- 🔒 Role-based access control for Student, Employer, and Admin.
- 🍪 HTTP-only authentication cookies and session handling.
- 📱 Responsive layouts for desktop and mobile devices.
- 🎨 Clean, light-themed interface with polished interactions.
- 🧊 Interactive 3D hero experience on desktop and cinematic landing-page animations.

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| 🎨 Frontend | React 18, TypeScript, Vite |
| 💅 Styling & UI | Tailwind CSS, Lucide React |
| 🎞️ Animation & 3D | Framer Motion, Three.js |
| ⚡ Backend | Node.js, Express.js, TypeScript |
| 🗄️ Database | PostgreSQL, Prisma ORM |
| 🧩 Shared Validation | TypeScript, Zod |
| 🔐 Authentication | JWT, bcryptjs, Google OAuth |
| ☁️ File Storage | Cloudinary integration; production configuration required |
| 🔄 Background Jobs | Redis and BullMQ infrastructure; optional for current core workflows |

---

## 🏗️ System Architecture

```text
                 👨‍🎓 Students
                       │
                 🏭 Employers
                       │
                    🛡️ Admin
                       │
                       ▼
          ┌────────────────────────┐
          │    React Frontend      │
          │   TypeScript · Vite    │
          └────────────┬───────────┘
                       │ REST API
                       ▼
          ┌────────────────────────┐
          │    Express Backend     │
          │ Auth · RBAC · Services │
          └────────────┬───────────┘
                       │ Prisma ORM
                       ▼
          ┌────────────────────────┐
          │      PostgreSQL        │
          │ Users · Jobs · Profiles│
          │ Applications · Messages│
          └────────────────────────┘
```

The project follows a **monorepo architecture** with separate client, server, and shared packages.

## 📂 Project Structure

```text
ITI-Apprenticeship-Trade-Job-Matching-Portal/
│
├── client/                  # React frontend application
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── context/         # Authentication and theme state
│       ├── lib/             # API clients and utilities
│       └── pages/           # Application routes and dashboards
│
├── server/                  # Express backend API
│   ├── prisma/
│   │   ├── migrations/      # Database migration history
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Initial and demo data
│   └── src/
│       ├── config/          # Environment configuration
│       ├── middleware/      # Authentication and permissions
│       ├── repositories/    # Data access
│       ├── routes/          # API endpoints
│       └── services/        # Business logic
│
├── shared/                  # Shared types and validation
├── package.json             # Root workspace scripts
├── package-lock.json        # Dependency lockfile
└── README.md
```

---

## ⚙️ Getting Started

Follow these steps to run the project locally.

### 📋 Prerequisites

- Node.js 22.x or 24.x LTS.
- npm compatible with the root lockfile.
- PostgreSQL 15 or later.
- Google OAuth credentials for Google Sign-In.
- Cloudinary credentials for persistent cloud-based file uploads.

Redis is optional for the current core Phase 1 workflows.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YashRaool/ITI-Apprenticeship-Trade-Job-Matching-Portal.git

cd ITI-Apprenticeship-Trade-Job-Matching-Portal
```

### 2️⃣ Install Dependencies

```bash
npm ci
```

### 3️⃣ Configure Environment Variables

Create local environment files using the provided templates.

**Windows PowerShell**

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

**macOS / Linux**

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update the values in both `.env` files according to your local environment. Configure your PostgreSQL connection, authentication secrets, Google OAuth client ID, and any required storage credentials.

⚠️ **Never commit real environment files or production secrets to GitHub.**

### 4️⃣ Prepare the Database

Make sure PostgreSQL is running and `DATABASE_URL` points to your local development database.

```bash
npm run build --workspace=shared

npm run db:generate --workspace=server

npm run db:migrate

npm run db:seed
```

The seed command may create initial administrator and demo records. Verify its behavior and use appropriate credentials before accessing the application.

### 5️⃣ Start the Application

```bash
npm run dev
```

The application uses these default local addresses:

| Service | Local URL |
|---|---|
| 🌐 Frontend | `http://localhost:5173` |
| ⚡ Backend API | `http://localhost:5000` |
| ❤️ Health Check | `http://localhost:5000/health` |

---

## 🧪 Useful Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start frontend and backend development servers |
| `npm run build` | Build all workspaces |
| `npm run lint` | Run available lint checks |
| `npm run db:generate --workspace=server` | Generate Prisma Client |
| `npm run db:migrate` | Apply development migrations |
| `npm run db:deploy` | Apply pending migrations in a deployment |
| `npm run db:seed` | Populate initial and demo data |
| `npm run db:studio` | Open Prisma Studio |

### ❤️ Check Backend Health

```bash
curl http://localhost:5000/health
```

The health endpoint should return a successful status response when the backend is running.

---

## ☁️ Deployment Status

🚧 **Deployment preparation is in progress.**

The project has completed substantial local implementation and development testing. Production deployment still requires the hosting services, database, environment variables, file storage, and live application workflows to be configured and verified.

The intended deployment architecture consists of:

- 🌐 **Frontend:** Static hosting for the React application.
- ⚡ **Backend:** Node.js web service for the Express API.
- 🗄️ **Database:** Managed PostgreSQL.
- 📄 **File Storage:** Configured cloud storage for persistent resume and certificate uploads.

A public live-demo link will be added after deployment and verification.

---

## 🔒 Security & Data Handling

- Passwords are hashed with bcryptjs.
- Role-based permissions protect restricted application routes.
- Environment variables and request payloads are validated.
- Authentication uses JWTs and HTTP-only cookies.
- CORS and rate limiting provide additional API protections.
- Production secrets belong in the hosting provider's environment settings.

⚠️ Persistent document uploads must be tested with the production storage configuration before accepting real user files.

---

## 🚀 Future Enhancements

Ideas for future iterations include:

- 🤖 AI-assisted job recommendations based on skills and location.
- 📚 Integrated trade-skill assessments and learning resources.
- 🏛️ Integration with relevant government apprenticeship schemes.
- 🔔 Job alerts and additional notification channels.
- 📱 A dedicated mobile application.
- 🎓 Apprenticeship completion tracking.

These are potential enhancements, not claims of completed functionality.

---

## 🙌 Acknowledgements

This project is developed around the goal of improving connections between vocational students and trade employers.

Useful reference organizations and platforms:

- [Unified Mentor](https://www.unifiedmentor.com/)
- [National Skill Development Corporation (NSDC)](https://www.nsdcindia.org/)
- [Apprenticeship India](https://apprenticeshipindia.gov.in/)
- [Apna](https://apna.co/)

---

## 👨‍💻 Maintainer

**Yash Raool**

GitHub: [@YashRaool](https://github.com/YashRaool)

Project Repository: [ITI Apprenticeship & Trade Job Matching Portal](https://github.com/YashRaool/ITI-Apprenticeship-Trade-Job-Matching-Portal)

---

⭐ If you find this project interesting, explore the code and follow its progress as deployment moves forward.
