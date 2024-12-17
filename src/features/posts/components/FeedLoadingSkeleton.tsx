const FeedLoadingSkeleton = () => {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
  
        {/* Post Creation Skeleton */}
        <div className="animate-pulse bg-white rounded-lg p-4 shadow-sm border">
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="flex justify-end">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
  
        {/* Posts Skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default FeedLoadingSkeleton;