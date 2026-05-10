'use client';

/**
 * @legacy MARKETPLACE_LMS — Edit `Course` + `Lesson` documents and thumbnails ( /api/upload ).
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Trash2, Plus, Upload, FileText } from 'lucide-react';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
};

type Lesson = {
  _id: string;
  title: string;
  content: string;
  courseId: string;
  order: number;
  videoUrl?: string;
};

export default function TeacherEditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Development');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      if (meData.user?.role?.toLowerCase() !== 'teacher') {
        router.push('/dashboard');
        return;
      }
    };
    run();
  }, [router]);

  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/course/${courseId}`, { credentials: 'include' });
        if (!res.ok) {
          router.push('/teacher/dashboard');
          return;
        }
        const data = await res.json();
        const c = data.course || data;
        setCourse(c);
        setTitle(c.title || '');
        setDescription(c.description || '');
        setPrice(String(c.price ?? ''));
        setCategory(c.category || 'Development');
        setImageUrl(c.image || '');
        setLessons((data.lessons || []).sort((a: Lesson, b: Lesson) => a.order - b.order));
      } catch (e) {
        console.error(e);
        router.push('/teacher/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, router]);

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
      if (!res.ok) {
        setUploadError(data.message || 'Upload failed');
        return;
      }
      setImageUrl(data.url ?? '');
    } catch {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveCourse = async () => {
    if (!courseId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/course/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          category: category.trim(),
          ...(imageUrl && { image: imageUrl }),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to save');
      }
      setCourse((prev) => (prev ? { ...prev, title: title.trim(), description, price: Number(price) || 0, category, image: imageUrl } : null));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    try {
      const res = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          title: 'New Lesson',
          content: 'Content for this lesson.',
          order: lessons.length,
        }),
      });
      if (!res.ok) throw new Error('Failed to add lesson');
      const newLesson = await res.json();
      setLessons((prev) => [...prev, newLesson].sort((a, b) => a.order - b.order));
    } catch {
      alert('Failed to add lesson');
    }
  };

  const handleUpdateLesson = async (lessonId: string, updates: { title?: string; content?: string; videoUrl?: string }) => {
    try {
      const res = await fetch(`/api/lesson/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setLessons((prev) => prev.map((l) => (l._id === lessonId ? updated : l)));
    } catch {
      alert('Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`/api/lesson/${lessonId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete');
      setLessons((prev) => prev.filter((l) => l._id !== lessonId));
    } catch {
      alert('Failed to delete lesson');
    }
  };

  if (loading || !course) {
    return (
      <div className="isit-cosmic-bg min-h-screen flex items-center justify-center text-cyan-200 relative">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="isit-cosmic-bg min-h-screen font-sans text-cyan-50 relative">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium text-sm">
            <ChevronLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Edit Course</h1>
        </div>
        <button
          type="button"
          onClick={handleSaveCourse}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium text-sm hover:bg-sky-700 disabled:opacity-60"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save course'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Course details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option>Development</option>
                  <option>Business</option>
                  <option>Design</option>
                  <option>Marketing</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
              <div
                role="button"
                tabIndex={0}
                onClick={handleThumbnailClick}
                onKeyDown={(e) => e.key === 'Enter' && handleThumbnailClick()}
                className="w-full aspect-video max-w-sm rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100"
                style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' } : undefined}
              >
                {uploading && <span className="text-sm font-medium">Uploading...</span>}
                {!imageUrl && !uploading && <><Upload size={24} className="mb-1" /> <span className="text-sm">Click to upload</span></>}
                {imageUrl && !uploading && <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">Change</span>}
              </div>
              {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Lessons</h2>
            <button
              type="button"
              onClick={handleAddLesson}
              className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
            >
              <Plus size={16} /> Add lesson
            </button>
          </div>
          <div className="space-y-3">
            {lessons.length === 0 && (
              <p className="text-slate-500 text-sm">No lessons yet. Add one to get started.</p>
            )}
            {lessons.map((lesson, idx) => (
              <LessonRow
                key={lesson._id}
                lesson={lesson}
                index={idx}
                onUpdate={(updates) => handleUpdateLesson(lesson._id, updates)}
                onDelete={() => handleDeleteLesson(lesson._id)}
              />
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <Link href={`/course/${courseId}`} className="text-sky-600 font-medium text-sm hover:underline">
            View course page
          </Link>
          <Link href="/teacher/dashboard" className="text-slate-600 text-sm hover:underline">
            Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  onUpdate,
  onDelete,
}: {
  lesson: Lesson;
  index: number;
  onUpdate: (u: { title?: string; content?: string; videoUrl?: string }) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '');

  const save = () => {
    onUpdate({
      title: title.trim() || lesson.title,
      content: content.trim() || lesson.content,
      videoUrl: videoUrl.trim() || undefined,
    });
    setEditing(false);
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-slate-50">
        <FileText size={18} className="text-slate-500 flex-shrink-0" />
        {!editing ? (
          <>
            <span className="font-medium text-slate-800 flex-1 min-w-0 truncate">Lesson {index + 1}: {lesson.title}</span>
            <button type="button" onClick={() => setEditing(true)} className="text-sky-600 text-sm font-medium">Edit</button>
            <button type="button" onClick={onDelete} className="text-red-600 p-1 rounded hover:bg-red-50">
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
              placeholder="Lesson title"
            />
            <button type="button" onClick={save} className="text-sky-600 text-sm font-medium">Save</button>
            <button type="button" onClick={() => { setEditing(false); setTitle(lesson.title); setContent(lesson.content); setVideoUrl(lesson.videoUrl || ''); }} className="text-slate-500 text-sm">Cancel</button>
          </>
        )}
      </div>
      {editing && (
        <div className="p-3 border-t border-slate-200 space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-0.5">Content / notes</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-0.5">Video URL (optional)</label>
            <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
