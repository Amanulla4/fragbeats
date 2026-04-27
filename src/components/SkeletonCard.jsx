function SkeletonCard() {
  return (
    <div className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-36 bg-gradient-to-r from-[#0b1425] via-[#0f1d35] to-[#0b1425] bg-[length:200%_100%] animate-shimmer" />

      {/* Info skeleton */}
      <div className="p-4">
        <div className="h-3 bg-[#0f1d35] rounded-full w-16 mb-3" />
        <div className="h-4 bg-[#0f1d35] rounded-full w-3/4 mb-2" />
        <div className="h-3 bg-[#0f1d35] rounded-full w-1/2 mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-[#0f1d35] rounded-full w-12" />
          <div className="h-3 bg-[#0f1d35] rounded-full w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default SkeletonCard