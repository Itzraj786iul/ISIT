# ISIT — Indian School of Innovation and Thinking

**AI-powered personalized learning platform** (production-ready MVP)

---

## 1. Project overview

| | |
| --- | --- |
| **Name** | ISIT (Indian School of Innovation and Thinking) |
| **Type** | AI-first EdTech — personalized learning with telemetry and role-based dashboards |
| **Core idea** | *An AI tutor that adapts to how a student thinks, not just what they answer.* |

### What problem we solve

Students often get generic explanations and one-size-fits-all practice. Teachers and parents lack a clear picture of **who** is struggling, **where**, and **why** — beyond raw scores.

ISIT ties **learning sessions**, **fine-grained events**, and **mastery** into one loop so the tutor can adapt, dashboards can surface weak topics, and families get human-readable insight.

### How this differs from traditional EdTech

- **Session-first learning**: Practice and tutor interactions are anchored in **sessions** linked to topics — not only static videos or PDFs.
- **Behavioral signal**: We capture **events** (questions, answers, hints, teachback, etc.) to infer engagement and confusion patterns.
- **Mastery as a model**: Progress is tracked per topic with explicit **mastery records** and optional **knowledge gaps**, not only “completion” flags.
- **Three audiences**: **Students** learn; **teachers** see class-level insights; **parents** see child-friendly summaries — all on the same data spine where possible.

---

## 2. Core features (grouped)

### Student experience

- **Dashboard** — greetings, continue learning, recommendations, weak areas, progress stats, subjects grid.
- **Topic-based learning** — topic pages with videos, notes, practice, assignments; sessions created per topic.
- **Session-based learning** — dedicated session player with timer, practice questions, and session end flow.
- **AI tutor** — adaptive, Socratic-style help (hints, explanations, difficulty awareness) tied to session context.
- **Practice** — in-session practice plus optional quick practice flows on topic pages.
- **Teachback evaluation** — structured teachback flows and scoring hooks in the adaptive pipeline.
- **Mastery tracking** — per-topic mastery scores updated from session activity.
- **Session completion feedback** — post-session modal on the dashboard (time, questions answered, accuracy, next steps).

### Teacher experience

- **Student insights** — organization-scoped view of learners (mastery, weak topics, recent sessions, engagement and confusion scores).
- **Weak topic detection** — topics with low mastery surfaced per student and in aggregate **alerts**.
- **Engagement and confusion signals** — derived from sessions, events, and confusion logs (not raw dumps in the UI).
- **Alerts** — e.g. multiple students struggling on a topic, high confusion on a topic.

### Parent experience

- **Child insights** — per linked child: mastery snapshot, weekly activity, strengths and focus areas.
- **AI-generated summary** — short, encouraging paragraph (OpenAI when configured; warm fallback otherwise).
- **Strengths and weak areas** — plain-language topic lists.
- **Action suggestions** — simple, supportive next steps for parents.
- **Multi-child support** — switch between children on the parent dashboard.

---

## 3. System architecture

### Frontend

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**

### Backend

- **Next.js API Routes** — primary BFF and business logic (auth, curriculum, sessions, mastery, teacher/parent APIs).
- **FastAPI** (optional) — when `NEXT_PUBLIC_USE_EXTERNAL_API=true`, selected client calls can target an external API base URL (e.g. for session/tutor orchestration). Next.js remains the default for many catalog and dashboard calls.

### Database

- **MongoDB** with **Mongoose** models (`src/models`).

### AI layer

- **OpenAI** (and compatible APIs) for tutor replies, quizzes, and parent summaries.
- **RAG-style context** where applicable (topic notes, session events, mastery) — **no custom model training**.

### High-level data flow (text diagram)

```text
Student → Topic / Session → Events (telemetry)
              ↓
         Mastery + Gaps
              ↓
    AI Tutor (ask / adapt) ← session context
              ↓
Student Dashboard (recommendations, weak areas)
              ↓
Teacher Insights (class + alerts)    Parent Insights (per child + summary)
```

