/**
 * WCAG: skip repetitive navigation. Target `#main-content` in root layout.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed left-4 top-4 z-[10000] -translate-y-[200%] rounded-xl border border-cyan-400/50 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-semibold isit-text-primary shadow-[0_8px_30px_rgba(6,182,212,0.35)] opacity-0 transition-[opacity,transform] duration-200 focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
      Skip to main content
    </a>
  );
}
