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

  useEffect(() => {
    if (!lessonId) return;

    const loadLessonAndCourse = async () => {
      setLoading(true);
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
        setCourse(courseObj || { _id: courseId, title: 'Course' });
        setLessonsList(lessons || []);

        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (userStr) {
          const user = JSON.parse(userStr);
          const uid = user._id || user.id;
          if (uid) {
            try {
              const progressRes = await fetch(`/api/user/progress?userId=${encodeURIComponent(uid)}`);
              if (progressRes.ok) {
                const { completedLessonIds } = await progressRes.json();
                if (Array.isArray(completedLessonIds)) {
                  setCompletedLessons(completedLessonIds);
                }
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLessonAndCourse();
  }, [lessonId]);

  const currentIndex = currentLesson
    ? lessonsList.findIndex((l) => l._id === currentLesson._id)
    : -1;
  const progress =
    lessonsList.length > 0 ? (completedLessons.length / lessonsList.length) * 100 : 0;

  const markComplete = async () => {
    if (!currentLesson) return;
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please sign in to save your progress.');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user._id) return;

    if (completedLessons.includes(currentLesson._id)) return;
    setCompletedLessons((prev) => [...prev, currentLesson._id]);

    try {
      await fetch('/api/user/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, lessonId: currentLesson._id }),
      });
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

  const defaultVideoUrl = 'https://www.youtube.com/embed/W6NZfCO5SIk';
  const videoUrl = currentLesson.videoUrl || defaultVideoUrl;

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
            <button
              type="button"
              onClick={() => alert('Quiz feature coming soon!')}
              className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition flex-shrink-0"
            >
              Take Quiz
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-300">
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={videoUrl}
                  allowFullScreen
                  className="w-full h-full"
                  title={currentLesson.title}
                />
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIndex <= 0}
                  className="px-4 py-2 border border-gray-400 rounded-lg text-sm text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={markComplete}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                  >
                    {completedLessons.includes(currentLesson._id) ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                  <span className="text-sm text-gray-700 font-medium">
                    Lesson {currentIndex + 1} of {lessonsList.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentIndex >= lessonsList.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
            {currentLesson.content && (
              <div className="mt-6 bg-white p-6 rounded-xl shadow border border-gray-300">
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{currentLesson.content}</p>
              </div>
            )}
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

          <div className="hidden lg:flex w-96 bg-white border-l border-gray-300 flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-300 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">AI Tutor</p>
              <p className="text-xs text-green-600 font-medium">● Online</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-100">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm max-w-xs shadow ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-300 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-300 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-400 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm font-medium"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
