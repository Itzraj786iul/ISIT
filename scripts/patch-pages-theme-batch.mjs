/**
 * Batch semantic theme migration for app/marketing pages.
 * Skips node_modules, .next, styles/.
 */
import fs from 'fs';
import path from 'path';

const ROOT = 'src';
const SKIP_DIRS = new Set(['node_modules', '.next', 'styles']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p, out);
    } else if (/\.(tsx|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

function patch(content, file) {
  let c = content;
  const orig = c;

  c = c.replace(/<motion-safe:REMOVE\s*\n/g, '');

  // App cards: cyan text on glass -> semantic
  c = c.replace(
    /isit-glass motion-safe-transition flex items-center justify-between rounded-xl p-4 text-cyan-50/g,
    'isit-card motion-safe-transition flex items-center justify-between rounded-xl p-4 isit-text-primary'
  );
  c = c.replace(
    /isit-glass block rounded-2xl p-6 no-underline motion-safe-transition/g,
    'isit-card block rounded-2xl p-6 no-underline motion-safe-transition'
  );
  c = c.replace(
    /isit-glass flex h-full flex-col rounded-xl p-5 motion-safe-transition/g,
    'isit-card flex h-full flex-col rounded-xl p-5 motion-safe-transition'
  );

  // Marketing dark-only cards
  c = c.replace(
    /bg-slate-950\/65 rounded-2xl shadow border border-cyan-300\/20/g,
    'isit-card rounded-2xl shadow-sm border'
  );
  c = c.replace(
    /bg-slate-950\/65 rounded-xl shadow border border-cyan-300\/20/g,
    'isit-card rounded-xl shadow-sm border'
  );
  c = c.replace(
    /bg-slate-950\/65 rounded-2xl shadow-sm border border-cyan-300\/20/g,
    'isit-card rounded-2xl shadow-sm border'
  );

  // Common heading/body leaks in app shells (not landing replica)
  if (!file.includes('LandingHomeContent')) {
    c = c.replace(/\btext-cyan-50\b/g, 'isit-text-primary');
    c = c.replace(/\btext-cyan-100\/75\b/g, 'isit-body');
    c = c.replace(/\btext-cyan-100\/80\b/g, 'isit-body');
    c = c.replace(/\btext-cyan-100\/85\b/g, 'isit-muted');
    c = c.replace(/\btext-cyan-100\/60\b/g, 'isit-muted');
    c = c.replace(/\btext-cyan-200\/85\b/g, 'isit-muted');
    c = c.replace(/\btext-cyan-200\/80\b/g, 'isit-body');
    c = c.replace(/\btext-cyan-300\/90\b/g, 'isit-accent-text');
  }

  // Auth input pattern
  c = c.replace(
    /w-full rounded-xl border border-cyan-400\/25 bg-slate-950\/70 px-4 py-3 text-cyan-50 placeholder:text-cyan-200\/45 focus:outline-none focus:ring-2 focus:ring-cyan-400\/50/g,
    'isit-input'
  );
  c = c.replace(
    /w-full rounded-xl border border-cyan-400\/25 bg-slate-950\/70 px-4 py-3 isit-text-primary placeholder:text-cyan-200\/45 focus:outline-none focus:ring-2 focus:ring-cyan-400\/50/g,
    'isit-input'
  );

  // Auth headers
  c = c.replace(
    /className="relative z-\[1\] border-b border-white\/\[0\.08\] bg-\[#050510\]\/90 backdrop-blur-xl"/g,
    'className="isit-shell-header relative z-[1]"'
  );

  // Auth panels
  c = c.replace(
    /max-w-md w-full mx-auto isit-glass rounded-3xl p-8 sm:p-10 shadow-2xl/g,
    'max-w-md w-full mx-auto isit-auth-panel p-8 sm:p-10'
  );

  // Auth marketing side
  c = c.replace(
    /hidden lg:flex flex-1 order-1 lg:order-2 items-stretch justify-center p-10 xl:p-16 border-l border-cyan-400\/10 bg-gradient-to-br from-cyan-950\/40 via-slate-950\/20 to-transparent/g,
    'hidden lg:flex flex-1 order-1 lg:order-2 items-stretch justify-center p-10 xl:p-16 border-l border-[color:var(--isit-border)] isit-auth-marketing'
  );

  c = c.replace(/isit-cosmic-bg min-h-screen/g, 'isit-app-bg min-h-screen');

  return c === orig ? null : c;
}

const authFiles = [
  'src/app/signup/page.tsx',
  'src/app/forgot-password/page.tsx',
  'src/app/reset-password/page.tsx',
  'src/app/verify-email/page.tsx',
];

let n = 0;
for (const file of walk(ROOT)) {
  const rel = file.replace(/\\/g, '/');
  let c = fs.readFileSync(file, 'utf8');
  const patched = patch(c, rel);
  if (patched) {
    fs.writeFileSync(file, patched);
    n++;
    console.log('patched', rel);
  }
}

// Ensure ThemeToggle on auth pages
for (const f of authFiles) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('ThemeToggle')) {
    c = c.replace(
      "import SiteShell from '@/components/SiteShell';",
      "import SiteShell from '@/components/SiteShell';\nimport { ThemeToggle } from '@/components/ThemeToggle';"
    );
  }
  if (c.includes('isit-shell-header') && !c.includes('<ThemeToggle')) {
    c = c.replace(
      /(<header className="isit-shell-header[^>]*>\s*<div className="max-w-7xl[^"]*"[^>]*>[\s\S]*?<Link\s+href="\/"[^>]*>[\s\S]*?<\/Link>\s*)(<Link href="\/")/,
      '$1<div className="flex items-center gap-3"><ThemeToggle />$2'
    );
    // Simpler: insert before back home link in auth header
    c = c.replace(
      /(<header className="isit-shell-header[\s\S]*?<span>ISIC<\/span>\s*<\/Link>\s*)(<Link href="\/" className="text-sm)/,
      '$1<div className="flex items-center gap-3"><ThemeToggle />$2'
    );
    fs.writeFileSync(f, c);
    console.log('auth toggle', f);
  }
}

// Fix login header manually if still broken
const login = 'src/app/login/page.tsx';
let lc = fs.readFileSync(login, 'utf8');
if (lc.includes('bg-[#050510]')) {
  lc = lc.replace(
    `<header className="relative z-[1] border-b border-white/[0.08] bg-[#050510]/90 backdrop-blur-xl">
        <motion-safe:REMOVE
        <motion-safe:REMOVE
        <motion-safe:REMOVE
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 isit-accent-text font-semibold transition-colors no-underline hover:text-cyan-100"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 isit-accent-text animate-pulse-cyan">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ISIC</span>
          </Link>
          <Link href="/" className="text-sm isit-accent-text/80 hover:text-cyan-100 no-underline">
            {tr('funnelBackHome')}
          </Link>
        </motion-safe:REMOVE
        </div>
      </header>`,
    `<header className="isit-shell-header relative z-[1]">
        <motion-safe:REMOVE
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm isit-muted hover:isit-text-primary no-underline">
              {tr('funnelBackHome')}
            </Link>
          </motion-safe:REMOVE
          </motion-safe:REMOVE
          </div>
        </motion-safe:REMOVE
        </motion-safe:REMOVE
        </div>
      </header>`
  );
  lc = lc.replace(/<motion-safe:REMOVE\s*\n/g, '');
  lc = lc.replace(/<\/motion-safe:REMOVE\s*\n/g, '');
  fs.writeFileSync(login, lc);
  console.log('login header fixed');
}

console.log(`done: ${n} files`);
