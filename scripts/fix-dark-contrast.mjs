/**
 * Add dark: text variants wherever slate-500/600 lack them (dark glass readability).
 */
import fs from 'fs';
import path from 'path';

const ROOT = 'src';
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

function patchContent(content) {
  let c = content;
  const orig = c;

  // className="... text-slate-500 ..." without any dark:text- in same string
  c = c.replace(/className="([^"]*)"/g, (match, classes) => {
    if (!classes.includes('text-slate-500') && !classes.includes('text-slate-600')) return match;
    if (classes.includes('dark:text-')) return match;
    let nc = classes;
    if (/\btext-slate-500\b/.test(nc)) {
      nc = nc.replace(/\btext-slate-500\b/g, 'text-slate-500 dark:text-slate-400');
    }
    if (/\btext-slate-600\b/.test(nc)) {
      nc = nc.replace(/\btext-slate-600\b/g, 'text-slate-600 dark:text-slate-300');
    }
    return `className="${nc}"`;
  });

  // template literals in className={`...`}
  c = c.replace(/className=\{`([^`]*?)`\}/g, (match, classes) => {
    if (!classes.includes('text-slate-500') && !classes.includes('text-slate-600')) return match;
    if (classes.includes('dark:text-')) return match;
    let nc = classes;
    if (/\btext-slate-500\b/.test(nc)) {
      nc = nc.replace(/\btext-slate-500\b/g, 'text-slate-500 dark:text-slate-400');
    }
    if (/\btext-slate-600\b/.test(nc)) {
      nc = nc.replace(/\btext-slate-600\b/g, 'text-slate-600 dark:text-slate-300');
    }
    return `className={\`${nc}\`}`;
  });

  return c === orig ? null : c;
}

let n = 0;
for (const f of walk(ROOT)) {
  const c = fs.readFileSync(f, 'utf8');
  const patched = patchContent(c);
  if (patched) {
    fs.writeFileSync(f, patched);
    n++;
    console.log(path.relative('.', f).replace(/\\/g, '/'));
  }
}
console.log(`done: ${n} files`);
