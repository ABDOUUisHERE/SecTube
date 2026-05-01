import { useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { videoAPI, streamAPI } from '../services/api';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import AIRecommendedRow from '../components/AIRecommendedRow';
import LiveCard from '../components/LiveCard';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const categories = [
  'All',
  'Bug Bounty',
  'Web Application Security',
  'Network Security',
  'Penetration Testing',
  'CTF Writeup',
  'Malware Analysis',
  'Reverse Engineering',
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: liveData } = useQuery(
    'live-streams',
    () => streamAPI.getLive(),
    { staleTime: 30 * 1000, refetchInterval: 30 * 1000 }
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    ['home-videos', selectedCategory],
    ({ pageParam = 1 }) => videoAPI.getVideos({
      page: pageParam,
      limit: 24,
      sort: 'popular',
      ...(selectedCategory !== 'All' && { category: selectedCategory })
    }),
    {
      getNextPageParam: (lastPage) => {
        const { page, pages } = lastPage.data;
        return page < pages ? page + 1 : undefined;
      }
    }
  );

  const videos = data?.pages?.flatMap(p => p.data.data) ?? [];
  const liveStreams = liveData?.data?.data ?? [];

  // Live streams first, then videos — all in one flat list
  const mixedItems = [
    ...liveStreams.map((s) => ({ type: 'stream', data: s })),
    ...videos.map((v) => ({ type: 'video', data: v })),
  ];

  const sentinelRef = useInfiniteScroll(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    { enabled: !!hasNextPage && !isFetchingNextPage }
  );

  return (
    <div className="px-0 sm:px-4 md:px-6 py-4 sm:py-6">

      <AIRecommendedRow />

      {/* Category chips */}
      <div className="mb-6 sm:mb-10 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide">
        <div className="flex flex-nowrap gap-2 sm:gap-3 snap-x snap-mandatory pl-3 sm:pl-0">
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`relative px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 border overflow-hidden group flex-shrink-0 snap-start ${
              category === selectedCategory
                ? 'bg-primary-600 text-white border-primary-400 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                : 'bg-dark-900 text-gray-400 border-dark-700 hover:border-primary-500/50 hover:text-white'
            }`}
          >
            {category === selectedCategory && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[btn-scan_2s_infinite]"></div>
            )}
            <span className="relative z-10 flex items-center gap-2">
              {category === selectedCategory && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
              {category}
            </span>
          </button>
        ))}
        <div className="w-3 sm:w-0 flex-shrink-0"></div>
        </div>
      </div>

      <style>{`
        @keyframes btn-scan {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Mixed grid: live streams first, then videos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-0 sm:gap-x-4 gap-y-6 sm:gap-y-8">
          {[...Array(8)].map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-0 sm:gap-x-4 gap-y-6 sm:gap-y-8">
            {mixedItems.map((item) =>
              item.type === 'stream'
                ? <LiveCard key={`s-${item.data._id}`} stream={item.data} />
                : <VideoCard key={`v-${item.data._id}`} video={item.data} />
            )}
            {isFetchingNextPage && [...Array(4)].map((_, i) => <VideoCardSkeleton key={`sk-${i}`} />)}
          </div>
          <div ref={sentinelRef} className="h-4" />
        </>
      )}
    </div>
  );
};

export default Home;
