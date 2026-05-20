/**
 * Shared route-transition skeleton for authenticated app areas.
 */
export default function AppShellSkeleton({ variant = 'dashboard' }: { variant?: 'dashboard' | 'table' | 'cards' }) {
  return (
    <div className="isit-cosmic-bg min-h-screen animate-pulse">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 md:p-8">
        <div className="h-8 w-48 rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
        <div className="h-4 w-72 max-w-full rounded bg-slate-100 dark:bg-slate-800/60" />
        {variant === 'dashboard' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="isit-app-panel h-24 rounded-xl" />
            ))}
          </div>
        )}
        {variant === 'cards' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="isit-app-panel h-36 rounded-xl" />
            ))}
          </div>
        )}
        {variant === 'table' && <div className="isit-app-panel h-64 rounded-xl" />}
      </div>
    </div>
  );
}
