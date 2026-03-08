# ISIT EdTech MVP – Implementation Summary

This document summarizes what has been implemented in the project so far.

---

## 1. Project overview

- **Product:** ISIT – Indian School of Innovation and Thinking (edtech learning platform).
- **Roles:** **Student**, **Teacher**, **Parent** (Student and Teacher flows are implemented; Parent is in the schema only).
- **Stack:** Next.js (App Router), React, TypeScript, MongoDB (Mongoose), Tailwind CSS.

---

## 2. Data models (MongoDB / Mongoose)

| Model   | Purpose | Key fields |
|--------|---------|------------|
| **User** | All users (students, teachers, parents) | `name`, `email`, `password`, `role` (Student \| Teacher \| Parent), `grade`, `completedLessons[]`, `extra` |
| **Course** | Course catalog and enrollment | `title`, `description`, `price`, `category`, `teacherId` (ref User), `enrolledStudents[]` (ref User), `image` |
| **Lesson** | Lessons inside a course | `title`, `content`, `courseId` (ref Course), `order`, `videoUrl` |

---

## 3. APIs implemented

| Method | Route | Purpose |
|--------|--------|--------|
| POST   | `/api/auth/signup` | Register user (name, email, password, role, etc.) |
| POST   | `/api/auth/login`  | Login; returns user object (stored in localStorage on client) |
| GET    | `/api/courses`     | List all courses; **`?teacherId=...`** filters by teacher |
| GET    | `/api/course/[id]` | Get single course + its lessons (populated teacher) |
| POST   | `/api/course`      | **Create course** (title, description, price, category, teacherId) + optional **lessons[]** (title, content, order, videoUrl) |
| DELETE | `/api/course/[id]` | **Delete course** and all its lessons |
| GET    | `/api/lesson/[id]`  | Get single lesson by ID |
| GET    | `/api/student/enrolled-courses` | List enrolled courses with progress for a student (`?userId=...`) |
| POST   | `/api/user/complete` | Mark a lesson complete for a user (userId, lessonId) |
| GET    | `/api/user/progress` | Get user progress (e.g. completedLessonIds) (`?userId=...`) |
| POST   | `/api/checkout`    | Checkout / enrollment (used for enrolling in courses) |

---

## 4. Student flow (pages and features)

- **Landing:** `/` – marketing/home.
- **Auth:** `/login`, `/signup` – login and register; on success, **teachers** are redirected to `/teacher/dashboard`, **students** to `/dashboard`.
- **Dashboard:** `/dashboard` – student home:
  - Greeting, enrolled courses with progress (progress %, next lesson, “Continue” / “Start”).
  - Onboarding card for new users.
  - Upcoming live sessions (with “Join” → `/live/[id]`).
  - Learning roadmap (mock), “Browse courses” → `/courses`.
- **Courses:** `/courses` – browse all courses (from API).  
  **Course detail:** `/course/[id]` – single course with lessons list, enroll, start lesson → `/lesson/[id]`.
- **My courses:** `/my-courses` – list of enrolled courses with progress and links to course/lesson.
- **Lesson player:** `/lesson/[id]` – see below for full detail.
- **Quiz:** `/lesson/[id]/quiz` – quiz page for a lesson (mock UI).
- **Live:** `/live/[id]` – live session placeholder; “Join” from dashboard/schedule goes here.
- **Schedule:** `/schedule` – schedule view with “Join” for live sessions.
- **Certificate:** `/certificate/[courseId]` – certificate placeholder for completed courses.
- **Other:** `/analytics`, `/learning-path`, `/achievements`, `/blog`, `/blog/[id]`, `/how-it-works`, `/checkout`, `/stories` – various placeholders or static content.
- **Settings:** `/settings` – notifications and help/support placeholders; teachers are redirected to `/teacher/dashboard`.
- **Help:** `/help` – help/support content.

**Navigation:** `Sidebar` component (Dashboard, My Courses, Browse All, Analytics, Learning Path, Achievements, Schedule, Settings, Help, Logout). Shown on student pages; teacher area has its own sidebar.

---

## 5. Lesson player (implemented behavior)

**Route:** `/lesson/[id]`

- **Layout:**
  - **Left (desktop):** Course title, progress bar, list of lessons (click to switch), completed count, remaining count.
  - **Center:** Breadcrumb (Dashboard / Course), lesson title, “Lessons” (mobile) / “Take Quiz” (→ `/lesson/[id]/quiz`), video embed, prev/next, “Mark as Complete”, lesson count.
  - **Right (desktop only by default):** AI Tutor panel (chat + input).

