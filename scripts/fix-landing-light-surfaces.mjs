import fs from 'fs';

const p = 'src/components/home/LandingHomeContent.tsx';
let c = fs.readFileSync(p, 'utf8');
const pairs = [
  ['border-white/[0.08]', 'border-slate-200 dark:border-white/[0.08]'],
  ['border-white/[0.06]', 'border-slate-200 dark:border-white/[0.06]'],
  ['border-white/[0.1]', 'border-slate-200 dark:border-white/[0.1]'],
  ['border-white/20', 'border-slate-200 dark:border-white/20'],
  ['bg-white/[0.02]', 'bg-white shadow-sm dark:bg-white/[0.02] dark:shadow-none'],
  ['bg-white/[0.03]', 'bg-white dark:bg-white/[0.03]'],
  ['bg-white/[0.04]', 'bg-slate-50 dark:bg-white/[0.04]'],
  ['bg-black/20', 'bg-slate-100 dark:bg-black/20'],
  ['bg-slate-950/40', 'bg-slate-100 dark:bg-slate-950/40'],
  ['bg-slate-950/50', 'bg-slate-50 dark:bg-slate-950/50'],
  ['bg-slate-900/80', 'bg-slate-100 dark:bg-slate-900/80'],
  ['bg-slate-900/70', 'bg-white dark:bg-slate-900/70'],
  ['bg-[#0a0c14]', 'bg-slate-100 dark:bg-[#0a0c14]'],
  ['hover:border-cyan-500/20', 'hover:border-sky-300 dark:hover:border-cyan-500/20'],
  ['hover:border-cyan-400/25', 'hover:border-sky-400 dark:hover:border-cyan-400/25'],
  ['hover:border-white/15', 'hover:border-slate-300 dark:hover:border-white/15'],
];
for (const [a, b] of pairs) {
  if (c.includes(a) && !c.includes(b)) c = c.split(a).join(b);
}
// Testimonial + glass cards
c = c.replace(
  'rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-6 backdrop-blur-sm',
  'landing-glass p-6'
);
fs.writeFileSync(p, c);
console.log('landing surfaces patched');