---

## 4. Key concepts

| Concept | Meaning |
| --- | --- |
| **Session-based learning** | A bounded learning attempt tied to a **topic** (and subject/org). The session player and APIs treat the session as the unit for practice and many AI calls. |
| **Event tracking** | **Session events** record what happened (e.g. question shown, answer, hint, teachback). Used for analytics, adaptation, and downstream insights. |
| **Mastery engine** | **Mastery records** store per-student, per-topic scores and metadata; updated as learning evidence accrues — avoid bypassing this with ad-hoc “set score” shortcuts. |
| **Knowledge gaps** | Optional records linking students to topics that need remediation; can complement weak-topic signals. |
| **Recommendation system** | Dashboard logic surfaces next topics to study from mastery and practice patterns (heuristics; extensible). |
| **AI tutor adaptation** | Uses recent answers, difficulty streaks, mastery, and prompts layered for Socratic behavior — difficulty and tone adjust within the session lifecycle. |

---

## 5. Folder structure (simplified)

| Path | Role |
| --- | --- |
| `src/app/` | **App Router** pages (`page.tsx`, layouts) and **Route Handlers** (`route.ts` under `api/`). |
| `src/components/` | Shared UI (nav, shells, banners, reusable widgets). |
| `src/lib/` | Auth, API client, session API, tutor adaptation, curriculum helpers, logging, validation, etc. |
| `src/models/` | **Mongoose** schemas (User, Session, SessionEvent, MasteryRecord, Topic, Subject, etc.). |
| `src/proxy.ts` | Edge **auth / route protection** entry (Next.js 16+ proxy; JWT + role checks). |
| `scripts/` | e.g. **seeding** (`npm run seed`). |

---

## 6. API overview (selected)

| Route | Purpose |
| --- | --- |
| **`/api/sessions`** | Create and list sessions; ties student + topic + subject + org. |
| **`/api/session-events`** / **`/api/events`** | Ingest and query **telemetry** for sessions. |
| **`/api/mastery`** | Read/update **mastery** aligned with learning evidence. |
| **`/api/performance`** | Aggregated **performance / time** style metrics for dashboards. |
| **`/api/teacher/student-insights`** | **Teacher-only**: class-style insights (filters by grade/subject), alerts, per-student cards. |
| **`/api/parent/child-insights`** | **Parent-only**: per-child stats, trends, AI summary, suggestions (child linked via parent profile). |
| **`/api/sessions/ask`** | **Adaptive AI tutor** for the session player (classification, difficulty, Socratic layers, OpenAI completion). |

Additional notable routes: `/api/topics`, `/api/subjects`, `/api/questions`, `/api/auth/*`, `/api/parent/children`, etc.

---

## 7. Authentication

- **JWT** issued on login/signup; stored in an **httpOnly cookie** for same-origin API calls.
- **localStorage** (`auth_token`, `user`) synced on login for **Bearer** usage when calling an **external** API base.
- **Remember me** — longer cookie/JWT lifetime when enabled; shorter when disabled.
- **Role-based access** — **Student**, **Teacher**, **Parent**; enforced in API handlers and edge proxy for protected routes.
- **401 handling** — client helpers clear stale tokens and can redirect to login (`fetchWithAuth`, `apiRequest`, auth context).

---

## 8. AI system (important)

- **Adaptive tutor** — message classification, difficulty state, and quick actions (hint vs explanation) driven by **`tutor-adaptive`** logic plus session context.
- **Difficulty adjustment** — informed by answer streaks and mastery snapshots merged with stored session tutor state.
- **Socratic questioning** — system prompts encourage guided questions rather than dumping full solutions first.
- **Teachback** — structured phases and JSON parsing for teachback evaluation within the same pipeline.
- **Session-based memory** — events and session fields feed the model context so replies stay relevant to the current topic and attempt.

