'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [course, setCourse] = useState<CourseType | null>(null);
  const [lessonsList, setLessonsList] = useState<LessonType[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', text: "Hello! I'm your AI Tutor. Ask me anything about this lesson." },
  ]);
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
        alert(data.message || 'Could not save progress. Sign in and enroll in this course.');
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
        { id: prev.length + 1, sender: 'ai', text: "Great question! Let me explain that clearly for you..." },
      ]);
    }, 700);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
        <p className="text-gray-700">Lesson not found.</p>
        <Link href="/dashboard" className="text-sky-600 font-medium hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 p-4">
        <p className="text-gray-800 font-medium text-center">You must enroll in this course to view lessons.</p>
        <Link
          href={`/course/${course._id}`}
          className="text-sky-600 font-semibold hover:underline"
        >
          Go to course page to enroll
        </Link>
        <Link href="/dashboard" className="text-slate-600 text-sm hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const defaultVideoUrl = 'https://www.youtube.com/embed/W6NZfCO5SIk';
  const videoUrl = currentLesson.videoUrl || defaultVideoUrl;

  const aiTutorContent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] sm:max-w-xs shadow ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-gray-900 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );

  const aiTutorPanel = (
    <>
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">AI Tutor</p>
        <p className="text-xs text-emerald-600 font-medium">● Online</p>
      </div>
      {aiTutorContent}
    </>
  );

  const lessonsSidebar = (
    <>
      <div className="p-5 border-b border-gray-300">
        <h2 className="text-xs font-bold text-blue-700 uppercase">Course</h2>
        <Link href={`/course/${course._id}`} className="text-sm font-semibold text-gray-900 mt-1 block hover:text-sky-600 no-underline" onClick={() => setMobileLessonsOpen(false)}>
          {course.title}
        </Link>
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-600 mt-1">{Math.round(progress)}% Progress</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Lessons</h4>
        <div className="space-y-2">
          {lessonsList.map((lesson, index) => (
            <div
              key={lesson._id}
              onClick={() => { router.push(`/lesson/${lesson._id}`); setMobileLessonsOpen(false); }}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${lesson._id === currentLesson._id ? 'bg-blue-100 border border-blue-400' : 'hover:bg-gray-100'}`}
            >
              <div className={`w-6 h-6 text-xs rounded-full flex items-center justify-center ${completedLessons.includes(lesson._id) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                {completedLessons.includes(lesson._id) ? '✓' : index + 1}
              </div>
              <div><p className="text-sm font-semibold text-gray-900">{lesson.title}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 border-t border-gray-300 flex justify-between text-center text-sm">
        <div><p className="font-bold text-gray-900">{completedLessons.length}</p><p className="text-gray-600 text-xs">Completed</p></div>
        <div><p className="font-bold text-gray-900">{lessonsList.length - completedLessons.length}</p><p className="text-gray-600 text-xs">Remaining</p></div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden">
      {/* Mobile lessons overlay */}
      {mobileLessonsOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileLessonsOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            {lessonsSidebar}
          </aside>
        </div>
      )}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-300 flex-col flex-shrink-0">
        {lessonsSidebar}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-shrink-0 bg-white border-b border-gray-300 px-4 sm:px-6 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/dashboard" className="text-xs sm:text-sm text-sky-600 hover:text-sky-700 font-medium">
                ← Dashboard
              </Link>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <Link href={`/course/${course._id}`} className="text-xs sm:text-sm text-sky-600 hover:text-sky-700 font-medium">
                Course
              </Link>
            </div>
            <div className="min-w-0 w-full sm:w-auto">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                Lesson {currentIndex + 1}: {currentLesson.title}
              </h1>
              <p className="text-xs text-gray-600 truncate">{course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileLessonsOpen(true)}
              className="md:hidden px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-sm rounded-lg font-medium"
            >
              Lessons
            </button>
            <Link
              href={`/lesson/${lessonId}/quiz`}
              className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition flex-shrink-0 inline-block"
            >
              Take Quiz
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={videoUrl}
                  allowFullScreen
                  className="w-full h-full"
                  title={currentLesson.title}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIndex <= 0}
                  className="order-2 sm:order-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  ← Previous
                </button>
                <div className="order-1 sm:order-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <span className="text-sm text-slate-600 font-medium">
                    Lesson {currentIndex + 1} of {lessonsList.length}
                  </span>
                  <button
                    type="button"
                    onClick={markComplete}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl"
                  >
                    {completedLessons.includes(currentLesson._id) ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentIndex >= lessonsList.length - 1}
                  className="order-3 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
            {currentLesson.content && (
              <div className="mt-6 bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">From the lesson</h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{currentLesson.content}</p>
              </div>
            )}
            <div className="mt-6 bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Your notes</h3>
              <textarea
                value={userNotes}
                onChange={(e) => saveUserNotes(e.target.value)}
                placeholder="Type your notes here..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-y min-h-[120px]"
              />
              <p className="text-xs text-slate-500 mt-2">Saved automatically on this device.</p>
            </div>
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-900">Explore More Courses</h2>
              <p className="text-sm text-gray-600 mb-5">Continue your learning journey</p>
              <Link
                href="/courses"
                className="inline-block bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600"
              >
                Browse courses
              </Link>
            </div>
          </div>

          {/* AI Tutor — desktop: sidebar; mobile: FAB + bottom sheet */}
          <div className="hidden lg:flex w-96 bg-white border-l border-slate-200 flex-col flex-shrink-0">
            {aiTutorPanel}
          </div>
        </div>

        {/* Mobile: Floating AI Tutor button */}
        <button
          type="button"
          onClick={() => setMobileTutorOpen(true)}
          className="lg:hidden fixed right-6 z-40 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-600 flex items-center justify-center"
          style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
          aria-label="Open AI Tutor"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Mobile: AI Tutor bottom sheet */}
        {mobileTutorOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileTutorOpen(false)} aria-hidden />
            <div className="absolute bottom-0 left-0 right-0 top-[15%] sm:top-[20%] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">AI Tutor</p>
                  <p className="text-xs text-emerald-600 font-medium">● Online</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileTutorOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {aiTutorContent}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
