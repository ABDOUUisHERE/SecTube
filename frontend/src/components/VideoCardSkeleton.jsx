const VideoCardSkeleton = () => {
  return (
    <div className="flex flex-col group">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-none sm:rounded-md overflow-hidden mb-1.5 sm:mb-2 border-y sm:border border-dark-800 animate-shimmer">
        {/* Play icon placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-dark-700/50 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-dark-600 border-y-[8px] sm:border-y-[10px] border-y-transparent ml-1"></div>
          </div>
        </div>

        {/* Duration placeholder */}
        <div className="absolute bottom-2 right-2 bg-dark-950/80 px-1.5 py-0.5 rounded">
          <div className="w-8 h-3 bg-dark-700 rounded"></div>
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="flex gap-1.5 sm:gap-2 px-3 sm:px-0">
        {/* Avatar skeleton */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] border border-dark-800 flex-shrink-0 animate-shimmer"></div>

        {/* Text content skeleton */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          {/* Title lines */}
          <div className="space-y-1">
            <div className="h-3 sm:h-3.5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
            <div className="h-3 sm:h-3.5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-4/5"></div>
          </div>

          {/* Meta info line */}
          <div className="h-2.5 sm:h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/5"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
