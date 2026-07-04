interface PropertySkeletonProps {
  count?: number;
}

export default function PropertySkeleton({ count = 6 }: PropertySkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-white p-4">
          <div className="skeleton h-48 w-full rounded-lg" />
          <div className="mt-4 space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-2/3" />
            <div className="flex gap-2">
              <div className="skeleton h-8 w-16" />
              <div className="skeleton h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
