'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  PlayCircle
} from 'lucide-react';

type Lesson = { title: string; duration: string; type: string };
type Module = { title: string; lessons: Lesson[] };

export default function CreateCourse() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('3999');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('Development');
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      const u = data.user;
      if (!u) {
        router.push('/login');
        return;
      }
      if (u.role?.toLowerCase() !== 'teacher') {
        router.push('/dashboard');
        return;
      }
      setTeacherId(u._id ?? u.id);
    };
    run();
  }, [router]);

  // --- Handlers ---

  const handleAddModule = () => {
    const newModule: Module = {
      title: `Module ${modules.length + 1}`,
      lessons: [],
    };
    setModules([...modules, newModule]);
    setCurrentModuleIndex(modules.length);
  };

  const handleDeleteModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index);
    setModules(newModules);
    setCurrentModuleIndex(null);
  };

  const handleAddLesson = (modIndex: number) => {
    const newModules = [...modules];
    newModules[modIndex].lessons.push({ title: 'New Lesson', duration: '10 min', type: 'video' });
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
    if (!teacherId) {
      alert('Please sign in as a teacher.');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a course title.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a course description.');
      return;
    }

    setLoading(true);
    try {
      let order = 0;
      const lessons = modules.flatMap((mod) =>
        mod.lessons.map((l) => ({
          title: l.title || 'Untitled Lesson',
          content: 'Content for this lesson.',
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* Top Navigation */}
      <header style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '16px 32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/teacher/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none' }}>
            <ChevronLeft size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Back to Instructor Dashboard</span>
          </Link>
          <div style={{ height: 20, width: 1, background: '#e2e8f0', margin: '0 8px' }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New Course</h1>
        </div>

        <button 
          onClick={handlePublish}
          disabled={loading || !teacherId}
          style={{
            background: loading ? '#94a3b8' : '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {loading ? 'Publishing...' : <><Save size={18} /> Publish Course</>}
        </button>
      </header>

      {/* Success panel after course created */}
      {createdCourseId && (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <CheckCircle size={28} color="#059669" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#065f46', margin: '0 0 8px 0' }}>Course published successfully</h3>
                <p style={{ fontSize: 14, color: '#047857', marginBottom: 12 }}>Share this link with students. They can enroll and start learning.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <code style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: '#0f172a', border: '1px solid #a7f3d0', wordBreak: 'break-all' }}>
                    {typeof window !== 'undefined' ? `${window.location.origin}/course/${createdCourseId}` : `/course/${createdCourseId}`}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: copySuccess ? '#059669' : '#0d9488', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {copySuccess ? <CheckCircle size={18} /> : <Copy size={18} />}
                    {copySuccess ? 'Copied!' : 'Copy link'}
                  </button>
                  <a href={`/course/${createdCourseId}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0d9488', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                    <ExternalLink size={18} /> View course
                  </a>
                  <button
                    type="button"
                    onClick={() => router.push('/teacher/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#047857', border: '1px solid #a7f3d0', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Go to dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', padding: '32px', gap: 32 }}>
        
        {/* LEFT COLUMN: FORM INPUTS */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Section 1: Basic Info */}
          <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: '#dbeafe', padding: 8, borderRadius: 8, color: '#3b82f6' }}>
                <BookOpen size={20} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Course Information</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Course Title
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Complete Web Development Bootcamp 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Short Subtitle
                </label>
                <input 
                  type="text" 
                  placeholder="A catchy one-line description"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Course Description
                </label>
                <textarea 
                  placeholder="What will students learn in this course?"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14, resize: 'vertical' }}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Curriculum Builder */}
          <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#f3e8ff', padding: 8, borderRadius: 8, color: '#9333ea' }}>
                  <Layers size={20} />
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Course Curriculum</h2>
              </div>
              <button 
                onClick={handleAddModule}
                style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  border: '1px dashed #cbd5e1', 
                  padding: '8px 16px', 
                  borderRadius: 8, 
                  fontSize: 13, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6 
                }}
              >
                <PlusCircle size={16} /> Add Module
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {modules.map((module, mIdx) => (
                <div key={mIdx} style={{ border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                  {/* Module Header */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={module.title}
                      onChange={(e) => {
                        const newModules = [...modules];
                        newModules[mIdx].title = e.target.value;
                        setModules(newModules);
                      }}
                      style={{ background: 'transparent', border: 'none', fontWeight: 700, fontSize: 14, color: '#334155', width: '70%', outline: 'none' }}
                    />
                    <button 
                      onClick={() => handleDeleteModule(mIdx)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Lessons List */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {module.lessons.length === 0 && (
                      <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 10 }}>
                        No lessons added yet
                      </div>
                    )}
                    {module.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ color: '#cbd5e1' }}><FileText size={16} /></div>
                        <input 
                          type="text" 
                          value={lesson.title}
                          onChange={(e) => {
                            const newModules = [...modules];
                            newModules[mIdx].lessons[lIdx].title = e.target.value;
                            setModules(newModules);
                          }}
                          style={{ flex: 1, border: 'none', fontSize: 13, color: '#475569', outline: 'none' }}
                        />
                        <input 
                          type="text" 
                          placeholder="10 min"
                          value={lesson.duration}
                          onChange={(e) => {
                            const newModules = [...modules];
                            newModules[mIdx].lessons[lIdx].duration = e.target.value;
                            setModules(newModules);
                          }}
                          style={{ width: 60, border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12, padding: 4 }}
                        />
                        <button 
                          onClick={() => handleDeleteLesson(mIdx, lIdx)}
                          style={{ color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => handleAddLesson(mIdx)}
                      style={{ marginTop: 4, fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
                    >
                      + Add Lesson Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: SETTINGS & PREVIEW */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Thumbnail Upload */}
          <section style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Course Thumbnail</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleThumbnailChange}
              style={{ display: 'none' }}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={handleThumbnailClick}
              onKeyDown={(e) => e.key === 'Enter' && handleThumbnailClick()}
              style={{
                width: '100%',
                aspectRatio: 16 / 9,
                border: '2px dashed #e2e8f0',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: uploading ? 'wait' : 'pointer',
                background: imageUrl ? `url(${imageUrl}) center/cover` : '#f8fafc',
                position: 'relative',
              }}
            >
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
                  Uploading...
                </div>
              )}
              {!imageUrl && !uploading && (
                <>
                  <Upload size={24} style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 12 }}>Click to upload image</span>
                  <span style={{ fontSize: 11, color: '#cbd5e1' }}>JPEG, PNG, WebP or GIF · Max 5MB · 1280×720 recommended</span>
                </>
              )}
              {imageUrl && !uploading && (
                <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 4 }}>Change image</span>
              )}
            </div>
            {uploadError && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{uploadError}</p>}
          </section>

          {/* Course Settings */}
          <section style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Course Settings</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Price (INR)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }}>₹</span>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 28px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
              >
                <option>Development</option>
                <option>Business</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Level</label>
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
          </section>

          {/* How students will experience this course */}
          <section style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#e0f2fe', padding: 8, borderRadius: 8, color: '#0284c7' }}>
                <PlayCircle size={20} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0f172a' }}>How students will experience this course</h3>
            </div>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
              <li style={{ marginBottom: 6 }}>Your course appears on the course page with thumbnail and description.</li>
              <li style={{ marginBottom: 6 }}>Students enroll (or purchase if paid).</li>
              <li style={{ marginBottom: 6 }}>They see the lesson list and open lessons in order.</li>
              <li style={{ marginBottom: 6 }}>Each lesson has video, notes, and the AI tutor for questions.</li>
              <li style={{ marginBottom: 0 }}>Progress is saved; they can take quizzes and get a certificate when complete.</li>
            </ol>
            {createdCourseId && (
              <p style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
                <strong>Course link:</strong>{' '}
                <a href={`/course/${createdCourseId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>
                  Open course page
                </a>
              </p>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}