import { useQuery } from 'react-query';
import { IoRadioOutline } from 'react-icons/io5';
import { BsBroadcast } from 'react-icons/bs';
import { streamAPI } from '../services/api';
import LiveCard from '../components/LiveCard';
import useAuthStore from '../store/authStore';
import PageHeader from '../components/PageHeader';

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-600">
    <Icon size={28} />
    <p className="text-sm">{message}</p>
  </div>
);

const LiveStreams = () => {
  const { isAuthenticated } = useAuthStore();

  const { data: allData, isLoading: allLoading } = useQuery(
    'live-streams-all',
    () => streamAPI.getLive(),
    { staleTime: 30 * 1000, refetchInterval: 30 * 1000 }
  );

  const { data: followingData, isLoading: followingLoading } = useQuery(
    'live-streams-following',
    () => streamAPI.getFollowingLive(),
    { staleTime: 30 * 1000, refetchInterval: 30 * 1000, enabled: isAuthenticated }
  );

  const allStreams = allData?.data?.data ?? [];
  const followingStreams = followingData?.data?.data ?? [];

  const followingIds = new Set(followingStreams.map((s) => String(s._id)));
  const otherStreams = allStreams.filter((s) => !followingIds.has(String(s._id)));

  const totalViewers = allStreams.reduce((acc, s) => acc + (s.viewerCount ?? 0), 0);

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Live"
        subtitle="Browse live cybersecurity streams"
        icon={IoRadioOutline}
      />

      {/* Following live */}
      {isAuthenticated && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-white">Following</h2>
          </div>

          {followingLoading ? (
            <SkeletonRow />
          ) : followingStreams.length === 0 ? (
            <EmptyState icon={BsBroadcast} message="Nobody you follow is live right now" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {followingStreams.map((s) => <LiveCard key={s._id} stream={s} />)}
            </div>
          )}
        </section>
      )}

      {/* All live */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-white">
            {isAuthenticated ? 'All Live Streams' : 'Live Now'}
          </h2>
        </div>

        {allLoading ? (
          <SkeletonRow count={8} />
        ) : allStreams.length === 0 ? (
          <EmptyState icon={IoRadioOutline} message="No streams are live right now — check back later" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {allStreams.map((s) => <LiveCard key={s._id} stream={s} />)}
          </div>
        )}
      </section>
    </div>
  );
};

const SkeletonRow = ({ count = 5 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex flex-col gap-2 animate-pulse">
        <div className="aspect-video bg-dark-800 rounded-md" />
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-dark-800 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-dark-800 rounded w-3/4" />
            <div className="h-2 bg-dark-800 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default LiveStreams;
