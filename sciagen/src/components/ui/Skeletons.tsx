// Shared skeleton components for loading states

export function SkeletonHero() {
  return (
    <section className="px-4 md:px-8 lg:px-12 xl:px-16 pt-8 pb-12">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          <div className="lg:col-span-2 sg-skeleton rounded-2xl" />
          <div className="flex flex-col gap-3">
            <div className="flex-1 sg-skeleton rounded-xl" />
            <div className="flex-1 sg-skeleton rounded-xl" />
            <div className="flex-1 sg-skeleton rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 pt-12">
      <div className="sg-skeleton h-4 w-20 rounded mb-5" />
      <div className="space-y-3 mb-6">
        <div className="sg-skeleton h-10 w-full rounded" />
        <div className="sg-skeleton h-10 w-4/5 rounded" />
      </div>
      <div className="space-y-2 mb-8">
        <div className="sg-skeleton h-5 w-full rounded" />
        <div className="sg-skeleton h-5 w-5/6 rounded" />
      </div>
      <div className="sg-skeleton h-px w-full mb-6" />
      <div className="sg-skeleton aspect-video w-full rounded-2xl mb-10" />
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="sg-skeleton h-5 rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="sg-card p-4">
      <div className="sg-skeleton aspect-video w-full rounded-xl mb-4" />
      <div className="sg-skeleton h-3 w-16 rounded mb-3" />
      <div className="space-y-2">
        <div className="sg-skeleton h-4 w-full rounded" />
        <div className="sg-skeleton h-4 w-4/5 rounded" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
