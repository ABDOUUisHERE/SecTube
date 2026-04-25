import { useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { videoAPI } from '../services/api';
import VideoCard from '../components/VideoCard';
import CustomSelect from '../components/CustomSelect';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const categories = [
  'All',
  'Web Application Security',
  'Network Security',
  'Bug Bounty',
  'Penetration Testing',
  'Malware Analysis',
  'Reverse Engineering',
  'Mobile Security',
  'Cloud Security',
  'CTF Writeup',
  'OSINT',
  'Cryptography',
  'IoT Security',
  'Security Tools',
  'Tutorial',
];

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const sortOptions = [
  { label: 'Latest', value: 'latest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Oldest', value: 'oldest' },
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  const filters = {
    limit: 24,
    ...(selectedCategory !== 'All' && { category: selectedCategory }),
    ...(selectedDifficulty !== 'All' && { difficulty: selectedDifficulty }),
    sort: sortBy === 'popular' ? 'popular' : sortBy === 'oldest' ? 'oldest' : '-uploadedAt',
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    ['browse-videos', filters],
    ({ pageParam = 1 }) => videoAPI.getVideos({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => {
        const { page, pages } = lastPage.data;
        return page < pages ? page + 1 : undefined;
      },
      keepPreviousData: false,
    }
  );

  const videos = data?.pages?.flatMap(p => p.data.data) ?? [];
  const total  = data?.pages?.[0]?.data?.total ?? 0;

  const sentinelRef = useInfiniteScroll(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    { enabled: !!hasNextPage && !isFetchingNextPage }
  );

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category !== 'All') setSearchParams({ category });
    else setSearchParams({});
  };

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-0 sm:gap-x-4 gap-y-6 sm:gap-y-8">
      {[...Array(8)].map((_, i) => (
        <div key={i}>
          <div className="aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-none sm:rounded-md border-y sm:border border-dark-800 mb-2 animate-shimmer"></div>
          <div className="flex gap-2 px-3 sm:px-0">
            <div className="w-8 h-8 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full border border-dark-800 flex-shrink-0 animate-shimmer"></div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
              <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="px-0 sm:px-4 md:px-6 py-4 sm:py-6 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 px-3 sm:px-0">
        <h1 className="text-lg sm:text-xl font-bold text-white mb-1">Browse Videos</h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Explore cybersecurity content from the community
        </p>
      </div>

      {/* Filters */}
      <div className="bg-dark-900 border-y sm:border border-dark-800 rounded-none sm:rounded-lg p-3 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <CustomSelect
            label="Category"
            icon={FaFilter}
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
          />
          <CustomSelect
            label="Difficulty"
            icon={FaFilter}
            options={difficulties}
            value={selectedDifficulty}
            onChange={(val) => setSelectedDifficulty(val)}
          />
          <CustomSelect
            label="Sort By"
            icon={FaSortAmountDown}
            options={sortOptions}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
          />
        </div>

        {total > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dark-800">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">
              <span className="text-primary-500">{total}</span> videos found
            </p>
          </div>
        )}
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <SkeletonGrid />
      ) : videos.length === 0 ? (
        <div className="py-12 sm:py-20 text-center px-3">
          <FaFilter className="text-gray-700 mx-auto mb-4" size={40} />
          <h2 className="text-base sm:text-lg font-medium text-white mb-2">No videos found</h2>
          <p className="text-sm text-gray-500">Try adjusting your filters to find what you're looking for.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-0 sm:gap-x-4 gap-y-6 sm:gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
            {isFetchingNextPage && [...Array(3)].map((_, i) => (
              <div key={`sk-${i}`}>
                <div className="aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-none sm:rounded-md border-y sm:border border-dark-800 mb-2 animate-shimmer"></div>
                <div className="px-3 sm:px-0">
                  <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
          <div ref={sentinelRef} className="h-4" />
        </>
      )}
    </div>
  );
};

export default Browse;
