import fs from 'fs';

const p = 'src/app/login/page.tsx';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('isit-shell-header')) {
  c = c.replace(
    /      <header className="relative z-\[1\] border-b border-white\/\[0\.08\] bg-\[#050510\]\/90 backdrop-blur-xl">[\s\S]*?      <\/header>/,
    `      <header className="isit-shell-header relative z-[1]">
        <motion-safe:REMOVE
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold isit-text-primary no-underline hover:opacity-80"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--isit-accent-soft)] isit-accent-text dark:animate-pulse-cyan">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ISIC</span>
          </Link>
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
  fs.writeFileSync(p, c);
  console.log('fixed');
} else {
  console.log('already ok');
}
