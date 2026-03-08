'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Check, Lock, Target, Clock, ChevronRight } from 'lucide-react';

type ModuleStatus = 'completed' | 'in_progress' | 'locked';

type Module = {
  id: string;
  title: string;
  status: ModuleStatus;
};

const MOCK_PATH = {
  id: 'fullstack',
  title: 'Full Stack Web Development',
  description: 'Master frontend and backend development',
  coursesCompleted: 5,
  coursesTotal: 8,
  duration: '6 months',
  progressPercent: 65,
  modules: [
    { id: '1', title: 'HTML & CSS Fundamentals', status: 'completed' as ModuleStatus },
    { id: '2', title: 'JavaScript Essentials', status: 'completed' as ModuleStatus },
    { id: '3', title: 'React.js', status: 'completed' as ModuleStatus },
    { id: '4', title: 'Node.js & Express', status: 'in_progress' as ModuleStatus },
    { id: '5', title: 'Database Management', status: 'locked' as ModuleStatus },
    { id: '6', title: 'API Development', status: 'locked' as ModuleStatus },
    { id: '7', title: 'Deployment & DevOps', status: 'locked' as ModuleStatus },
    { id: '8', title: 'Final Project', status: 'locked' as ModuleStatus },
  ] as Module[],
};

export default function LearningPathPage() {
  const router = useRouter();
  const [path] = useState(MOCK_PATH);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user?.role?.toLowerCase() === 'teacher') {
      router.push('/teacher/dashboard');
    }
  }, [router]);

  const nextModule = path.modules.find((m) => m.status === 'in_progress') ?? path.modules.find((m) => m.status === 'locked');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Learning Paths</h1>
          <p className="text-slate-500 text-sm mt-1">Follow structured paths to achieve your goals</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
          {/* Blue accent bar */}
          <div className="h-1.5 bg-sky-500" />

          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{path.title}</h2>
                <p className="text-slate-500 text-sm mt-0.5">{path.description}</p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <Target className="w-4 h-4 text-slate-400" />
                    {path.coursesCompleted}/{path.coursesTotal} courses
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {path.duration}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-extrabold text-slate-800">{path.progressPercent}%</div>
                <div className="text-xs text-slate-500 font-medium">Complete</div>
              </div>
            </div>

            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${path.progressPercent}%` }}
              />
            </div>

            <h3 className="text-base font-bold text-slate-800 mt-6 mb-3">Modules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {path.modules.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => mod.status !== 'locked' && (mod.status === 'in_progress' ? router.push('/my-courses') : undefined)}
                  disabled={mod.status === 'locked'}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                    mod.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      : mod.status === 'in_progress'
                        ? 'bg-sky-50 text-sky-800 border border-sky-100 cursor-pointer hover:bg-sky-100'
                        : 'bg-slate-50 text-slate-500 border border-slate-100 cursor-not-allowed'
                  }`}
                >
                  {mod.status === 'completed' && (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </span>
                  )}
                  {mod.status === 'in_progress' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
                  )}
                  {mod.status === 'locked' && (
                    <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="font-medium flex-1">{mod.title}</span>
                </button>
              ))}
            </div>

            <Link
              href={nextModule ? '/my-courses' : '#'}
              className="mt-6 flex items-center justify-center gap-2 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition"
            >
              Continue Path <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
