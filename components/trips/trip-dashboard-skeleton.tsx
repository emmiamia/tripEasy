export function TripDashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="h-60 animate-pulse rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200"
          />
        ))}
      </div>
    </div>
  );
}
