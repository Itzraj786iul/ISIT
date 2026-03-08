'use client';

import { useState } from 'react';
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
  DollarSign,
  Layers,
  FileText
} from 'lucide-react';

type Lesson = { title: string; duration: string; type: string };
type Module = { title: string; lessons: Lesson[] };

export default function CreateCourse() {
  const router = useRouter();
  
  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('3999');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('Development');
  const [loading, setLoading] = useState(false);

  // Curriculum State
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number | null>(null);

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

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation of API call
    console.log({ title, price, modules });

    setTimeout(() => {
      setLoading(false);
      alert('Course Created Successfully!');
      router.push('/dashboard');
    }, 1500);
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
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none' }}>
            <ChevronLeft size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Back to Dashboard</span>
          </Link>
          <div style={{ height: 20, width: 1, background: '#e2e8f0', margin: '0 8px' }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New Course</h1>
        </div>

        <button 
          onClick={handlePublish}
          disabled={loading}
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
            <div style={{ 
              width: '100%', 
              aspectRatio: 16/9, 
              border: '2px dashed #e2e8f0', 
              borderRadius: 8, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#94a3b8',
              cursor: 'pointer',
              background: '#f8fafc'
            }}>
              <Upload size={24} style={{ marginBottom: 8 }} />
              <span style={{ fontSize: 12 }}>Click to upload image</span>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>Recommended: 1280x720</span>
            </div>
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
        </div>

      </div>
    </div>
  );
}