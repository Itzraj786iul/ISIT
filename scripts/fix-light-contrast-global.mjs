/**
 * Site-wide light-mode contrast: add dark: variants for dark-only Tailwind colors.
 * Skips lines that are clearly on colored buttons/gradients.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join('src');
const SKIP = new Set(['node_modules', '.next', 'styles']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (!SKIP.has(name)) walk(p, out);
    } else if (/\.(tsx|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

function shouldSkipLine(line) {
  if (/dark:text-|isit-text-primary|isit-body|isit-muted|isit-accent-text/.test(line)) {
    // already partially migrated
  }
  return (
    /btn-primary|isit-btn-primary|pillPrimary|bg-gradient|from-indigo|from-violet|from-purple|from-cyan|from-sky|from-emerald|from-rose|from-blue|from-orange|to-cyan|to-violet|to-indigo|to-purple|to-sky|to-emerald|bg-sky-5|bg-sky-6|bg-violet-5|bg-violet-6|bg-indigo-5|bg-indigo-6|bg-emerald-5|bg-emerald-6|bg-rose-5|bg-rose-6|bg-cyan-5|bg-cyan-6|preserve-light-text|text-white\/|fill-white|stroke-white/.test(
      line
    )
  );
}

function patchLine(line) {
  if (shouldSkipLine(line)) return line;
  let l = line;

  const subs = [
    [/\btext-cyan-50\b/g, 'isit-text-primary'],
    [/\btext-cyan-100\b/g, 'isit-body'],
    [/\btext-cyan-200\/70\b/g, 'text-slate-500 dark:text-cyan-200/70'],
    [/\btext-cyan-200\/80\b/g, 'text-slate-600 dark:text-cyan-200/80'],
    [/\btext-cyan-200\/85\b/g, 'text-slate-600 dark:text-cyan-200/85'],
    [/\btext-cyan-200\b/g, 'text-slate-600 dark:text-cyan-200'],
    [/\btext-cyan-300\/90\b/g, 'isit-accent-text'],
    [/\btext-cyan-300\/75\b/g, 'text-slate-500 dark:text-cyan-300/75'],
    [/\btext-cyan-300\b/g, 'text-sky-600 dark:text-cyan-300'],
    [/\btext-slate-200\b/g, 'text-slate-600 dark:text-slate-200'],
  ];

  for (const [re, rep] of subs) {
    if (re.test(l) && !l.includes('dark:text-')) l = l.replace(re, rep);
  }

  // text-slate-300 -> dual (if no dark: yet on line for slate-300)
  if (/\btext-slate-300\b/.test(l) && !/dark:text-slate-300/.test(l) && !shouldSkipLine(l)) {
    l = l.replace(/\btext-slate-300\b/g, 'text-slate-600 dark:text-slate-300');
  }

  // text-white -> dual
  if (/\btext-white\b/.test(l) && !/dark:text-white/.test(l) && !/\btext-white\//.test(l) && !shouldSkipLine(l)) {
    l = l.replace(/\btext-white\b/g, 'text-slate-900 dark:text-white');
  }

  // Glass / dark surfaces on cards
  if (!shouldSkipLine(l)) {
    l = l.replace(/\bbg-slate-950\/70\b/g, 'bg-slate-100 dark:bg-slate-950/70');
    l = l.replace(/\bbg-slate-950\/65\b/g, 'bg-white dark:bg-slate-950/65');
    l = l.replace(/\bbg-slate-950\/50\b/g, 'bg-slate-50 dark:bg-slate-950/50');
    l = l.replace(/\bbg-slate-950\/40\b/g, 'bg-slate-50 dark:bg-slate-950/40');
    l = l.replace(/\bbg-slate-950\/90\b/g, 'bg-white dark:bg-slate-950/90');
    l = l.replace(/\bbg-slate-950\b/g, 'bg-white dark:bg-slate-950');
    l = l.replace(/\bborder-cyan-300\/20\b/g, 'border-slate-200 dark:border-cyan-300/20');
    l = l.replace(/\bborder-cyan-400\/25\b/g, 'border-slate-200 dark:border-cyan-400/25');
    l = l.replace(/\bborder-cyan-400\/20\b/g, 'border-slate-200 dark:border-cyan-400/20');
  }

  return l;
}

function patchFile(filePath) {
  const rel = filePath.replace(/\\/g, '/');
  let content = fs.readFileSync(filePath, 'utf8');
  const orig = content;

  content = content.replace(/<motion-safe:REMOVE\s*\n/g, '');
  content = content.replace(/<\/motion-safe:REMOVE\s*\n/g, '');

  const lines = content.split('\n');
  const out = lines.map(patchLine);
  content = out.join('\n');

  if (content !== orig) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

let n = 0;
for (const f of walk(ROOT)) {
  if (patchFile(f)) {
    n++;
    console.log('fixed', f.replace(/\\/g, '/'));
  }
}
console.log(`done: ${n} files`);
