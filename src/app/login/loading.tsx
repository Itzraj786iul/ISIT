export default function LoginLoading() {
  return (
    <div className="isit-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md animate-pulse space-y-4">
        <div className="mx-auto h-10 w-40 rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
        <div className="isit-glass rounded-2xl p-6 space-y-3">
          <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-11 rounded-xl bg-sky-400/30" />
        </div>
      </div>
    </div>
  );
}
