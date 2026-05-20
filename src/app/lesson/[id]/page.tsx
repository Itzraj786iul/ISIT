'use client';

/**
 * @legacy MARKETPLACE_LMS — Course lesson player + enrollment gate + AI tutor (lesson context).
 * AI-first player: /topic/[id] with Session; resume deep link: /session/[sessionId].
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useLayoutEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, BookOpen, ChevronLeft, ChevronRight, Sparkles, Video, X } from 'lucide-react';
import { useT } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';

type LessonType = {
  _id: string;
  title: string;
  content: string;
  courseId: string;
  order: number;
  videoUrl?: string;
};

type CourseType = {
  _id: string;
  title: string;
  description?: string;
  teacherId?: { _id?: string } | string;
};

type ChatMessage = { id: number; sender: 'ai' | 'user'; text: string };

export default function LessonPlayerPage() {
  const tr = useT();
  const { language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [course, setCourse] = useState<CourseType | null>(null);
  const [lessonsList, setLessonsList] = useState<LessonType[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 1, sender: 'ai', text: '' }]);

  useLayoutEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 1 && prev[0].sender === 'ai') {
        return [{ ...prev[0], text: tr('lessonTutorWelcome') }];
      }
      return prev;
    });
  }, [language, tr]);
  const [inputValue, setInputValue] = useState('');
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);
  const [mobileTutorOpen, setMobileTutorOpen] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const NOTES_STORAGE_KEY = (id: string) => `lesson-notes-${id}`;

  useEffect(() => {
    if (!lessonId) return;

    const loadLessonAndCourse = async () => {
      setLoading(true);
      setAccessDenied(false);
      try {
        const lessonRes = await fetch(`/api/lesson/${lessonId}`);
        if (!lessonRes.ok) {
          setLoading(false);
          return;
        }
        const lessonData = await lessonRes.json();
        const lesson = lessonData as LessonType;
        setCurrentLesson(lesson);

        const courseId = lesson.courseId;
        const courseRes = await fetch(`/api/course/${courseId}`);
        if (!courseRes.ok) {
          setLoading(false);
          return;
        }
        const { course: courseObj, lessons } = await courseRes.json();
        const courseData = courseObj || { _id: courseId, title: 'Course' };
        setCourse(courseData);
        setLessonsList(lessons || []);

        const [enrolledRes, meRes] = await Promise.all([
          fetch('/api/student/enrolled-courses', { credentials: 'include' }),
          fetch('/api/auth/me', { credentials: 'include' }),
        ]);
        const enrolledList: { course: { _id: string } }[] = enrolledRes.ok ? await enrolledRes.json() : [];
        const isEnrolled = enrolledList.some((e) => e.course._id === courseId);
        const meData = meRes.ok ? await meRes.json() : null;
        const userId = meData?.user?._id ?? meData?.user?.id;
        const tid = courseData.teacherId;
        const isTeacher = Boolean(
          userId && (typeof tid === 'string' ? tid === userId : (tid as { _id?: string })?._id === userId)
        );
        if (!isEnrolled && !isTeacher) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        try {
          const progressRes = await fetch('/api/user/progress', { credentials: 'include' });
          if (progressRes.ok) {
            const { completedLessonIds } = await progressRes.json();
            if (Array.isArray(completedLessonIds)) {
              setCompletedLessons(completedLessonIds);
            }
          }
        } catch {
          // ignore
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLessonAndCourse();
  }, [lessonId]);

  useEffect(() => {
    if (!lessonId || typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY(lessonId));
      setUserNotes(saved ?? '');
    } catch {
      setUserNotes('');
    }
  }, [lessonId]);

  const saveUserNotes = (notes: string) => {
    setUserNotes(notes);
    if (lessonId && typeof window !== 'undefined') {
      try {
        localStorage.setItem(NOTES_STORAGE_KEY(lessonId), notes);
      } catch {
        // ignore
      }
    }
  };

  const currentIndex = currentLesson
    ? lessonsList.findIndex((l) => l._id === currentLesson._id)
    : -1;
  const progress =
    lessonsList.length > 0 ? (completedLessons.length / lessonsList.length) * 100 : 0;

  const markComplete = async () => {
    if (!currentLesson) return;
    if (completedLessons.includes(currentLesson._id)) return;
    setCompletedLessons((prev) => [...prev, currentLesson._id]);

    try {
      const res = await fetch('/api/user/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: currentLesson._id }),
        credentials: 'include',
      });
      if (!res.ok) {
        setCompletedLessons((prev) => prev.filter((id) => id !== currentLesson._id));
        const data = await res.json().catch(() => ({}));
        alert(data.message || tr('lessonMarkCompleteError'));
      }
    } catch (err) {
      console.error(err);
      setCompletedLessons((prev) => prev.filter((id) => id !== currentLesson._id));
    }
  };

  const goNext = () => {
    if (currentIndex >= 0 && currentIndex < lessonsList.length - 1) {
      router.push(`/lesson/${lessonsList[currentIndex + 1]._id}`);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      router.push(`/lesson/${lessonsList[currentIndex - 1]._id}`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newMessage: ChatMessage = { id: messages.length + 1, sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: 'ai', text: tr('lessonTutorMockReply') },
      ]);
    }, 700);
  };

  if (loading) {
    return (
      <div className="h-screen isit-cosmic-bg flex flex-col items-center justify-center relative px-4">
        <div className="isit-glass rounded-2xl p-6 max-w-md w-full space-y-4 relative z-[1]">
          <div className="aspect-video rounded-xl bg-cyan-400/10 animate-pulse border border-cyan-400/10" />
          <div className="h-3 rounded-full bg-cyan-400/10 animate-pulse w-4/5" />
          <div className="h-3 rounded-full bg-cyan-400/10 animate-pulse w-3/5" />
        </div>
        <p className="relative z-[1] mt-6 text-sm text-slate-600 dark:text-cyan-200/75">{tr('lessonLoading')}</p>
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div className="h-screen isit-cosmic-bg flex flex-col items-center justify-center gap-6 p-4 relative">
        <div className="isit-glass max-w-md w-full rounded-2xl p-8 text-center relative z-[1]">
          <BookOpen className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-90" aria-hidden />
          <p className="font-semibold isit-text-primary">{tr('lessonNotFoundTitle')}</p>
          <p className="mt-2 text-sm /70">{tr('lessonNotFoundLead')}</p>
          <Link href="/dashboard" className="isit-btn-primary mt-6 inline-flex min-h-11 items-center justify-center px-6 no-underline">
            {tr('goToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="h-screen isit-cosmic-bg flex flex-col items-center justify-center gap-6 p-4 relative">
        <div className="isit-glass max-w-md w-full rounded-2xl p-8 text-center relative z-[1]">
          <p className="font-semibold isit-text-primary">{tr('lessonEnrollmentTitle')}</p>
          <p className="mt-2 text-sm leading-relaxed /75">{tr('lessonEnrollmentLead')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/course/${course._id}`} className="isit-btn-primary inline-flex min-h-11 items-center justify-center px-6 no-underline">
              {tr('lessonViewCourseEnroll')}
            </Link>
            <Link href="/dashboard" className="isit-btn-secondary inline-flex min-h-11 items-center justify-center px-6 no-underline">
              {tr('dashboard')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const videoUrl = (currentLesson.videoUrl || '').trim();
  const hasVideo = Boolean(videoUrl);

  const aiTutorContent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-white dark:bg-slate-950/25">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] sm:max-w-[280px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/25 isit-text-primary border border-cyan-400/35 rounded-br-md shadow-[0_8px_24px_rgba(6,182,212,0.12)]'
                  : 'isit-glass isit-text-primary/95 rounded-bl-md border-slate-200 dark:border-cyan-400/25'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-cyan-400/15 bg-slate-50 dark:bg-white dark:bg-slate-950/50 backdrop-blur-md flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={tr('lessonTutorPlaceholder')}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-cyan-400/25 isit-text-primary placeholder:text-slate-600 dark:text-cyan-200/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          />
          <button
            type="submit"
            className="isit-btn-primary px-4 py-2.5 text-sm font-semibold flex-shrink-0 min-h-[44px]"
          >
            {tr('lessonSend')}
          </button>
        </form>
      </div>
    </>
  );

  const aiTutorPanel = (
    <>
      <div className="p-4 isit-app-header backdrop-blur-md flex-shrink-0 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-sky-600 dark:text-cyan-300 shrink-0">
          <Sparkles className="w-5 h-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold isit-text-primary">{tr('lessonTutorTitle')}</p>
          <p className="mt-0.5 text-xs font-medium text-emerald-400/90">● {tr('lessonTutorContext')}</p>
        </div>
      </div>
      {aiTutorContent}
    </>
  );

  const lessonsSidebar = (
    <>
      <div className="p-5 border-b border-cyan-400/15">
        <h2 className="text-[10px] font-bold uppercase tracking-widest isit-accent-text">{tr('lessonCrumbCourse')}</h2>
        <Link
          href={`/course/${course._id}`}
          className="text-sm font-semibold isit-text-primary mt-2 block hover:text-slate-600 dark:text-cyan-200 no-underline leading-snug"
          onClick={() => setMobileLessonsOpen(false)}
        >
          {course.title}
        </Link>
        <div className="mt-4">
          <div className="h-2 bg-white dark:bg-slate-950/60 rounded-full overflow-hidden border border-cyan-400/15">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-cyan-200/65">
            {tr('lessonProgressPercent').replace(/\{percent\}/g, String(Math.round(progress)))}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-300/70">{tr('lessonLessonsHeading')}</h4>
        <div className="space-y-1.5">
          {lessonsList.map((lesson, index) => {
            const done = completedLessons.includes(lesson._id);
            const active = lesson._id === currentLesson._id;
            return (
              <button
                key={lesson._id}
                type="button"
                onClick={() => {
                  router.push(`/lesson/${lesson._id}`);
                  setMobileLessonsOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left cursor-pointer transition motion-safe-transition border ${
                  active
                    ? 'border-cyan-400/45 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
                    : 'border-transparent hover:bg-white dark:bg-slate-950/45 hover:border-cyan-400/15'
                }`}
              >
                <div
                  className={`w-7 h-7 text-xs rounded-full flex items-center justify-center shrink-0 font-bold ${
                    done ? 'bg-emerald-500/90 text-white' : active ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900/80 text-cyan-200 border border-cyan-400/25'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </div>
                <p className={`text-sm font-medium leading-snug ${active ? 'isit-text-primary' : 'isit-muted'}`}>
                  {lesson.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-cyan-400/15 flex justify-between text-center text-sm bg-white dark:bg-slate-950/30">
        <div>
          <p className="font-bold isit-text-primary">{completedLessons.length}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-600 dark:text-cyan-200/55">{tr('lessonDoneLabel')}</p>
        </div>
        <div>
          <p className="font-bold isit-text-primary">{lessonsList.length - completedLessons.length}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-600 dark:text-cyan-200/55">{tr('lessonLeftLabel')}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row isit-cosmic-bg overflow-hidden relative ">
      {mobileLessonsOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileLessonsOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 bottom-0 w-[min(20rem,88vw)] isit-glass border-r border-slate-200 dark:border-cyan-400/25 flex flex-col shadow-2xl">
            {lessonsSidebar}
          </aside>
        </div>
      )}
      <aside className="hidden md:flex w-72 lg:w-80 flex-col flex-shrink-0 isit-glass border-r border-slate-200 dark:border-cyan-400/20 rounded-none min-h-0">
        {lessonsSidebar}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-[1]">
        <header className="flex-shrink-0 border-b border-cyan-400/15 bg-white dark:bg-slate-950/45 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-0 sm:min-h-[4rem] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-xs sm:text-sm">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sky-600 dark:text-cyan-300 hover:font-medium no-underline"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
                {tr('dashboard')}
              </Link>
              <span className="hidden text-cyan-500/40 sm:inline" aria-hidden>
                ·
              </span>
              <Link href={`/course/${course._id}`} className="font-medium text-sky-600 dark:text-cyan-300 no-underline hover:isit-body">
                {tr('lessonCrumbCourse')}
              </Link>
            </div>
            <div className="min-w-0 w-full border-cyan-400/15 sm:w-auto sm:border-l sm:pl-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400/80">
                {tr('lessonPositionLabel')
                  .replace(/\{current\}/g, String(currentIndex + 1))
                  .replace(/\{total\}/g, String(lessonsList.length))}
              </p>
              <h1 className="text-base sm:text-lg font-bold isit-text-primary truncate">{currentLesson.title}</h1>
              <p className="text-xs text-slate-600 dark:text-cyan-200/65 truncate">{course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileLessonsOpen(true)}
              className="md:hidden isit-btn-secondary py-2 px-3 text-xs min-h-10"
            >
              {tr('lessonLessonsMobile')}
            </button>
            <Link
              href={`/lesson/${lessonId}/quiz`}
              className="isit-btn-primary inline-flex min-h-10 items-center justify-center px-4 py-2.5 text-sm no-underline sm:px-5"
            >
              {tr('lessonTakeQuiz')}
            </Link>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 min-h-0">
            <div className="isit-glass p-4 sm:p-6 rounded-2xl">
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-cyan-400/20 bg-white dark:bg-slate-950/80 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)]">
                {hasVideo ? (
                  <div className="aspect-video">
                    <iframe src={videoUrl} allowFullScreen className="w-full h-full border-0" title={currentLesson.title} />
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center gap-3 p-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-cyan-400/25 bg-cyan-400/10 text-sky-600 dark:text-cyan-300">
                      <Video className="w-7 h-7 opacity-90" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-medium isit-text-primary">{tr('lessonNoVideoTitle')}</p>
                      <p className="mx-auto mt-1 max-w-xs text-xs text-slate-600 dark:text-cyan-200/60">{tr('lessonNoVideoLead')}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIndex <= 0}
                  className="order-2 sm:order-1 isit-btn-secondary px-4 py-2.5 text-sm min-h-11 inline-flex items-center justify-center gap-1 disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden />
                  {tr('lessonPrevious')}
                </button>
                <div className="order-1 sm:order-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <span className="text-sm isit-body font-medium tabular-nums">
                    {currentIndex + 1} / {lessonsList.length}
                  </span>
                  <button
                    type="button"
                    onClick={markComplete}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-full min-h-11 transition ${
                      completedLessons.includes(currentLesson._id)
                        ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                        : 'bg-emerald-500/90 text-slate-950 hover:bg-emerald-400'
                    }`}
                  >
                    {completedLessons.includes(currentLesson._id) ? `${tr('lessonCompleted')} ✓` : tr('lessonMarkComplete')}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentIndex >= lessonsList.length - 1}
                  className="order-3 isit-btn-primary px-4 py-2.5 text-sm min-h-11 inline-flex items-center justify-center gap-1 disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {tr('lessonNext')}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            {currentLesson.content ? (
              <div className="mt-6 isit-glass p-5 sm:p-6 rounded-2xl">
                <h3 className="font-semibold isit-text-primary mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden />
                  {tr('lessonFromLesson')}
                </h3>
                <p className="isit-muted text-sm whitespace-pre-wrap leading-relaxed">{currentLesson.content}</p>
              </div>
            ) : null}

            <div className="mt-6 isit-glass p-5 sm:p-6 rounded-2xl">
              <h3 className="mb-2 font-semibold isit-text-primary">{tr('lessonYourNotes')}</h3>
              <textarea
                value={userNotes}
                onChange={(e) => saveUserNotes(e.target.value)}
                placeholder={tr('lessonNotesPlaceholder')}
                rows={6}
                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-100 dark:bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-cyan-400/25 isit-text-primary placeholder:text-slate-600 dark:text-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/35 resize-y min-h-[120px]"
              />
              <p className="mt-2 text-xs text-slate-600 dark:text-cyan-200/55">{tr('lessonNotesSavedDevice')}</p>
            </div>

            <div className="mt-10 isit-glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold isit-text-primary">{tr('lessonMoreCoursesTitle')}</h2>
                <p className="mt-1 text-sm isit-body/70">{tr('lessonMoreCoursesLead')}</p>
                <p className="mt-3 text-sm isit-body">
                  {tr('lessonPreferSubjects')}{' '}
                  <Link href="/learn/subjects" className="font-medium text-sky-600 dark:text-cyan-300 underline hover:isit-body">
                    {tr('lessonOpenSubjects')}
                  </Link>
                </p>
              </div>
              <Link
                href="/courses"
                className="isit-btn-secondary inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap px-6 no-underline"
              >
                {tr('lessonBrowsePrograms')}
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex w-[min(100%,24rem)] flex-col flex-shrink-0 isit-glass border-l border-slate-200 dark:border-cyan-400/20 rounded-none min-h-0">
            {aiTutorPanel}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileTutorOpen(true)}
          className="lg:hidden fixed right-5 z-40 min-h-14 min-w-14 rounded-full isit-btn-primary p-0 shadow-[0_12px_40px_rgba(6,182,212,0.35)] flex items-center justify-center border-0"
          style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))' }}
          aria-label={tr('lessonTutorOpenAria')}
        >
          <Bot className="w-6 h-6" aria-hidden />
        </button>

        {mobileTutorOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileTutorOpen(false)} aria-hidden />
            <div className="absolute bottom-0 left-0 right-0 top-[12%] sm:top-[18%] isit-glass rounded-t-3xl border border-slate-200 dark:border-cyan-400/25 border-b-0 flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-cyan-400/15 flex-shrink-0 bg-slate-50 dark:bg-white dark:bg-slate-950/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-sky-600 dark:text-cyan-300 shrink-0">
                    <Sparkles className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold isit-text-primary">{tr('lessonTutorTitle')}</p>
                    <p className="text-xs font-medium text-emerald-400/90">● {tr('lessonTutorMobileContext')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileTutorOpen(false)}
                  className="p-2.5 rounded-xl isit-body hover:bg-cyan-400/10 border border-transparent hover:border-slate-200 dark:border-cyan-400/20"
                  aria-label={tr('lessonTutorCloseAria')}
                >
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{aiTutorContent}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
