'use client';

/** Parent nav includes @legacy MARKETPLACE_LMS "Browse Courses" (/courses). See docs/AI_FIRST_MIGRATION.md */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, Plus, Settings, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems = [
    { href: '/parent/dashboard', label: 'Dashboard', icon: <Heart size={18} /> },
    { href: '/parent/children', label: 'My Children', icon: <Users size={18} /> },
    { href: '/parent/children/add', label: 'Add Child', icon: <Plus size={18} /> },
    { href: '/courses', label: 'Browse Courses', icon: <BookOpen size={18} /> },
  ];

  return (
    <aside className="w-[250px] min-w-[250px] bg-white border-r border-slate-200 flex flex-col fixed h-screen top-0 z-10">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center text-white font-bold">
          I
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">ISIT</p>
          <p className="text-[10px] text-slate-500 font-medium">Parent Portal</p>
        </div>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon }) => {
          const active =
            pathname === href ||
            (href === '/parent/children' && pathname.startsWith('/parent/children/') && pathname !== '/parent/children/add');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition ${
                active ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 no-underline ${
            pathname === '/settings' ? 'bg-slate-100' : ''
          }`}
        >
          <Settings size={18} /> Settings
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
