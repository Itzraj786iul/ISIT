# ISIT — AI-first architecture & legacy marketplace migration

This document is the **canonical plan** for aligning the product on:

**Subject → Topic → Session → Events → Mastery → (future) Recommendation**

The **Course → Lesson** stack remains in the codebase as **legacy** until data and UX are migrated. See `@legacy` / `MARKETPLACE_LMS` comments in source files.

---

## 1. Current state (two parallel systems)

| System | Data models | Primary UX | APIs (examples) |
|--------|-------------|------------|-----------------|
| **AI learning (target)** | `Subject`, `Topic`, `Session`, `SessionEvent`, `MasteryRecord`, … | `/subjects`, `/subject/[id]`, `/topic/[id]`, **`/session/[id]`** (session player) | `/api/subjects`, `/api/topics`, `/api/sessions`, **`/api/sessions/[id]`**, **`/api/sessions/ask`**, **`/api/sessions/end`**, **`/api/events`** (alias for session telemetry), `/api/session-events`, `/api/mastery`, … |
| **Marketplace LMS (legacy)** | `Course`, `Lesson`, `Quiz` (lesson-scoped), `StudentProfile.completedLessons` | `/courses`, `/course/[id]`, `/checkout`, `/lesson/[id]`, `/my-courses` | `/api/courses`, `/api/course`, `/api/lesson`, `/api/checkout`, `/api/student/enrolled-courses`, `/api/user/complete`, `/api/user/progress` |

---

## 2. Target folder / route structure (App Router)

Existing AI routes stay; **new** route in bold.

```text
src/app/
  subjects/page.tsx              # catalog (existing)
  subject/[id]/page.tsx          # subject → topics (existing)
  topic/[id]/page.tsx          # primary learning hub + session create (existing)
  session/[id]/page.tsx        # NEW — resume / inspect session; deep link for AI flow

  # Legacy marketplace (keep until migration complete)
  courses/page.tsx
  course/[id]/page.tsx
  lesson/[id]/page.tsx
  lesson/[id]/quiz/page.tsx
  checkout/page.tsx
  my-courses/page.tsx
  certificate/[courseId]/page.tsx
  teacher/create-course/page.tsx
  teacher/course/[id]/edit/page.tsx

src/app/api/
  subjects/…
  topics/…
  sessions/route.ts
  sessions/[id]/route.ts       # NEW — GET session by id (owner-scoped)
  session-events/…
  mastery/…
  performance/…

  # Legacy
  courses/route.ts
  course/…
  lesson/…
  checkout/route.ts
  student/enrolled-courses/route.ts
  user/progress/route.ts       # legacy: completed marketplace lesson ids
  user/complete/route.ts       # legacy: mark marketplace lesson complete
```

**Optional later grouping (does not require moving files immediately):**

```text
src/app/(ai)/subjects/...
src/app/(ai)/subject/[id]/...
src/app/(ai)/topic/[id]/...
src/app/(ai)/session/[id]/...

src/app/(legacy-marketplace)/courses/...
```

Use Next.js **route groups** `(name)` only if you want clearer separation without changing URLs.

---

## 3. Inventory — legacy (Course/Lesson) touchpoints

### Pages

- `src/app/courses/page.tsx` — lists courses via `GET /api/courses`
- `src/app/course/[id]/page.tsx` — detail, checkout CTA
- `src/app/checkout/page.tsx` — mock payment, `POST /api/checkout`
- `src/app/lesson/[id]/page.tsx` — player, AI tutor (lesson context), progress
- `src/app/lesson/[id]/quiz/page.tsx` — quiz (currently pulls topic questions loosely)
- `src/app/my-courses/page.tsx` — `GET /api/student/enrolled-courses`
- `src/app/certificate/[courseId]/page.tsx` — certificate uses course title
- `src/app/teacher/dashboard/page.tsx` — teacher’s courses, delete course
- `src/app/teacher/create-course/page.tsx` — `POST /api/course`
- `src/app/teacher/course/[id]/edit/page.tsx` — PATCH course/lessons
- `src/app/teacher/analytics/page.tsx`, `teacher/students/page.tsx` — course counts
- Marketing: `how-it-works/page.tsx` (link to `/courses`), `stories/page.tsx` (copy), `terms/page.tsx` (checkout copy)
- `src/app/page.tsx` — CTA copy “Try a Free Interactive Lesson” (conceptual; can point to topic later)

### API routes

- `api/courses/route.ts`
- `api/course/route.ts` (POST)
- `api/course/[id]/route.ts` (GET/PATCH/DELETE)
- `api/lesson/route.ts` (POST)
- `api/lesson/[id]/route.ts` (GET/PATCH/DELETE)
- `api/checkout/route.ts`
- `api/student/enrolled-courses/route.ts`
- `api/user/progress/route.ts` — `completedLessons` (ObjectIds of **Lesson**)
- `api/user/complete/route.ts`
- `api/ai/tutor/route.ts` — context from **Lesson** + enrollment on **Course**
- `api/ai/generate-quiz/route.ts` — same

