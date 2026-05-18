import fs from 'fs';

// Sidebar.tsx
let sb = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sb = sb.replace(/border-b border-cyan-300\/20/g, 'border-b border-slate-200 dark:border-cyan-300/20');
sb = sb.replace(/font-bold text-cyan-100 text-sm/g, 'font-bold text-slate-800 dark:text-cyan-100 text-sm');
sb = sb.replace(/text-\[10px\] text-cyan-200\/70 font-medium/g, 'text-[10px] text-slate-500 dark:text-cyan-200/70 font-medium');
sb = sb.replace(
  /className="p-4 flex items-center gap-3 border-b border-cyan-300\/20 no-underline hover:bg-cyan-300\/10/g,
  'className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-cyan-300/20 no-underline hover:bg-slate-100 dark:hover:bg-cyan-300/10'
);
sb = sb.replace(/font-semibold text-cyan-100 text-sm truncate/g, 'font-semibold text-slate-800 dark:text-cyan-100 text-sm truncate');
sb = sb.replace(/text-xs text-cyan-200\/70 truncate/g, 'text-xs text-slate-500 dark:text-cyan-200/70 truncate');
sb = sb.replace(
  /\$\{active \? 'border border-white\/\[0\.1\] bg-white\/\[0\.06\] text-cyan-300' : 'text-slate-400 hover:bg-white\/\[0\.04\] hover:text-slate-200'\}/g,
  "${active ? 'border border-sky-200 bg-sky-50 text-sky-700 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-cyan-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200'}"
);
sb = sb.replace(/border-t border-cyan-300\/20/g, 'border-t border-slate-200 dark:border-cyan-300/20');
fs.writeFileSync('src/components/Sidebar.tsx', sb);

// PublicNav.tsx
let pn = fs.readFileSync('src/components/PublicNav.tsx', 'utf8');
pn = pn.replace(
  'border-b border-white/[0.08] bg-[#050510]/90 backdrop-blur-xl',
  'border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#050510]/90'
);
pn = pn.replace(/text-cyan-100 transition hover:bg-cyan-300\/10 md:hidden/g, 'text-slate-700 transition hover:bg-slate-100 dark:text-cyan-100 dark:hover:bg-cyan-300/10 md:hidden');
pn = pn.replace(/flex min-w-0 items-center gap-2 sm:gap-3 text-cyan-100/g, 'flex min-w-0 items-center gap-2 sm:gap-3 text-slate-800 dark:text-cyan-100');
pn = pn.replace(/navLinkClass = \(isActive: boolean\) =>\s*isActive \? 'border-b-2 border-cyan-300 pb-1 text-cyan-200' : 'text-slate-300 transition hover:text-cyan-200'/s,
  "navLinkClass = (isActive: boolean) =>\n    isActive ? 'border-b-2 border-sky-600 pb-1 text-sky-700 dark:border-cyan-300 dark:text-cyan-200' : 'text-slate-600 transition hover:text-sky-700 dark:text-slate-300 dark:hover:text-cyan-200'"
);
fs.writeFileSync('src/components/PublicNav.tsx', pn);

