import fs from 'fs';
import path from 'path';

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      walk(p, files);
    } else if (/\.(tsx|ts|jsx|js)$/.test(name)) {
      files.push(p);
    }
  }
  return files;
}

const root = 'src';
const files = walk(root);

let changed = 0;
for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  const orig = c;

  // Let isit-cosmic-bg control base text color (light/dark in CSS)
  c = c.replace(/(isit-cosmic-bg[\s\S]*?)\btext-cyan-50\b\s*/g, '$1');
  c = c.replace(/(isit-cosmic-bg[\s\S]*?)\btext-cyan-100\b\s*/g, '$1');

  // Standalone cosmic wrappers still forcing cyan text
  c = c.replace(
    /\btext-cyan-50\b(?=[^"']*isit-cosmic-bg)/g,
    ''
  );

  // Common page root pattern
  c = c.replace(
    /isit-cosmic-bg min-h-screen flex font-sans text-cyan-50/g,
    'isit-cosmic-bg min-h-screen flex font-sans'
  );
  c = c.replace(
    /isit-cosmic-bg relative flex min-h-screen font-sans text-cyan-50/g,
    'isit-cosmic-bg relative flex min-h-screen font-sans'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen text-cyan-50/g,
    'isit-cosmic-bg min-h-screen'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen flex font-sans text-cyan-100/g,
    'isit-cosmic-bg min-h-screen flex font-sans'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen flex text-cyan-50/g,
    'isit-cosmic-bg min-h-screen flex'
  );
  c = c.replace(
    /isit-cosmic-bg flex min-h-screen text-cyan-50/g,
    'isit-cosmic-bg flex min-h-screen'
  );
  c = c.replace(
    /isit-cosmic-bg flex min-h-screen items-center justify-center text-cyan-200/g,
    'isit-cosmic-bg flex min-h-screen items-center justify-center'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen flex items-center justify-center text-cyan-200/g,
    'isit-cosmic-bg min-h-screen flex items-center justify-center'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen flex items-center justify-center text-cyan-300/g,
    'isit-cosmic-bg min-h-screen flex items-center justify-center'
  );
  c = c.replace(
    /isit-cosmic-bg relative flex min-h-screen text-cyan-50/g,
    'isit-cosmic-bg relative flex min-h-screen'
  );
  c = c.replace(
    /isit-cosmic-bg relative flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-cyan-50/g,
    'isit-cosmic-bg relative flex min-h-screen flex-col items-center justify-center gap-4 px-4'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col items-center justify-center/g,
    'isit-cosmic-bg min-h-screen flex flex-col items-center justify-center'
  );
  c = c.replace(
    /h-screen isit-cosmic-bg flex flex-col items-center justify-center text-cyan-200/g,
    'h-screen isit-cosmic-bg flex flex-col items-center justify-center'
  );
  c = c.replace(
    /h-screen isit-cosmic-bg flex flex-col items-center justify-center gap-6 p-4 text-cyan-50/g,
    'h-screen isit-cosmic-bg flex flex-col items-center justify-center gap-6 p-4'
  );
  c = c.replace(
    /h-screen flex flex-col md:flex-row isit-cosmic-bg overflow-hidden relative text-cyan-50/g,
    'h-screen flex flex-col md:flex-row isit-cosmic-bg overflow-hidden relative'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen flex flex-col items-center justify-center px-4 py-12 text-cyan-50/g,
    'isit-cosmic-bg min-h-screen flex flex-col items-center justify-center px-4 py-12'
  );
  c = c.replace(
    /isit-cosmic-bg min-h-screen flex flex-col items-center justify-center px-4 text-cyan-50/g,
    'isit-cosmic-bg min-h-screen flex flex-col items-center justify-center px-4'
  );

  // Landing
  c = c.replace(
    'isit-landing-replica text-slate-200',
    'isit-landing-replica text-slate-800 dark:text-slate-200'
  );

  if (c !== orig) {
    fs.writeFileSync(file, c);
    changed++;
    console.log('updated', file);
  }
}

console.log('done', changed, 'files');
