'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, BookOpen, HelpCircle, FileText, Video, AlertCircle, ChevronRight } from 'lucide-react';

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

/** Simple markdown-like rendering: escape HTML, then convert ** and headers. */
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

function difficultyBadge(level?: string) {
  if (!level) return null;
  const l = String(level).toLowerCase();
  const colors =
    l === 'beginner'
      ? 'bg-emerald-100 text-emerald-800'
      : l === 'intermediate'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-rose-100 text-rose-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {level}
    </span>
  );
}

export default function TopicLearningPage() {
  const params = useParams();
  const id = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [notes, setNotes] = useState<TopicNote[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const videoPlaySent = useRef(false);
  const videoSectionRef = useRef<HTMLElement | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const performanceSentRef = useRef(false);
  const sessionEndSentRef = useRef(false);

  const sendSessionEvent = useCallback(
    async (eventType: string, content?: string, metadata?: Record<string, unknown>) => {
      if (!sessionId) return;
      try {
        await fetch('/api/session-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sessionId, eventType, content, metadata }),
        });
      } catch (err) {
        console.error('Failed to send session event', err);
      }
    },
    [sessionId]
  );

  const sendMasteryUpdate = useCallback(async (topicId: string, isCorrect: boolean) => {
    if (!user?._id) return;
    try {
      await fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ topicId, isCorrect }),
      });
    } catch (err) {
      console.error('Failed to update mastery', err);
    }
  }, [user?._id]);

  const sendPerformanceUpdate = useCallback(async (topicId: string, timeSpentMinutes: number) => {
    if (!user?._id || timeSpentMinutes <= 0) return;
    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ topicId, timeSpent: timeSpentMinutes }),
      });
    } catch (err) {
      console.error('Failed to update performance', err);
    }
  }, [user?._id]);

  const endSessionOnExit = useCallback(async () => {
    if (!sessionId) return;
    try {
      await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.error('Failed to end session', err);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        const meData = meRes.ok ? await meRes.json() : null;
        const userData = meData?.user as User | undefined;
        if (userData?._id) setUser(userData);

        const topicRes = await fetch(`/api/topics/${id}`);
        const topicJson = (await topicRes.json()) as { success?: boolean; data?: Topic; error?: string };
        if (!topicRes.ok || !topicJson.success || !topicJson.data) {
          if (topicRes.status === 404) setNotFound(true);
          setLoading(false);
          return;
        }
        const topicData = topicJson.data;
        setTopic(topicData);

        const [videosRes, notesRes, questionsRes, assignmentsRes] = await Promise.all([
          fetch(`/api/videos?topicId=${encodeURIComponent(id)}`),
          fetch(`/api/topic-notes?topicId=${encodeURIComponent(id)}`),
          fetch(`/api/questions?topicId=${encodeURIComponent(id)}`),
          fetch(`/api/assignments?topicId=${encodeURIComponent(id)}`),
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

        if (userData?._id && topicData.subject_id) {
          try {
            const sessionRes = await fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                topicId: id,
                subjectId: topicData.subject_id,
                mode: 'explorer',
              }),
            });
            const sessionJson = (await sessionRes.json()) as { success?: boolean; data?: { _id?: string } };
            if (sessionRes.ok && sessionJson.success && sessionJson.data?._id) {
              setSessionId(sessionJson.data._id);
            }
          } catch (err) {
            console.error('Failed to create session', err);
          }
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
    if (!sessionId || !videoSectionRef.current || videos.length === 0) return;
    const el = videoSectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!videoPlaySent.current) {
            videoPlaySent.current = true;
            sendSessionEvent('play', undefined, { source: 'video_visible' });
          }
        } else {
          sendSessionEvent('pause', undefined, { source: 'video_left_viewport' });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sessionId, videos.length, sendSessionEvent]);

  useEffect(() => {
    if (!id || !user?._id) return;
    const sendTimeSpent = () => {
      if (performanceSentRef.current) return;
      performanceSentRef.current = true;
      const minutes = (Date.now() - pageLoadTimeRef.current) / 60000;
      if (minutes < 0.1) return;
      sendPerformanceUpdate(id, Math.round(minutes * 10) / 10);
    };
    const tryEndSession = () => {
      if (sessionEndSentRef.current) return;
      sessionEndSentRef.current = true;
      endSessionOnExit();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendTimeSpent();
        tryEndSession();
      }
    };
    const onBeforeUnload = () => {
      sendTimeSpent();
      tryEndSession();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      sendTimeSpent();
      tryEndSession();
    };
  }, [id, user?._id, sendPerformanceUpdate, endSessionOnExit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-slate-600 font-medium">Loading topic...</div>
      </div>
    );
  }

  if (notFound || !topic) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h1 className="text-xl font-semibold text-slate-900">Topic not found</h1>
        <p className="text-slate-600 text-center">The topic you’re looking for doesn’t exist or was removed.</p>
        <Link
          href="/dashboard"
          className="text-sky-600 font-medium hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const firstVideoUrl = videos[0]?.video_url;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Link href="/dashboard" className="text-sky-600 font-medium hover:underline">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/subjects" className="text-sky-600 font-medium hover:underline">Subjects</Link>
            {topic?.subject_id && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <Link href={`/subject/${topic.subject_id}`} className="text-sky-600 font-medium hover:underline">Topics</Link>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{topic.topic_name}</h1>
          {topic.topic_description && (
            <p className="mt-1 text-slate-600 text-sm leading-relaxed">{topic.topic_description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {difficultyBadge(topic.difficulty_level)}
            {topic.estimated_time != null && topic.estimated_time > 0 && (
              <span className="inline-flex items-center gap-1 text-slate-500 text-sm">
                <Clock className="w-4 h-4" />
                {topic.estimated_time} min
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Section 1: Video Player */}
        <section
          ref={videoSectionRef}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-sky-600" />
            <h2 className="font-semibold text-slate-900">Video</h2>
          </div>
          <div className="p-4 sm:p-6">
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
                <p className="text-xs mt-1">Check back later or explore notes and questions below.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Notes */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <h2 className="font-semibold text-slate-900">Notes</h2>
          </div>
          <div className="p-4 sm:p-6">
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
                <p className="text-xs mt-1">Notes will appear here when they’re added.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Practice Questions */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <h2 className="font-semibold text-slate-900">Practice Questions</h2>
          </div>
          <div className="p-4 sm:p-6">
            {questions.length > 0 ? (
              <ul className="space-y-6">
                {questions.map((q, index) => {
                  const selected = selectedAnswers[q._id];
                  const correctAnswer = q.correct_answer;
                  const isAnswered = selected != null;
                  const isCorrect = isAnswered && selected === correctAnswer;
                  return (
                    <li key={q._id} className={`border rounded-lg p-4 transition ${
                      isAnswered
                        ? isCorrect
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-red-300 bg-red-50/50'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-900">
                          {index + 1}. {q.question_text}
                        </p>
                        {isAnswered && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>
                      {q.difficulty_level && !isAnswered && (
                        <span className="text-xs text-slate-500">{String(q.difficulty_level)}</span>
                      )}
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
                                  disabled={isAnswered}
                                  onClick={() => {
                                    const correct = correctAnswer != null && opt === correctAnswer;
                                    setSelectedAnswers((prev) => ({ ...prev, [q._id]: opt }));
                                    sendSessionEvent('answer', opt, {
                                      questionId: q._id,
                                      isCorrect: correct,
                                    });
                                    sendMasteryUpdate(id, correct);
                                  }}
                                  className={`w-full text-left text-sm px-4 py-2 rounded-lg border transition ${btnClass} ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  {opt}
                                  {isAnswered && isThisCorrect && <span className="ml-2 text-emerald-600">✓</span>}
                                  {isAnswered && isThisSelected && !isThisCorrect && <span className="ml-2 text-red-500">✕</span>}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {isAnswered && q.explanation && (
                        <div className={`mt-3 px-3 py-2 rounded-md text-xs leading-relaxed ${
                          isCorrect ? 'bg-emerald-100/60 text-emerald-800' : 'bg-amber-100/60 text-amber-900'
                        }`}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium">No practice questions yet.</p>
                <p className="text-xs mt-1">Questions will appear here when they’re added.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Assignments */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="font-semibold text-slate-900">Assignments</h2>
          </div>
          <div className="p-4 sm:p-6">
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
                <p className="text-xs mt-1">Assignments will appear here when they’re added.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
