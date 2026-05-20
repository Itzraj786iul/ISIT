# ISIC — Indian School of Innovation and Curiosity

**AI-powered personalized learning platform** — production-ready EdTech MVP

| | |
| --- | --- |
| **Live website** | **[https://isic.org.in/](https://isic.org.in/)** |
| **Product** | Adaptive learning, session-based practice, role-based dashboards, bilingual UI |
| **Stack** | Next.js 16 · React 19 · MongoDB · OpenAI · Tailwind CSS 4 |

---

## Table of contents

1. [Overview](#overview)
2. [Live demo](#live-demo)
3. [Key features](#key-features)
4. [User roles](#user-roles)
5. [Tech stack](#tech-stack)
6. [Architecture](#architecture)
7. [Project structure](#project-structure)
8. [Getting started](#getting-started)
9. [Environment variables](#environment-variables)
10. [Scripts](#scripts)
11. [Internationalization & theme](#internationalization--theme)
12. [Performance & UX](#performance--ux)
13. [API overview](#api-overview)
14. [Authentication & security](#authentication--security)
15. [AI system](#ai-system)
16. [Deployment](#deployment)
17. [Documentation](#documentation)
18. [License & contact](#license--contact)

---

## Overview

**ISIC** (Indian School of Innovation and Curiosity) is a future-first EdTech platform that combines **AI mentorship**, **neuroscience-informed learning design**, and **real-world innovation programs** so students learn to think, create, and lead—not only memorize.

The platform serves three primary audiences on one data spine:

- **Students** — personalized dashboard, subjects/topics, session-based learning, adaptive AI tutor, mastery tracking
- **Teachers** — class insights, weak-topic detection, assignment progress, analytics
- **Parents** — child progress summaries, strengths/weak areas, multi-child support

### Problem we solve

Traditional EdTech often delivers generic content and opaque progress. ISIC ties **learning sessions**, **fine-grained telemetry**, and **per-topic mastery** into a single loop so the AI tutor adapts, educators see actionable signals, and families get clear, encouraging insight.

### How we differ

| Traditional EdTech | ISIC approach |
| --- | --- |
| Static videos / PDFs | **Session-first** learning tied to curriculum topics |
| Completion-only progress | **Mastery model** with events and knowledge gaps |
| One-size-fits-all explanations | **Adaptive AI tutor** (Socratic hints, difficulty awareness) |
| Siloed parent/teacher tools | **Role-based dashboards** on shared org/subject data |

---

## Live demo

**Production site:** [https://isic.org.in/](https://isic.org.in/)

Public marketing pages (home, how it works, courses, stories, blog, contact) are available without login. Student, teacher, and parent experiences require authentication.

---

## Key features

### Marketing & public site

- Responsive landing page with hero, programs, core courses, student journey, testimonials, FAQ
- **English / Hindi** language toggle (instant UI update, no full page reload)
- **Light / dark** theme with persisted preference
- Public navigation, footer, and “Ask AI tutor” entry point
- Pages: Home, Subjects, How it Works, Courses, Stories, Blog, About, Contact, Terms, Privacy

### Student experience

- Personalized **dashboard** — continue learning, recommendations, weak areas, progress stats, subjects grid
- **Subjects & topics** — organization-scoped curriculum catalog
- **Session-based learning** — practice player with timer, questions, session end flow
- **AI tutor** — standalone chat experience plus in-session adaptive help (`/api/sessions/ask`)
- **Learning path** — structured subject paths with topic lists
- **Achievements**, **schedule**, **analytics**, **settings**
- Post-session completion modal on dashboard
- Email verification banner

### Teacher experience

- Teacher dashboard and organization tools
- **Student insights** — mastery, engagement, confusion signals, alerts
- **Assigned topics** and **assignment progress**
- Subject management, student roster, analytics, course creation (legacy marketplace path)
- Shared **AI tutor** page in teacher shell

### Parent experience

- Parent dashboard with **multi-child** support
- Per-child insights: mastery snapshot, weekly activity, AI-generated summary, action suggestions
- Child linking and management flows

### Platform & engineering

- JWT auth with httpOnly cookies + role-based route protection (`src/proxy.ts`)
- MongoDB persistence via Mongoose models
- OpenAI integration for tutor, quizzes, and parent summaries
- Optional Razorpay checkout (legacy courses)
- Optimized images (AVIF/WebP), code splitting, route loading states
- Scroll and rendering optimizations for smooth 60 FPS–target experience on desktop and mobile

---

## User roles

| Role | Default landing | Access |
| --- | --- | --- |
| **Student** | `/dashboard` | Subjects, sessions, AI tutor, learning path, achievements |
| **Teacher** | `/teacher/dashboard` | Insights, assignments, subjects, students, analytics |
| **Parent** | `/parent/dashboard` | Linked children, child insights |
| **Admin** | `/organization` | Organization management (teachers may also access) |

---

## Tech stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI** | React 19, [Tailwind CSS 4](https://tailwindcss.com/) |
| **Language** | TypeScript 5 |
| **Database** | MongoDB + [Mongoose](https://mongoosejs.com/) 8 |
| **Auth** | JWT (`jose` / `jsonwebtoken`), bcrypt password hashing |
| **AI** | OpenAI API (tutor, quizzes, parent summaries) |
| **Payments** | Razorpay (optional) |
| **Email** | Resend (optional) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | Vitest |
| **Compiler** | React Compiler (babel plugin) |

---

## Architecture

### High-level data flow

```text
Student → Subject → Topic → Session → Session Events (telemetry)
                              ↓
                    Mastery Records + Knowledge Gaps
                              ↓
              AI Tutor (adaptive / Socratic) ← session context
                              ↓
        Student Dashboard          Teacher Insights          Parent Insights
```

### Frontend

- **Next.js App Router** with server and client components
- Shared design tokens (`src/styles/isit-tokens.css`, `isit-dark-cosmic.css`)
- `LanguageProvider` + dictionary-based i18n (`src/lib/i18n/`)
- `AuthProvider` with cached `/api/auth/me` to reduce duplicate requests
- Lazy-loaded sidebar, dynamic landing content, navigation progress bar

### Backend

- **Next.js Route Handlers** under `src/app/api/` (primary BFF)
- Optional external FastAPI when `NEXT_PUBLIC_USE_EXTERNAL_API=true`

### Edge / proxy

- `src/proxy.ts` — JWT validation and role-based redirects for protected routes and APIs

---

## Project structure

```text
edtech-mvp/
├── public/                 # Static assets (hero images, icons)
├── scripts/
│   └── seed.ts             # Database seeding
├── docs/
│   └── AI_FIRST_MIGRATION.md
├── src/
│   ├── app/                # Pages (App Router) + API routes
│   │   ├── api/            # REST-style route handlers
│   │   ├── dashboard/      # Student dashboard
│   │   ├── teacher/        # Teacher portal
│   │   ├── parent/         # Parent portal
│   │   ├── session/        # Session player
│   │   ├── subject/        # Subject & topic flows
│   │   └── page.tsx        # Marketing home
│   ├── components/         # UI components (nav, shells, landing)
│   ├── lib/                # Auth, i18n, API client, tutor logic
│   ├── models/             # Mongoose schemas
│   ├── styles/             # Global CSS (tokens, mobile, scroll perf)
│   └── proxy.ts            # Auth proxy (edge)
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

---

## Getting started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **MongoDB** instance (local or Atlas)
- **OpenAI API key** (for AI tutor and summaries)

### Installation

```bash
# Clone or open the project
cd edtech-mvp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, OPENAI_API_KEY, etc.

# Run development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Optional: seed database

```bash
npm run seed
```

### Production build locally

```bash
npm run build
npm run start
```

---

## Environment variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Strong random secret for JWT signing (32+ chars in production) |
| `OPENAI_API_KEY` | Yes* | OpenAI API key for AI features (*required for full tutor functionality) |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Public URL, e.g. `https://isic.org.in` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | No | Contact email in footer/legal pages |
| `NEXT_PUBLIC_USE_EXTERNAL_API` | No | `true` to use external FastAPI for some session APIs |
| `NEXT_PUBLIC_API_BASE_URL` | No | FastAPI base URL when external API mode is enabled |
| `RESEND_API_KEY` | No | Transactional email via Resend |
| `RAZORPAY_*` | No | Live payment keys for checkout |

See `.env.example` for the full list and production checklist.

> **Never** commit `.env` or secrets to version control. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run seed` | Seed MongoDB with sample data |

---

## Internationalization & theme

### Languages

- **English** (`en`) and **Hindi** (`hi`)
- Dictionaries: `src/lib/i18n/en.ts`, `src/lib/i18n/hi.ts`, `src/lib/i18n/landing.ts`
- Reactive switching via `LanguageProvider` and `useT()` — no page refresh required
- Preference stored in `localStorage` (`isit-language`)

### Theme

- **Light** and **dark** (cosmic) themes
- Class-based dark mode on `<html>` (`html.dark`)
- Persisted in `localStorage` (`isit-theme`)
- Bootstrap script in root layout prevents flash of wrong theme

---

## Performance & UX

The app includes targeted optimizations for smooth scrolling and stable rendering:

- Scroll-performance layer: pauses decorative animations while scrolling; reduces GPU blur cost in dark mode during scroll
- Custom cursor uses direct DOM transforms (no per-frame React re-renders)
- Lazy-loaded heavy components (landing content, sidebar)
- Auth response caching (`auth-me-cache.ts`)
- Image optimization (AVIF/WebP, responsive `sizes`)
- Mobile-responsive CSS (`src/styles/mobile-responsive.css`)
- Route-level `loading.tsx` skeletons for dashboard, teacher, parent, login

---

## API overview

Selected Route Handlers (see `src/app/api/` for the full set):

| Endpoint | Purpose |
| --- | --- |
| `/api/auth/*` | Login, signup, logout, verify email, password reset |
| `/api/auth/me` | Current user profile |
| `/api/subjects`, `/api/topics` | Curriculum catalog |
| `/api/sessions`, `/api/sessions/[id]` | Learning sessions |
| `/api/sessions/ask` | Adaptive AI tutor (session context) |
| `/api/sessions/end` | End session and persist results |
| `/api/session-events`, `/api/events` | Learning telemetry |
| `/api/mastery` | Per-topic mastery records |
| `/api/performance` | Dashboard performance aggregates |
| `/api/teacher/student-insights` | Teacher class insights |
| `/api/teacher/assigned-topics` | Teacher topic assignments |
| `/api/parent/children`, `/api/parent/child-insights` | Parent child management & insights |
| `/api/ai/tutor` | General AI tutor endpoint |
| `/api/checkout` | Course checkout (legacy) |

---

## Authentication & security

- **JWT** issued on login/signup; **httpOnly cookie** for same-origin API calls
- **Remember me** — extended session lifetime when enabled
- **Role-based access** enforced in APIs and `src/proxy.ts`
- Security headers in `next.config.ts`: `X-Frame-Options`, `HSTS` (production), `Referrer-Policy`, etc.
- Passwords hashed with **bcryptjs**
- Client auth helpers clear stale tokens on 401 (`fetchWithAuth`)

---

## AI system

- **Adaptive tutor pipeline** — message classification, difficulty state, Socratic prompts
- **Session context** — recent events, mastery, and topic notes feed the model
- **Teachback evaluation** — structured phases within the session flow
- **Parent summaries** — AI-generated encouraging paragraphs (with fallback copy)
- **Quiz generation** — `/api/ai/generate-quiz`
- No custom model training; uses OpenAI APIs with RAG-style context

---

## Deployment

Typical production setup:

1. Set environment variables on the host (Vercel, VPS, etc.)
2. Set `NEXT_PUBLIC_SITE_URL=https://isic.org.in`
3. Use a production `JWT_SECRET` and MongoDB Atlas URI
4. Enable HTTPS (cookies use `Secure` in production)
5. Run `npm run build` and `npm run start` (or platform-native Next.js deploy)

`next.config.ts` includes:

- `compress: true`
- Long-cache headers for `/_next/static` and static assets
- `optimizePackageImports` for `lucide-react`

For multi-instance deployments, consider external rate-limit storage (see comments in `.env.example`).

---

## Documentation

| Resource | Description |
| --- | --- |
| [Live site](https://isic.org.in/) | Production website |
| `docs/AI_FIRST_MIGRATION.md` | AI-first vs legacy marketplace architecture |
| `.env.example` | Environment template and production checklist |

### Legacy note

The codebase retains a **Course → Lesson** marketplace path (`/courses`, `/checkout`, etc.) alongside the **AI-first** Subject → Topic → Session model. New learning features should prefer the session-based architecture. See `docs/AI_FIRST_MIGRATION.md`.

---

## License & contact

| | |
| --- | --- |
| **Organization** | Indian School of Innovation and Curiosity (ISIC) |
| **Website** | [https://isic.org.in/](https://isic.org.in/) |
| **Support email** | Configured via `NEXT_PUBLIC_SUPPORT_EMAIL` (default: hello@isic.in) |
| **Built by** | Raziullah Ansari |
| **Status** | Production-ready MVP |

---

*This README is the primary onboarding document for developers, contributors, and stakeholders working on the ISIC platform.*