- **Improvements made:**
  - **AI Tutor on mobile:** Floating action button (FAB) opens a bottom sheet with the same AI Tutor (chat + input). Desktop keeps the right-hand panel.
  - **Video:** Styled container (e.g. aspect-video, rounded, shadow).
  - **Controls:** Responsive layout (e.g. stacked on mobile); “Mark as Complete” and prev/next clearly laid out.
  - **“From the lesson”:** Read-only block showing `lesson.content` from the API.
  - **“Your notes”:** Editable textarea; **saved per lesson in localStorage** (key `lesson-notes-{lessonId}`), so notes persist on the same device. Message: “Saved automatically on this device.”

- **Data:** Lesson and course from `/api/lesson/[id]` and `/api/course/[courseId]`; progress from `/api/user/progress`; “Mark complete” via `/api/user/complete`.

---

## 6. Teacher flow (implemented behavior)

**Routes:** `/teacher/dashboard`, `/teacher/create-course`

- **Access:** Only users with `role === 'Teacher'` (case-insensitive). Others are redirected (e.g. login/settings → teacher dashboard for teachers; student dashboard for students).

- **Teacher dashboard** (`/teacher/dashboard`):
  - **Sidebar:** “ISIT Instructor”, Dashboard (link), Students, Earnings, Analytics, Reviews (placeholders).
  - **Header:** “Instructor Dashboard”, welcome message, **“Create New Course”** → `/teacher/create-course`.
  - **Stats (top cards):** Total Revenue (placeholder), Total Students (from enrolled count across teacher’s courses), Avg Rating (placeholder), Active Courses (count of teacher’s courses).
  - **My Courses table:** Loaded from **GET `/api/courses?teacherId=<teacherId>`** (real data). Columns: Course title, Category, Price, Students (enrolled count), Rating (placeholder “-”), Status (“Published”), Actions.
  - **Actions:** **Edit** → `/course/[id]` (view course as student would see it). **Delete** → **DELETE `/api/course/[id]`** (with confirmation); removes course and all its lessons; table updates after success.
  - **States:** Loading (“Loading courses…”), empty (“No courses yet. Create your first course to get started.”).

- **Create course** (`/teacher/create-course`):
  - **Auth guard:** Redirect to login if not logged in; redirect to `/dashboard` if not a teacher. **Publish** disabled until teacher is loaded.
  - **Form:** Course title, subtitle, description; price (INR); category; level; curriculum = **modules**, each with **lessons** (title, duration, type). Add/remove modules and lessons.
  - **Publish:** **POST `/api/course`** with:
    - `title`, `description`, `price`, `category`, `teacherId` (from localStorage),
    - `lessons`: array from all modules (title, default content, order).
  - On success → redirect to **`/teacher/dashboard`**. Back link: “Back to Instructor Dashboard” → `/teacher/dashboard`.

---

## 7. Auth and role-based routing

- **Storage:** Logged-in user is stored in **localStorage** under key `user` (JSON: `_id`, `name`, `email`, `role`, etc.).
- **Redirects:**
  - After login/signup: **Teacher** → `/teacher/dashboard`, **Student** → `/dashboard`.
  - From `/dashboard`: if role is teacher → `/teacher/dashboard`.
  - From `/settings`: if role is teacher → `/teacher/dashboard`.
- **Guards:** Teacher dashboard and create-course check `role === 'teacher'` (lowercase) and redirect to login or student dashboard when needed.

---

## 8. Implemented vs placeholder

**Fully wired (APIs + UI):**

- Auth (signup, login), role-based redirects.
- Courses list and course detail; enrollment (checkout); my-courses and dashboard with real progress.
- Lesson player: video, progress, mark complete, notes (personal notes in localStorage), AI Tutor (desktop + mobile FAB/sheet).
- Teacher: list courses by teacher, create course + lessons, delete course, view course (edit is “view” link to course page).
- User progress and completed lessons.

**Placeholder or partial:**

- Revenue, ratings, reviews (teacher dashboard).
- Students / Earnings / Analytics / Reviews in teacher sidebar (no dedicated pages).
- Edit course (no dedicated edit page; only view course).
- Quiz: UI only (no backend).
- Live session: placeholder page.
- Certificate: placeholder.
- Blog, stories, learning path, achievements, analytics: static or mock.

---

## 9. File structure (main areas)

```
src/
├── app/
│   ├── api/           # API routes (auth, course, courses, lesson, user, checkout, student)
│   ├── teacher/       # Teacher dashboard, create-course
│   ├── course/[id]/  # Course detail
│   ├── lesson/[id]/  # Lesson player (+ quiz sub-route)
│   ├── dashboard/    # Student dashboard
│   ├── my-courses/
│   ├── courses/
│   ├── live/[id]/
│   ├── certificate/[courseId]/
│   ├── schedule/
│   ├── settings/
│   ├── help/
│   ├── login/
│   ├── signup/
│   └── ...
├── components/        # e.g. Sidebar
└── models/           # User, Course, Lesson (Mongoose)
```

---

This is the current state of the ISIT EdTech MVP: student learning path, lesson player with notes and AI tutor on mobile, and full teacher flow for creating and managing courses and lessons, with real data and APIs as described above.
