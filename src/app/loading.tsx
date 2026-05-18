/**
 * Route-level loading UI — matches cosmic glass theme for consistent production feel.
 */
export default function Loading() {
  return (
    <div className="isit-app-bg min-h-screen flex flex-col items-center justify-center px-6 ">
      <div className="relative z-[1] w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl isit-glass animate-pulse shrink-0" aria-hidden />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-full bg-cyan-400/20 animate-pulse w-3/4" />
            <div className="h-2 rounded-full bg-cyan-400/10 animate-pulse w-1/2" />
          </div>
        </div>
        <div className="isit-glass rounded-2xl p-5 space-y-3">
          <div className="h-3 rounded-full bg-cyan-400/15 animate-pulse" />
          <div className="h-3 rounded-full bg-cyan-400/10 animate-pulse w-5/6" />
          <div className="h-3 rounded-full bg-cyan-400/10 animate-pulse w-2/3" />
        </div>
        <p className="text-center text-sm isit-body">Loading…</p>
      </div>
    </div>
  );
}