// TeacherShell.tsx
let ts = fs.readFileSync('src/app/teacher/_components/TeacherShell.tsx', 'utf8');
ts = ts.replace(
  'isit-cosmic-bg min-h-screen flex font-sans text-cyan-100 relative',
  'isit-cosmic-bg min-h-screen flex font-sans relative'
);
ts = ts.replace(
  'bg-slate-950/95 border-r border-cyan-300/20',
  'bg-white/95 border-r border-slate-200 dark:bg-slate-950/95 dark:border-cyan-300/20'
);
ts = ts.replace(/border-b border-cyan-300\/20/g, 'border-b border-slate-200 dark:border-cyan-300/20');
ts = ts.replace(/font-bold text-cyan-100 text-sm/g, 'font-bold text-slate-800 dark:text-cyan-100 text-sm');
ts = ts.replace(/text-\[10px\] text-cyan-200\/70 font-medium/g, 'text-[10px] text-slate-500 dark:text-cyan-200/70 font-medium');
ts = ts.replace(
  /\$\{active \? 'bg-cyan-400\/15 text-cyan-200' : 'text-cyan-100\/85 hover:bg-cyan-300\/10'\}/g,
  "${active ? 'bg-sky-100 text-sky-800 dark:bg-cyan-400/15 dark:text-cyan-200' : 'text-slate-600 hover:bg-slate-100 dark:text-cyan-100/85 dark:hover:bg-cyan-300/10'}"
);
ts = ts.replace(/border-t border-cyan-300\/20/g, 'border-t border-slate-200 dark:border-cyan-300/20');
ts = ts.replace(/text-cyan-100\/85 hover:bg-cyan-300\/10/g, 'text-slate-600 hover:bg-slate-100 dark:text-cyan-100/85 dark:hover:bg-cyan-300/10');
ts = ts.replace(/text-cyan-200\/70 hover:text-cyan-100/g, 'text-slate-500 hover:text-slate-800 dark:text-cyan-200/70 dark:hover:text-cyan-100');
ts = ts.replace(/bg-slate-950\/90 border border-cyan-300\/20/g, 'bg-white/90 border border-slate-200 dark:bg-slate-950/90 dark:border-cyan-300/20');
ts = ts.replace(/text-cyan-100 shadow-sm hover:bg-cyan-300\/10/g, 'text-slate-800 shadow-sm hover:bg-slate-100 dark:text-cyan-100 dark:hover:bg-cyan-300/10');
fs.writeFileSync('src/app/teacher/_components/TeacherShell.tsx', ts);

// ParentNav.tsx + layout
let pnav = fs.readFileSync('src/components/ParentNav.tsx', 'utf8');
pnav = pnav.replace(
  'bg-slate-950/95 border-r border-cyan-300/20',
  'bg-white/95 border-r border-slate-200 dark:bg-slate-950/95 dark:border-cyan-300/20'
);
pnav = pnav.replace(/border-b border-cyan-300\/20/g, 'border-b border-slate-200 dark:border-cyan-300/20');
pnav = pnav.replace(/font-bold text-cyan-100 text-sm/g, 'font-bold text-slate-800 dark:text-cyan-100 text-sm');
pnav = pnav.replace(/text-\[10px\] text-cyan-200\/70 font-medium/g, 'text-[10px] text-slate-500 dark:text-cyan-200/70 font-medium');
pnav = pnav.replace(
  /\$\{active \? 'bg-cyan-400\/15 text-cyan-200' : 'text-cyan-100\/85 hover:bg-cyan-300\/10'\}/g,
  "${active ? 'bg-sky-100 text-sky-800 dark:bg-cyan-400/15 dark:text-cyan-200' : 'text-slate-600 hover:bg-slate-100 dark:text-cyan-100/85 dark:hover:bg-cyan-300/10'}"
);
pnav = pnav.replace(/border-t border-cyan-300\/20/g, 'border-t border-slate-200 dark:border-cyan-300/20');
pnav = pnav.replace(/text-cyan-100\/85 hover:bg-cyan-300\/10/g, 'text-slate-600 hover:bg-slate-100 dark:text-cyan-100/85 dark:hover:bg-cyan-300/10');
fs.writeFileSync('src/components/ParentNav.tsx', pnav);

let pl = fs.readFileSync('src/app/parent/layout.tsx', 'utf8');
pl = pl.replace('isit-cosmic-bg min-h-screen flex text-cyan-50 relative', 'isit-cosmic-bg min-h-screen flex relative');
pl = pl.replace('text-cyan-200', 'text-slate-600 dark:text-cyan-200');
fs.writeFileSync('src/app/parent/layout.tsx', pl);

// Blog page light text fixes
let blog = fs.readFileSync('src/app/blog/page.tsx', 'utf8');
blog = blog.replace(/text-gray-900/g, 'text-slate-900 dark:text-gray-900');
blog = blog.replace(/text-gray-800/g, 'text-slate-700 dark:text-gray-800');
blog = blog.replace(/text-gray-700/g, 'text-slate-600 dark:text-gray-700');
blog = blog.replace(/bg-gray-200 text-gray-800/g, 'bg-slate-200 text-slate-800 dark:bg-gray-200 dark:text-gray-800');
fs.writeFileSync('src/app/blog/page.tsx', blog);

console.log('nav theme patches applied');