### Components / nav

- `src/components/Sidebar.tsx` — “My Courses”, “Browse All” → `/courses`
- `src/components/PublicNav.tsx` — Courses, profile → `/my-courses`
- `src/components/ParentNav.tsx` — Browse Courses
- `src/app/teacher/_components/TeacherShell.tsx` — “Courses” → create course

### Models

- `src/models/Course.ts`, `Lesson.ts`, `Quiz.ts`
- `StudentProfile.completedLessons` — references **Lesson** ids

### Other

- `src/proxy.ts` — protects `/lesson`, `/checkout`, marketplace APIs (when wired as `middleware.ts`)
- `scripts/seed.ts` — seeds Course/Lesson

---

## 4. Gradual UI migration (no big-bang)

1. **Navigation (low risk)**  
   - Add **“Learning”** or **“Subjects”** as primary nav entry (already have `/subjects`).  
   - Keep **“Courses (legacy)”** or rename to **“Marketplace”** with same URLs until sunset.  
   - Dashboard “Continue learning” should prefer **`/session/[id]`** or **`/topic/[id]`** using `last-session` + topic id.

2. **Deep links**  
   - After `POST /api/sessions` on topic load, optionally **`router.replace(/session/[sessionId])`** and move topic UI into session layout — **or** keep topic page as shell and use `/session/[id]` only for “resume” links from dashboard.

3. **AI tutor**  
   - Phase A: keep `/api/ai/tutor` on lesson for enrolled users.  
   - Phase B: add **`POST /api/ai/tutor/topic`** (or extend body with `topicId`) using topic notes + videos metadata.  
   - Phase C: deprecate lesson-only tutor when traffic is gone.

4. **Quiz**  
   - Bind quizzes to **`TopicQuestionBank`** and **`topicId`** only; remove lesson id from URL when ready (`/topic/[id]/quiz` or query `?sessionId=`).

5. **Enrollment / monetization**  
   - Replace “course purchase” with **org subscription / topic unlock** flags on `User` or `StudentProfile`, or a new `Entitlement` model; keep **Course** enrollment as fallback during transition.

6. **Teacher tools**  
   - Shift “create course” to **“publish subject/topic”** (reuse teacher subjects pages); leave create-course as legacy tab.

7. **Certificates**  
   - New route e.g. `/certificate/topic/[topicId]` based on mastery threshold; keep `/certificate/[courseId]` for old completions.

---

## 5. Step-by-step data & code migration

### Phase 0 — Done in repo (baseline)

- [x] Document this plan in `docs/AI_FIRST_MIGRATION.md`
- [x] Mark legacy modules with comments
- [x] Add **`GET /api/sessions/[id]`** and **`/session/[id]`** page (AI path deep link)
- [x] Extend **`GET /api/last-session`** with additive **`session_id`** (backward compatible) + dashboard link to `/session/[id]`

### Phase 1 — Observability & parity

- [ ] Add analytics events: `legacy_course_view` vs `topic_view` / `session_view`
- [ ] Dashboard cards: show last **Session** + link to `/session/[id]` and `/topic/[topicId]`

### Phase 2 — AI feature parity

- [ ] Tutor: topic-based prompt using `Topic` + `TopicNote` + transcript snippets
- [ ] Quiz generation: persist to `TopicQuestionBank` / session-scoped attempts (new model if needed)

### Phase 3 — Entitlements

- [ ] Model `canAccessTopic(user, topicId)`; implement for free tier / paid
- [ ] Map historical **Course** enrollees to **topic bundles** (manual script or mapping table)

### Phase 4 — Deprecation

- [ ] 301 or in-app banners from `/courses` → `/subjects`
- [ ] Read-only marketplace; then remove routes after retention window
- [ ] Remove `completedLessons` usage in favor of **Session** completion + **MasteryRecord**

### Phase 5 — Cleanup

- [ ] Archive or delete `Course`/`Lesson` APIs and pages
- [ ] Drop `Quiz` model if unused, or repoint to topic quizzes only

---

## 6. Backward compatibility rules

- Do **not** remove or change response shapes of legacy APIs without a versioned path (`/api/v1/...`) or feature flag.
- New fields on documents should be **additive** (optional).
- New pages (`/session/[id]`) must not alter existing `/topic/[id]` behavior unless behind a flag.

---

## 7. Single source of truth (end state)

| Concern | Source of truth |
|---------|------------------|
| Curriculum structure | `Subject` → `Topic` |
| Learning attempt | `Session` + `SessionEvent` |
| Competency | `MasteryRecord` (+ `KnowledgeGap`, etc.) |
| Recommendations | New service reading mastery + sessions (future) |
| Legacy completion | `StudentProfile.completedLessons` until migrated |

---

_Last updated: aligned with in-repo `@legacy` markers and `docs/AI_FIRST_MIGRATION.md`._
