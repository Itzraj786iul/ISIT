'use client';

/**
 * AI-first topic entry — all practice via sessions (player or quick inline); mastery sync on session end.
 * Supplementary tabs; topic study time → /api/performance.
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  BookOpen,
  HelpCircle,
  FileText,
  Video,
  AlertCircle,
  ChevronRight,
  Play,
  Sparkles,
  Loader2,
  Zap,
} from 'lucide-react';
import { sendEvent } from '@/lib/send-session-event';
import { fetchWithAuth } from '@/lib/api-client';

type User = { _id: string; name?: string; email?: string; role?: string };

type Topic = {
  _id: string;
  subject_id?: string;
  topic_name: string;
  topic_description?: string;
  difficulty_level?: string;
  estimated_time?: number;
  [key: string]: unknown;
};

type VideoItem = {
  _id: string;
  title?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  [key: string]: unknown;
};

type TopicNote = {
  _id: string;
  note_type?: string;
  content_markdown: string;
  [key: string]: unknown;
};

type Question = {
  _id: string;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  difficulty_level?: string;
  [key: string]: unknown;
};

type Assignment = {
  _id: string;
  description?: string;
  assignment_type?: string;
  [key: string]: unknown;
};

type SessionRow = { _id?: string; topic_id?: unknown; completion_status?: string };

function renderMarkdown(md: string): string {
  if (!md || typeof md !== 'string') return '';
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  let out = escape(md);
  out = out.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1 text-slate-900">$1</h3>');
  out = out.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2 text-slate-900">$1</h2>');
  out = out.replace(/^# (.+)$/gm, '<h1 class="text-xl font-semibold mt-4 mb-2 text-slate-900">$1</h1>');
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  out = out.replace(/\n\n/g, '</p><p class="mb-2 text-slate-700">');
  out = out.replace(/\n/g, '<br/>');
  return `<p class="mb-2 text-slate-700">${out}</p>`;
}

type TabId = 'videos' | 'notes' | 'practice' | 'assignments';

const TABS: { id: TabId; label: string; icon: typeof Video }[] = [
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'practice', label: 'Practice', icon: HelpCircle },
  { id: 'assignments', label: 'Assignments', icon: FileText },
];

function sessionTopicId(s: SessionRow): string {
  const t = s.topic_id;
  if (t == null) return '';
  if (typeof t === 'string') return t;
  if (typeof t === 'object' && t !== null && 'toString' in t) return String(t);
  return String(t);
}

export default function TopicLearningPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [notes, setNotes] = useState<TopicNote[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [inProgressSessionId, setInProgressSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('videos');
  const [practiceRedirecting, setPracticeRedirecting] = useState(false);
  const [quickActive, setQuickActive] = useState(false);
  const [quickSessionId, setQuickSessionId] = useState<string | null>(null);
  const [quickCurrentIndex, setQuickCurrentIndex] = useState(0);
  const [quickAnswers, setQuickAnswers] = useState<Record<string, string>>({});
  const [quickStarting, setQuickStarting] = useState(false);
  const [quickEnding, setQuickEnding] = useState(false);
  const videoSectionRef = useRef<HTMLDivElement | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const performanceSentRef = useRef(false);
  const quickSessionIdRef = useRef<string | null>(null);
  const quickEndedRef = useRef(false);
  const quickQuestionShownAtRef = useRef<number>(Date.now());

  const ensureSessionForTopic = useCallback(async (): Promise<string | null> => {
    if (!user?._id) return null;
    if (inProgressSessionId) return inProgressSessionId;
    const sessionRes = await fetchWithAuth('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: id }),
    });
    const sessionJson = (await sessionRes.json()) as { success?: boolean; data?: { _id?: string }; error?: string };
    if (!sessionRes.ok || !sessionJson.success || !sessionJson.data?._id) {
      console.error('Session create failed', sessionJson.error);
      return null;
    }
    const newId = String(sessionJson.data._id);
    setInProgressSessionId(newId);
    return newId;
  }, [user?._id, inProgressSessionId, id]);

  const endQuickPractice = useCallback(async () => {
    const sid = quickSessionIdRef.current;
    if (!sid || quickEndedRef.current) return;
    quickEndedRef.current = true;
    setQuickEnding(true);
    try {
      await sendEvent({
        session_id: sid,
        event_type: 'session_end',
        content: 'quick_practice_end',
        metadata: { topic_id: id, source: 'topic_quick_practice' },
      });
      await fetchWithAuth('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      quickSessionIdRef.current = null;
      setQuickSessionId(null);
      setQuickActive(false);
      setQuickCurrentIndex(0);
      setQuickAnswers({});
      setInProgressSessionId(null);
      setQuickEnding(false);
    }
  }, [id]);

  const startPracticeSessionRedirect = useCallback(async () => {
    if (!user?._id) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/topic/${id}`)}`);
      return;
    }
    setPracticeRedirecting(true);
    try {
      const sid = await ensureSessionForTopic();
      if (sid) router.push(`/session/${sid}`);
    } finally {
      setPracticeRedirecting(false);
    }
  }, [user?._id, ensureSessionForTopic, router, id]);

  const startQuickPractice = useCallback(async () => {
    if (!user?._id) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/topic/${id}`)}`);
      return;
    }
    if (questions.length === 0) return;
    setQuickStarting(true);
    quickEndedRef.current = false;
    try {
      const sid = await ensureSessionForTopic();
      if (!sid) return;
      quickSessionIdRef.current = sid;
      setQuickSessionId(sid);
      setQuickCurrentIndex(0);
      setQuickAnswers({});
      setQuickActive(true);
    } finally {
      setQuickStarting(false);
    }
  }, [user?._id, questions.length, ensureSessionForTopic, router, id]);

  useEffect(() => {
    if (!quickActive || !quickSessionId) return;
    const q = questions[quickCurrentIndex];
    if (!q) return;
    quickQuestionShownAtRef.current = Date.now();
    void sendEvent({
      session_id: quickSessionId,
      event_type: 'question',
      content: q._id,
    });
  }, [quickActive, quickSessionId, quickCurrentIndex, questions]);

  useEffect(() => {
    if (activeTab !== 'practice' && quickActive) {
      void endQuickPractice();
    }
  }, [activeTab, quickActive, endQuickPractice]);

  useEffect(() => {
    if (!quickActive) return;
    const onVis = () => {
      if (document.visibilityState === 'hidden') void endQuickPractice();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [quickActive, endQuickPractice]);

  useEffect(() => {
    return () => {
      if (quickSessionIdRef.current && !quickEndedRef.current) {
        void endQuickPractice();
      }
    };
  }, [endQuickPractice]);

  const sendPerformanceUpdate = useCallback(async (topicId: string, timeSpentMinutes: number) => {
    if (!user?._id || timeSpentMinutes <= 0) return;
    try {
      await fetchWithAuth('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, timeSpent: timeSpentMinutes }),
      });
    } catch (err) {
      console.error('Failed to update performance', err);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const meRes = await fetchWithAuth('/api/auth/me', { redirectOn401: false });
        const meData = meRes.ok ? await meRes.json() : null;
        const userData = meData?.user as User | undefined;
        if (userData?._id) setUser(userData);
        else setUser(null);

        const topicRes = await fetchWithAuth(`/api/topics/${id}`, { redirectOn401: false });
        const topicJson = (await topicRes.json()) as { success?: boolean; data?: Topic; error?: string };
        if (!topicRes.ok || !topicJson.success || !topicJson.data) {
          if (topicRes.status === 404) setNotFound(true);
          setLoading(false);
          return;
        }
        const topicData = topicJson.data;
        setTopic(topicData);

        const noRedirect = { redirectOn401: false } as const;
        const [videosRes, notesRes, questionsRes, assignmentsRes] = await Promise.all([
          fetchWithAuth(`/api/videos?topicId=${encodeURIComponent(id)}`, noRedirect),
          fetchWithAuth(`/api/topic-notes?topicId=${encodeURIComponent(id)}`, noRedirect),
          fetchWithAuth(`/api/questions?topicId=${encodeURIComponent(id)}`, noRedirect),
          fetchWithAuth(`/api/assignments?topicId=${encodeURIComponent(id)}`, noRedirect),
        ]);

        const parseList = async (res: Response) => {
          const j = (await res.json()) as { success?: boolean; data?: unknown[] };
          return (j.success && Array.isArray(j.data) ? j.data : []) as unknown[];
        };
        if (videosRes.ok) setVideos((await parseList(videosRes)) as VideoItem[]);
        else setVideos([]);
        if (notesRes.ok) setNotes((await parseList(notesRes)) as TopicNote[]);
        else setNotes([]);
        if (questionsRes.ok) setQuestions((await parseList(questionsRes)) as Question[]);
        else setQuestions([]);
        if (assignmentsRes.ok) setAssignments((await parseList(assignmentsRes)) as Assignment[]);
        else setAssignments([]);

        if (userData?._id) {
          setSessionsLoading(true);
          try {
            const sRes = await fetchWithAuth(
              `/api/sessions?status=in_progress&topic_id=${encodeURIComponent(id)}`,
              { redirectOn401: false }
            );
            const sJson = (await sRes.json()) as { success?: boolean; data?: SessionRow[] };
            if (sRes.ok && sJson.success && Array.isArray(sJson.data) && sJson.data.length > 0) {
              const match = sJson.data.find((s) => sessionTopicId(s) === id);
              const first = match ?? sJson.data[0];
              const sid = first._id != null ? String(first._id) : null;
              setInProgressSessionId(sid);
            } else {
              setInProgressSessionId(null);
            }
          } catch {
            setInProgressSessionId(null);
          } finally {
            setSessionsLoading(false);
          }
        } else {
          setInProgressSessionId(null);
          setSessionsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (topic && !loading) pageLoadTimeRef.current = Date.now();
  }, [topic, loading]);

  useEffect(() => {
    if (!id || !user?._id) return;
    const sendTimeSpent = () => {
      if (performanceSentRef.current) return;
      performanceSentRef.current = true;
      const minutes = (Date.now() - pageLoadTimeRef.current) / 60000;
      if (minutes < 0.1) return;
      sendPerformanceUpdate(id, Math.round(minutes * 10) / 10);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendTimeSpent();
    };
    const onBeforeUnload = () => {
      sendTimeSpent();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      sendTimeSpent();
    };
  }, [id, user?._id, sendPerformanceUpdate]);

  const startLearning = async () => {
    if (!user?._id) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/topic/${id}`)}`);
      return;
    }
    setStarting(true);
    try {
      const sessionRes = await fetchWithAuth('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: id }),
      });
      const sessionJson = (await sessionRes.json()) as { success?: boolean; data?: { _id?: string }; error?: string };
      if (!sessionRes.ok || !sessionJson.success || !sessionJson.data?._id) {
        console.error('Start learning failed', sessionJson.error);
        setStarting(false);
        return;
      }
      const newSessionId = String(sessionJson.data._id);

      void fetchWithAuth('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: newSessionId,
          event_type: 'start_learning_click',
          content: id,
          metadata: { topic_id: id },
        }),
      }).catch(() => {});

      router.push(`/session/${newSessionId}`);
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  };

  const resumeSession = () => {
    if (inProgressSessionId) router.push(`/session/${inProgressSessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
          <p className="text-slate-600 font-medium">Loading topic…</p>
        </div>
      </div>
    );
  }

  if (notFound || !topic) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h1 className="text-xl font-semibold text-slate-900">Topic not found</h1>
        <p className="text-slate-600 text-center">The topic you’re looking for doesn’t exist or was removed.</p>
        <Link href="/dashboard" className="text-sky-600 font-medium hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const firstVideoUrl = videos[0]?.video_url;
  const loginHref = `/login?returnUrl=${encodeURIComponent(`/topic/${id}`)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-sky-600 font-medium hover:underline">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/subjects" className="text-sky-600 font-medium hover:underline">
              Subjects
            </Link>
            {topic.subject_id && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <Link href={`/subject/${topic.subject_id}`} className="text-sky-600 font-medium hover:underline">
                  Topics
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero — session-first */}
        <section className="bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{topic.topic_name}</h1>
          {topic.topic_description && (
            <p className="mt-3 text-sky-100 text-sm sm:text-base leading-relaxed max-w-2xl">{topic.topic_description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {topic.difficulty_level ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white ring-1 ring-white/30">
                {topic.difficulty_level}
              </span>
            ) : null}
            {topic.estimated_time != null && topic.estimated_time > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sky-100 text-sm">
                <Clock className="w-4 h-4 shrink-0" />
                ~{topic.estimated_time} min estimated
              </span>
            )}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-sky-200/90">Recommended learning mode</p>
          <p className="mt-1 text-sm text-sky-100/95 max-w-xl">
            AI will personalize your learning in this session — practice, hints, and progress in one focused player.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-3">
            {user?._id ? (
              <>
                {inProgressSessionId && !sessionsLoading ? (
                  <button
                    type="button"
                    onClick={resumeSession}
                    className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-sky-50 transition shadow-md"
                  >
                    <Play className="w-5 h-5" />
                    Resume session
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={starting}
                  onClick={startLearning}
                  className="inline-flex items-center justify-center gap-2 bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Start learning
                </button>
              </>
            ) : (
              <Link
                href={loginHref}
                className="inline-flex items-center justify-center gap-2 bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition shadow-md no-underline"
              >
                <Sparkles className="w-5 h-5" />
                Sign in to start learning
              </Link>
            )}
          </div>
          {sessionsLoading && user?._id ? (
            <p className="mt-3 text-xs text-sky-200">Checking for an in-progress session…</p>
          ) : null}
        </section>

        {/* Supplementary materials */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Supplementary materials</h2>
              <p className="text-sm text-slate-500 mt-0.5">Videos, notes, practice, and assignments — optional alongside your AI session.</p>
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide shrink-0">Optional</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50/80">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      active ? 'bg-white text-sky-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-6 min-h-[200px]">
              {activeTab === 'videos' && (
                <div ref={videoSectionRef}>
                  {videos.length > 0 && firstVideoUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={firstVideoUrl}
                          allowFullScreen
                          className="w-full h-full"
                          title={videos[0]?.title || 'Topic video'}
                        />
                      </div>
                      {videos.length > 1 && (
                        <p className="text-slate-500 text-sm">
                          {videos.length} video{videos.length !== 1 ? 's' : ''} for this topic.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Video className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm font-medium">No videos for this topic yet.</p>
                      <p className="text-xs mt-1 text-center">Use Start learning for the AI session, or check back later.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <>
                  {notes.length > 0 ? (
                    <div className="space-y-6">
                      {notes.map((note) => (
                        <div key={note._id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                          {note.note_type && (
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              {note.note_type.replace(/_/g, ' ')}
                            </span>
                          )}
                          <div
                            className="prose prose-slate max-w-none mt-2 text-slate-700 text-sm leading-relaxed [&>p]:mb-2 [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(note.content_markdown || ''),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm font-medium">No notes for this topic yet.</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'practice' && (
                <>
                  {!quickActive ? (
                    <div className="space-y-6">
                      <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 sm:p-5">
                        <p className="text-sm font-semibold text-violet-900">Session-based practice</p>
                        <p className="text-sm text-violet-800/90 mt-1 leading-relaxed">
                          Practice is tracked through a learning session so the AI tutor and your dashboard stay in sync.
                          Mastery updates when you end the session (full player, or quick mode below).
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                        {user?._id ? (
                          <>
                            <button
                              type="button"
                              disabled={practiceRedirecting}
                              onClick={() => void startPracticeSessionRedirect()}
                              className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-3 rounded-xl transition disabled:opacity-60"
                            >
                              {practiceRedirecting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Play className="w-5 h-5 shrink-0" />
                              )}
                              Start practice session
                            </button>
                            <button
                              type="button"
                              disabled={quickStarting || questions.length === 0}
                              onClick={() => void startQuickPractice()}
                              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-800 font-semibold px-5 py-3 rounded-xl hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {quickStarting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Zap className="w-5 h-5 shrink-0 text-amber-500" />
                              )}
                              Quick practice (stay here)
                            </button>
                          </>
                        ) : (
                          <Link
                            href={loginHref}
                            className="inline-flex items-center justify-center gap-2 bg-sky-600 text-white font-semibold px-5 py-3 rounded-xl no-underline"
                          >
                            <Play className="w-5 h-5" />
                            Sign in to practice
                          </Link>
                        )}
                      </div>
                      {questions.length === 0 && user?._id && (
                        <p className="text-xs text-slate-500">
                          No question bank for this topic yet — use <strong>Start practice session</strong> for the AI player (it can still run with built-in practice).
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-600">
                          Quick practice · Question {quickCurrentIndex + 1} of {questions.length}
                        </p>
                        <button
                          type="button"
                          disabled={quickEnding}
                          onClick={() => void endQuickPractice()}
                          className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        >
                          {quickEnding ? 'Saving…' : 'End & save session'}
                        </button>
                      </div>
                      {(() => {
                        const q = questions[quickCurrentIndex];
                        if (!q) return null;
                        const selected = quickAnswers[q._id];
                        const correctAnswer = q.correct_answer;
                        const isAnswered = selected != null;
                        const isCorrect = isAnswered && selected === correctAnswer;
                        return (
                          <div
                            className={`border rounded-xl p-4 sm:p-5 transition ${
                              isAnswered
                                ? isCorrect
                                  ? 'border-emerald-300 bg-emerald-50/50'
                                  : 'border-red-300 bg-red-50/50'
                                : 'border-slate-200 bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-medium text-slate-900">
                                {quickCurrentIndex + 1}. {q.question_text}
                              </p>
                              {isAnswered && (
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                    isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              )}
                            </div>
                            {q.options && q.options.length > 0 && (
                              <ul className="mt-2 space-y-1.5">
                                {q.options.map((opt, i) => {
                                  const isThisCorrect = opt === correctAnswer;
                                  const isThisSelected = selected === opt;
                                  let btnClass = 'border-slate-200 text-slate-700 hover:bg-slate-100';
                                  if (isAnswered) {
                                    if (isThisCorrect) {
                                      btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                                    } else if (isThisSelected && !isThisCorrect) {
                                      btnClass = 'border-red-400 bg-red-50 text-red-800 line-through';
                                    } else {
                                      btnClass = 'border-slate-200 text-slate-400';
                                    }
                                  }
                                  return (
                                    <li key={i}>
                                      <button
                                        type="button"
                                        disabled={isAnswered || !quickSessionId}
                                        onClick={() => {
                                          if (!quickSessionId) return;
                                          const correct = correctAnswer != null && opt === correctAnswer;
                                          const rt = Math.max(0, Date.now() - quickQuestionShownAtRef.current);
                                          setQuickAnswers((prev) => ({ ...prev, [q._id]: opt }));
                                          void sendEvent({
                                            session_id: quickSessionId,
                                            event_type: 'answer',
                                            content: String(i),
                                            is_correct: correct,
                                            response_time_ms: rt,
                                          });
                                        }}
                                        className={`w-full text-left text-sm px-4 py-2 rounded-lg border transition ${btnClass} ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                      >
                                        {opt}
                                        {isAnswered && isThisCorrect && <span className="ml-2 text-emerald-600">✓</span>}
                                        {isAnswered && isThisSelected && !isThisCorrect && (
                                          <span className="ml-2 text-red-500">✕</span>
                                        )}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            {isAnswered && q.explanation && (
                              <div
                                className={`mt-3 px-3 py-2 rounded-md text-xs leading-relaxed ${
                                  isCorrect ? 'bg-emerald-100/60 text-emerald-800' : 'bg-amber-100/60 text-amber-900'
                                }`}
                              >
                                <strong>Explanation:</strong> {q.explanation}
                              </div>
                            )}
                            {isAnswered && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {quickCurrentIndex < questions.length - 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickCurrentIndex((x) => x + 1);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
                                  >
                                    Next question
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={quickEnding}
                                    onClick={() => void endQuickPractice()}
                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    {quickEnding ? 'Saving…' : 'Finish practice'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'assignments' && (
                <>
                  {assignments.length > 0 ? (
                    <ul className="space-y-4">
                      {assignments.map((a) => (
                        <li key={a._id} className="border border-slate-200 rounded-lg p-4">
                          {a.assignment_type && (
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              {a.assignment_type}
                            </span>
                          )}
                          {a.description ? (
                            <p className="mt-2 text-slate-700 text-sm leading-relaxed">{a.description}</p>
                          ) : (
                            <p className="mt-2 text-slate-500 text-sm">No description provided.</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm font-medium">No assignments for this topic yet.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
