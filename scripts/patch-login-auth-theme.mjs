import fs from 'fs';

const p = 'src/app/login/page.tsx';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('ThemeToggle')) {
  c = c.replace(
    "import SiteShell from '@/components/SiteShell';",
    "import SiteShell from '@/components/SiteShell';\nimport { ThemeToggle } from '@/components/ThemeToggle';"
  );
}

c = c.replace(
  `<header className="relative z-[1] border-b border-white/[0.08] bg-[#050510]/90 backdrop-blur-xl">
        <motion-safe:REMOVE
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-200 font-semibold transition-colors no-underline hover:text-cyan-100"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-200 animate-pulse-cyan">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ISIC</span>
          </Link>
          <Link href="/" className="text-sm text-cyan-200/80 hover:text-cyan-100 no-underline">
            {tr('funnelBackHome')}
          </Link>
        </div>
      </header>`,
  `<header className="isit-shell-header relative z-[1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold isit-text-primary no-underline hover:opacity-80"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--isit-accent-soft)] isit-accent-text">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ISIC</span>
          </Link>
          <motion-safe:REMOVE
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm isit-muted hover:isit-text-primary no-underline">
              {tr('funnelBackHome')}
            </Link>
          </div>
        </div>
      </header>`
);

c = c.replace(/<motion-safe:REMOVE\s*\n/g, '');
c = c.replace(
  'max-w-md w-full mx-auto isit-glass rounded-3xl p-8 sm:p-10 shadow-2xl',
  'max-w-md w-full mx-auto isit-auth-panel p-8 sm:p-10'
);
c = c.replace(/text-cyan-300\/90/g, 'isit-accent-text opacity-90');
c = c.replace(/text-cyan-50/g, 'isit-text-primary');
c = c.replace(/text-cyan-100\/75/g, 'isit-body');
c = c.replace(/text-cyan-100\/85/g, 'isit-muted');
c = c.replace(/text-cyan-100\/80/g, 'isit-body');
c = c.replace(/text-cyan-100\/60/g, 'isit-muted');
c = c.replace(/text-cyan-300/g, 'isit-accent-text');
c = c.replace(/text-cyan-200/g, 'isit-accent-text');
c = c.replace(
  'rounded-xl border border-cyan-400/25 bg-slate-950/70 px-4 py-3 text-cyan-50 placeholder:text-cyan-200/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/50',
  'isit-input'
);
c = c.replace(
  'mb-6 rounded-xl border border-cyan-400/25 bg-slate-950/70 px-4 py-3 text-xs leading-relaxed text-cyan-100/85',
  'mb-6 rounded-xl border border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] px-4 py-3 text-xs leading-relaxed isit-body'
);
c = c.replace(
  'hidden lg:flex flex-1 order-1 lg:order-2 items-stretch justify-center p-10 xl:p-16 border-l border-cyan-400/10 bg-gradient-to-br from-cyan-950/40 via-slate-950/20 to-transparent',
  'hidden lg:flex flex-1 order-1 lg:order-2 items-stretch justify-center p-10 xl:p-16 border-l border-[color:var(--isit-border)] isit-auth-marketing'
);
c = c.replace('isit-cosmic-bg min-h-screen', 'isit-app-bg min-h-screen');

fs.writeFileSync(p, c);
console.log('login patched');
