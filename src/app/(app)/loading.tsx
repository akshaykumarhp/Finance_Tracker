// Shown instantly while a page's server data loads — makes navigation feel
// immediate instead of blocking on the network.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded-lg bg-ink-200/70" />
        <div className="h-9 w-44 rounded-xl bg-ink-200/60" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="h-3 w-16 rounded bg-ink-200/70" />
            <div className="mt-3 h-7 w-24 rounded-lg bg-ink-200/70" />
            <div className="mt-2 h-2.5 w-20 rounded bg-ink-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <div className="mx-auto mt-4 h-40 w-40 rounded-full border-[16px] border-ink-100" />
        </div>
        <div className="card space-y-4 lg:col-span-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-3 w-28 rounded bg-ink-200/70" />
              <div className="h-2.5 w-full rounded-full bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
