import fs from 'fs';

let sb = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

sb = sb.replace(
  /className=\{`flex flex-col fixed left-0 top-0 h-dvh z-30 border-slate-200 bg-white\/95 shadow-lg md:shadow-none transition-\[width\] duration-200 ease-out overflow-hidden backdrop-blur-xl dark:border-white\/\[0\.08\] dark:bg-\[#050510\]\/95 \$\{/,
  'className={`flex flex-col fixed left-0 top-0 h-dvh z-30 isit-shell-aside shadow-lg md:shadow-none transition-[width] duration-200 ease-out overflow-hidden ${'
);

sb = sb.replace(/border-b border-cyan-300\/20/g, 'border-b border-[color:var(--isit-shell-border)]');
sb = sb.replace(/font-bold text-cyan-100 text-sm/g, 'font-bold text-sm isit-text-primary');
sb = sb.replace(/text-\[10px\] text-cyan-200\/70 font-medium/g, 'text-[10px] isit-muted font-medium');
sb = sb.replace(
  'className="p-4 flex items-center gap-3 border-b border-cyan-300/20 no-underline hover:bg-cyan-300/10 transition w-[min(85vw,260px)] md:w-[220px] shrink-0"',
  'className="p-4 flex items-center gap-3 border-b border-[color:var(--isit-shell-border)] no-underline hover:bg-[var(--isit-nav-hover-bg)] transition w-[min(85vw,260px)] md:w-[220px] shrink-0"'
);
sb = sb.replace(/font-semibold text-cyan-100 text-sm truncate/g, 'font-semibold text-sm truncate isit-text-primary');
sb = sb.replace(/text-xs text-cyan-200\/70 truncate/g, 'text-xs isit-muted truncate');
sb = sb.replace(
  /\$\{active \? 'border border-white\/\[0\.1\] bg-white\/\[0\.06\] text-cyan-300' : 'text-slate-400 hover:bg-white\/\[0\.04\] hover:text-slate-200'\}/g,
  "${active ? 'isit-nav-link-active' : 'isit-nav-link'}"
);
sb = sb.replace(/border-t border-cyan-300\/20/g, 'border-t border-[color:var(--isit-shell-border)]');
sb = sb.replace(
  'className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 no-underline dark:text-slate-300 dark:hover:bg-slate-800 active:scale-[0.99]"',
  'className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl text-[13px] font-medium isit-nav-link no-underline active:scale-[0.99]"'
);
sb = sb.replace(
  'className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-40 md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-slate-950/90 border border-cyan-300/25 text-cyan-100 shadow-md hover:bg-cyan-300/10 active:scale-95 transition-transform"',
  'className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-40 md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl isit-card shadow-md isit-text-primary hover:bg-[var(--isit-nav-hover-bg)] active:scale-95 transition-transform"'
);

fs.writeFileSync('src/components/Sidebar.tsx', sb);

// PublicNav - ensure shell header
let pn = fs.readFileSync('src/components/PublicNav.tsx', 'utf8');
if (!pn.includes('isit-shell-header')) {
  pn = pn.replace(
    /sticky top-0 z-50[^\n]+/,
    'isit-shell-header sticky top-0 z-50'
  );
}
fs.writeFileSync('src/components/PublicNav.tsx', pn);

console.log('shells updated');
