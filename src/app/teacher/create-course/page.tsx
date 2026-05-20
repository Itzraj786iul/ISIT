'use client';

/**
 * @legacy MARKETPLACE_LMS — POST /api/course (+ lessons). Prefer publishing Subject/Topic content long-term.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherShell from '../_components/TeacherShell';
import {
  PlusCircle,
  Save,
  Trash2,
  Upload,
  ChevronLeft,
  X,
  BookOpen,
  Layers,
  FileText,
  Copy,
  ExternalLink,
  CheckCircle,
  PlayCircle,
} from 'lucide-react';

type User = { _id?: string; name: string; role: string };
type Lesson = { title: string; duration: string; type: string };
type Module = { title: string; lessons: Lesson[] };

export default function CreateCourse() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('Development');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) { router.push('/login'); return; }
      const data = await res.json();
      const u = data.user;
      if (!u || u.role?.toLowerCase() !== 'teacher') { router.push('/dashboard'); return; }
      setUser(u);
      setTeacherId(u._id ?? u.id);
    };
    run();
  }, [router]);

  const handleAddModule = () => {
    setModules([...modules, { title: `Module ${modules.length + 1}`, lessons: [] }]);
  };

  const handleDeleteModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleAddLesson = (modIndex: number) => {
    const newModules = [...modules];
    newModules[modIndex].lessons.push({ title: 'New Lesson', duration: '', type: 'video' });
    setModules(newModules);
  };

  const handleDeleteLesson = (modIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[modIndex].lessons.splice(lessonIndex, 1);
    setModules(newModules);
  };

  const handleThumbnailClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setUploadError(data.message || 'Upload failed'); return; }
      setImageUrl(data.url ?? '');
    } catch {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyLink = () => {
    if (!createdCourseId || typeof window === 'undefined') return;
    const url = `${window.location.origin}/course/${createdCourseId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) { alert('Please sign in as a teacher.'); return; }
    if (!title.trim()) { alert('Please enter a course title.'); return; }
    if (!description.trim()) { alert('Please enter a course description.'); return; }

    setLoading(true);
    try {
      let order = 0;
      const lessons = modules.flatMap((mod) =>
        mod.lessons.map((l) => ({
          title: l.title || 'Untitled Lesson',
          content: '',
          order: order++,
        }))
      );

      const res = await fetch('/api/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          category: category.trim() || 'Development',
          ...(imageUrl && { image: imageUrl }),
          lessons,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create course');
      }
      const data = await res.json();
      const id = data.course?._id ?? data.course?.id;
      if (id) setCreatedCourseId(id);
      else router.push('/teacher/dashboard');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherShell user={user}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="text-lg font-bold text-slate-900">Create New Course</h1>
        </div>
        <button
          type="button"
          onClick={handlePublish}
          disabled={loading || !teacherId}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition disabled:cursor-not-allowed"
        >
          {loading ? 'Publishing...' : <><Save className="w-4 h-4" /> Publish Course</>}
        </button>
      </div>

      {/* Success banner */}
      {createdCourseId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3 flex-wrap">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-emerald-800 mb-1">Course published successfully!</h3>
              <code className="text-xs bg-white text-slate-800 border border-emerald-200 rounded px-2 py-1 block break-all mb-3">
                {typeof window !== 'undefined' ? `${window.location.origin}/course/${createdCourseId}` : `/course/${createdCourseId}`}
              </code>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleCopyLink} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700">
                  {copySuccess ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
                </button>
                <a href={`/course/${createdCourseId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-medium hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> View course
                </a>
                <button type="button" onClick={() => router.push('/teacher/dashboard')} className="text-xs text-slate-600 dark:text-slate-300 hover:underline">
                  Go to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">
        {/* LEFT: Form */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Basic Info */}
          <section className="isit-app-panel rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-sky-600" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Course Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title</label>
                <input type="text" placeholder="e.g., Complete Web Development Bootcamp" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea placeholder="What will students learn?" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-sky-500 resize-y" />
              </div>
            </div>
          </section>

          {/* Curriculum Builder */}
          <section className="isit-app-panel rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-violet-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Course Curriculum</h2>
              </div>
              <button type="button" onClick={handleAddModule} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                <PlusCircle className="w-4 h-4" /> Add Module
              </button>
            </div>
            <div className="space-y-4">
              {modules.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-6">No modules yet. Click &quot;Add Module&quot; to get started.</p>
              )}
              {modules.map((module, mIdx) => (
                <div key={mIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <input type="text" value={module.title} onChange={(e) => { const m = [...modules]; m[mIdx].title = e.target.value; setModules(m); }} className="bg-transparent border-none font-semibold text-sm text-slate-800 outline-none flex-1 min-w-0" />
                    <button type="button" onClick={() => handleDeleteModule(mIdx)} className="text-red-500 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    {module.lessons.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">No lessons added yet</p>
                    )}
                    {module.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input type="text" value={lesson.title} onChange={(e) => { const m = [...modules]; m[mIdx].lessons[lIdx].title = e.target.value; setModules(m); }} className="flex-1 border-none text-sm text-slate-700 outline-none min-w-0" />
                        <input type="text" placeholder="Duration" value={lesson.duration} onChange={(e) => { const m = [...modules]; m[mIdx].lessons[lIdx].duration = e.target.value; setModules(m); }} className="w-20 border border-slate-200 rounded px-2 py-1 text-xs" />
                        <button type="button" onClick={() => handleDeleteLesson(mIdx, lIdx)} className="text-slate-400 hover:text-red-500 p-0.5">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddLesson(mIdx)} className="text-xs text-sky-600 hover:text-sky-700 font-medium mt-1">
                      + Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: Settings */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* Thumbnail */}
          <section className="isit-app-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Course Thumbnail</h3>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleThumbnailChange} className="hidden" />
            <div
              role="button"
              tabIndex={0}
              onClick={handleThumbnailClick}
              onKeyDown={(e) => e.key === 'Enter' && handleThumbnailClick()}
              className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-slate-300 bg-slate-50 relative overflow-hidden"
              style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              {uploading && <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Uploading...</span>}
              {!imageUrl && !uploading && (
                <>
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Click to upload</span>
                </>
              )}
              {imageUrl && !uploading && (
                <span className="absolute bottom-2 right-2 bg-black/60 text-slate-900 dark:text-white text-[10px] px-2 py-0.5 rounded">Change</span>
              )}
            </div>
            {uploadError && <p className="text-red-600 text-xs mt-2">{uploadError}</p>}
          </section>

          {/* Settings */}
          <section className="isit-app-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Course Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">{'\u20B9'}</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 for free" className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500">
                  <option>Development</option>
                  <option>Business</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Science</option>
                  <option>Mathematics</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>
          </section>

          {/* Info */}
          <section className="isit-app-panel rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-sky-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">How it works</h3>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-4 list-decimal leading-relaxed">
              <li>Your course appears on the course page with thumbnail and description.</li>
              <li>Students enroll (or purchase if paid).</li>
              <li>They see the lesson list and open lessons in order.</li>
              <li>Each lesson has video, notes, and the AI tutor for questions.</li>
              <li>Progress is saved; they can take quizzes and earn a certificate.</li>
            </ol>
          </section>
        </div>
      </div>
    </TeacherShell>
  );
}
