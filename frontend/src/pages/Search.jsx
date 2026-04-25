import { useInfiniteQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { videoAPI } from '../services/api';
import VideoCard from '../components/VideoCard';
import { FaSearch } from 'react-icons/fa';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    ['search', query],
    ({ pageParam = 1 }) => videoAPI.searchVideos({ q: query, page: pageParam, limit: 24 }),
    {
      enabled: !!query,
      getNextPageParam: (lastPage) => {
        const { page, pages } = lastPage.data;
        return page < pages ? page + 1 : undefined;
      },
    }
  );

  const videos = data?.pages?.flatMap(p => p.data.data) ?? [];
  const total  = data?.pages?.[0]?.data?.total ?? 0;

  const sentinelRef = useInfiniteScroll(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    { enabled: !!hasNextPage && !isFetchingNextPage }
  );

  return (
    <div className="px-0 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="mb-6 px-3 sm:px-0">
        <h1 className="text-lg sm:text-xl font-medium mb-2">Search results for "{query}"</h1>
        {total > 0 && (
          <p className="text-xs sm:text-sm text-gray-400">{total} results</p>
        )}
      </div>

      {!query ? (
        <div className="text-center py-12 px-3">
          <FaSearch className="text-gray-600 mx-auto mb-4" size={40} />
          <p className="text-base sm:text-lg text-gray-400">Enter a search query</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-0 sm:gap-x-4 gap-y-6 sm:gap-y-8">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-none sm:rounded-md border-y sm:border border-dark-800 mb-2 animate-shimmer"></div>
              <div className="flex gap-2 px-3 sm:px-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full border border-dark-800 flex-shrink-0 animate-shimmer"></div>
                <div className="flex-1 space-y-1.5 sm:space-y-2">
                  <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 px-3">
          <p className="text-base sm:text-lg text-gray-400">No results found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
