import fs from 'fs';

const p = 'src/components/Sidebar.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/<motion-safe:REMOVE\s*\n/g, '');
c = c.replace(/<\/motion-safe:REMOVE\s*\n/g, '');
c = c.replace(/border-b border-cyan-300\/20/g, 'border-b border-[color:var(--isit-shell-border)]');
c = c.replace(/font-bold text-cyan-100 text-sm/g, 'font-bold text-sm isit-text-primary');
c = c.replace(/text-\[10px\] text-cyan-200\/70 font-medium/g, 'text-[10px] isit-muted font-medium');
c = c.replace(
  'className="p-4 flex items-center gap-3 border-b border-cyan-300/20 no-underline hover:bg-cyan-300/10 transition w-[min(85vw,260px)] md:w-[220px] shrink-0"',
  'className="p-4 flex items-center gap-3 border-b border-[color:var(--isit-shell-border)] no-underline hover:bg-[var(--isit-nav-hover-bg)] transition w-[min(85vw,260px)] md:w-[220px] shrink-0"'
);
c = c.replace(/font-semibold text-cyan-100 text-sm truncate/g, 'font-semibold text-sm truncate isit-text-primary');
c = c.replace(/text-xs text-cyan-200\/70 truncate/g, 'text-xs isit-muted truncate');
c = c.replace(
  /\$\{active \? 'border border-white\/\[0\.1\] bg-white\/\[0\.06\] text-cyan-300' : 'text-slate-400 hover:bg-white\/\[0\.04\] hover:text-slate-200'\}/g,
  "${active ? 'isit-nav-link-active' : 'isit-nav-link'}"
);
c = c.replace(/border-t border-cyan-300\/20/g, 'border-t border-[color:var(--isit-shell-border)]');
c = c.replace(
  /className="flex items-center gap-3 px-3 py-3 min-h-\[44px\] rounded-xl text-\[13px\] font-medium text-slate-600 hover:bg-slate-50 no-underline dark:text-slate-300 dark:hover:bg-slate-800 active:scale-\[0\.99\]"/g,
  'className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl text-[13px] font-medium isit-nav-link no-underline active:scale-[0.99]"'
);
c = c.replace(
  'className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-40 md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-slate-950/90 border border-cyan-300/25 text-cyan-100 shadow-md hover:bg-cyan-300/10 active:scale-95 transition-transform"',
  'className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-40 md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl isit-card shadow-md isit-text-primary hover:bg-[var(--isit-nav-hover-bg)] active:scale-95 transition-transform"'
);
fs.writeFileSync(p, c);
console.log('sidebar ok');