---

## 9. Environment variables

| Variable | Purpose |
| --- | --- |
| **`MONGO_URI`** | MongoDB connection string. |
| **`JWT_SECRET`** | Signing secret for JWTs (use a long random value in production). |
| **`OPENAI_API_KEY`** | OpenAI API access for tutor, quizzes, parent summaries, etc. |
| **`NEXT_PUBLIC_USE_EXTERNAL_API`** | `true` to send selected client traffic to FastAPI (`NEXT_PUBLIC_API_BASE_URL`); `false` for default Next-only API usage. |
| **`NEXT_PUBLIC_API_BASE_URL`** | Base URL for external API (e.g. `http://localhost:8000`), no trailing slash issues handled in code. |

See **`.env.example`** for a starter list and production checklist.

---

## 10. How to run the project

```bash
cd edtech-mvp
npm install
cp .env.example .env   # then edit values
npm run dev
```

Open **http://localhost:3000**.

Optional:

- **Seed data**: `npm run seed` (if configured in your environment).
- **FastAPI backend**: run your API on the URL set in `NEXT_PUBLIC_API_BASE_URL` and set `NEXT_PUBLIC_USE_EXTERNAL_API=true` only when that integration is fully wired and CORS is configured.

---

## 11. Current status

| Area | Status |
| --- | --- |
| **Student system** | Complete (dashboard, subjects/topics, sessions, practice, tutor, completion UX). |
| **Teacher system** | Complete (student insights API + dashboard UI, filters, alerts). |
| **Parent system** | Complete (child insights API, dashboard + child views, multi-child). |
| **AI tutor** | Adaptive pipeline implemented (Socratic + difficulty + teachback hooks). |
| **Product** | **Launch-ready MVP** — env, auth, proxy, logging hooks, and core journeys in place. |

---

## 12. Next improvements (TODO)

- Further **raise tutor intelligence** (richer context, safer pedagogy, evaluation loops).
- **Analytics dashboards** with charts (engagement over time, cohort views).
- **Real-time notifications** (WebSockets or push) for teachers/parents.
- **Onboarding** — smoother first-run for students, teachers, and parents.
- **Payments** — refinement of legacy marketplace checkout if still in scope.
- **Mobile responsiveness** — polish for small screens across session player and dashboards.

---

## 13. Theme system (to implement)

- Add a **global theme toggle** (light / dark).
- Persist preference in **localStorage** (and optionally respect `prefers-color-scheme` as default).
- Enable **Tailwind dark mode** (e.g. `class` strategy on `<html>`).
- Apply tokens consistently across **layouts, cards, and session UI**.

---

## 14. Multilingual support (to implement)

- Support **English** and **Hindi** (expandable later).
- Use a clear **i18n** approach — simple JSON dictionaries or **`next-intl`** (or similar).
- Store **`locale`** in localStorage (and optionally URL prefix).
- Update incrementally: **navbar**, **dashboard**, **buttons**, then **AI prompts** (optional; requires careful prompt design per language).

---

## 15. Notes for future development

- **Do not break session-based architecture** — new learning flows should create or resume **sessions** where practice and AI attach.
- **All learning should go through sessions** when adding features that affect mastery or tutor state.
- **Avoid direct mastery updates** that skip events and session rules — keep one source of truth.
- **Keep AI and frontend aligned** — when changing event types or session shape, update both API consumers and adaptation logic.

---

## 16. Author / project info

| | |
| --- | --- |
| **Built by** | Raziullah Ansari |
| **Organization** | ISIT — EdTech startup |
| **Status** | Production-ready MVP |
| **Stack docs** | [Next.js](https://nextjs.org/docs) · Internal migration notes under `docs/` where present (e.g. AI-first migration). |

---

*This README is the primary onboarding document for developers, stakeholders, and anyone continuing the product.*
