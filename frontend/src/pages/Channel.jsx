import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { userAPI, channelAPI } from '../services/api';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import VideoCard from '../components/VideoCard';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { FaGithub, FaTwitter, FaLinkedin, FaGlobe, FaBug, FaBell, FaRegBell, FaVideo, FaCommentAlt } from 'react-icons/fa';
import { getAvatarUrl } from '../config/constants';

const Channel = () => {
  const { username } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: channelData, isLoading: channelLoading } = useQuery(
    ['channel', username],
    () => channelAPI.getChannel(username)
  );

  const {
    data: videosData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: videosLoading,
  } = useInfiniteQuery(
    ['channel-videos', username],
    ({ pageParam = 1 }) => userAPI.getUserVideos(username, { page: pageParam, limit: 12 }),
    {
      getNextPageParam: (lastPage) => {
        const { page, pages } = lastPage.data;
        return page < pages ? page + 1 : undefined;
      },
    }
  );

  const channelVideos = videosData?.pages?.flatMap(p => p.data.data) ?? [];

  const videosSentinelRef = useInfiniteScroll(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    { enabled: !!hasNextPage && !isFetchingNextPage }
  );

  const subscribeMutation = useMutation(
    () => isSubscribed
      ? userAPI.unsubscribe(channelData?.data?.data?._id)
      : userAPI.subscribe(channelData?.data?.data?._id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['channel', username]);
        addToast({
          type: isSubscribed ? 'info' : 'success',
          message: isSubscribed ? 'Unsubscribed successfully!' : 'Subscribed successfully!'
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          message: error.response?.data?.message || 'Failed to update subscription'
        });
      }
    }
  );

  if (channelLoading) {
    return (
      <div className="px-0 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Channel header skeleton */}
          <div className="bg-dark-900 rounded-none sm:rounded-md border-y sm:border border-dark-800 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full animate-shimmer border border-dark-800"></div>
              <div className="flex-1 text-center md:text-left space-y-3">
                {/* Name */}
                <div className="h-6 sm:h-7 md:h-8 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-48 mx-auto md:mx-0"></div>
                {/* Username */}
                <div className="h-4 sm:h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-32 mx-auto md:mx-0"></div>
                {/* Bio */}
                <div className="space-y-2">
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4 mx-auto md:mx-0"></div>
                </div>
                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-24"></div>
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-20"></div>
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-28"></div>
                </div>
                {/* Specialties */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <div className="h-5 sm:h-6 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-20"></div>
                  <div className="h-5 sm:h-6 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-24"></div>
                  <div className="h-5 sm:h-6 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-20"></div>
                </div>
                {/* Social links */}
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="w-5 h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full animate-shimmer"></div>
                  <div className="w-5 h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full animate-shimmer"></div>
                  <div className="w-5 h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full animate-shimmer"></div>
                </div>
                {/* Subscribe button */}
                <div className="h-8 sm:h-9 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer w-32 mx-auto md:mx-0"></div>
              </div>
            </div>
          </div>

          {/* Videos section skeleton */}
          <div className="px-3 sm:px-0">
            <div className="h-6 sm:h-7 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-24 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-0 sm:gap-x-4 gap-y-8 -mx-3 sm:mx-0">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-none sm:rounded-md border-y sm:border border-dark-800 mb-2 animate-shimmer"></div>
                  <div className="flex gap-2 px-3 sm:px-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full border border-dark-800 flex-shrink-0 animate-shimmer"></div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4"></div>
                      <div className="h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-2/3"></div>
                      <div className="h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const channel = channelData?.data?.data;

  if (!channel) {
    const isOwnProfile = user?.username === username;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <FaVideo className="text-gray-700 mb-4" size={40} />
        <h2 className="text-base sm:text-lg font-medium text-white mb-1">
          {isOwnProfile ? "No Channel Created" : "Channel Not Found"}
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          {isOwnProfile ? (
            <>
              You haven't set up your channel yet.{' '}
              <Link to="/profile" className="text-primary-500 hover:text-primary-400 font-medium transition">
                Become a streamer
              </Link>
            </>
          ) : (
            "The channel you are looking for isn't available."
          )}
        </p>
      </div>
    );
  }

  const isOwnChannel = user?.username === channel.username;
  const isSubscribed = channel.subscribers?.some((sub) => {
    const subId = typeof sub === 'object' ? (sub._id || sub.id) : sub;
    const currentUserId = user?._id || user?.id;
    return String(subId) === String(currentUserId);
  }) || false;

  const getSafeUrl = (url) => {
    if (!url) return '#';
    try {
      const parsedUrl = new URL(url);
      if (['http:', 'https:'].includes(parsedUrl.protocol)) {
        return parsedUrl.href;
      }
    } catch (e) {
      // Invalid URL
    }
    return '#';
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        message: 'Please login to subscribe to this channel'
      });
      return;
    }
    subscribeMutation.mutate();
  };

  return (
    <div className="px-0 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-dark-900 rounded-none sm:rounded-md border-y sm:border border-dark-800 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <img
              src={getAvatarUrl(channel.avatar)}
              alt={channel.displayName || channel.username}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border border-dark-800"
              onError={(e) => {
                e.target.src = getAvatarUrl();
              }}
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-lg sm:text-xl font-semibold mb-1">{channel.displayName || channel.username}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mb-3">@{channel.username}</p>

              {channel.bio && <p className="text-xs sm:text-sm text-gray-300 mb-4">{channel.bio}</p>}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-xs sm:text-sm text-gray-400">
                <span>
                  <strong className="text-white">{channel.subscriberCount || 0}</strong> subscribers
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white">{channel.videoCount || 0}</strong> videos
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white">{channel.totalViews || 0}</strong> total views
                </span>
              </div>

              {channel.specialties && channel.specialties.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {channel.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="bg-dark-800 px-2 py-0.5 rounded text-xs border border-dark-700"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {channel.socialLinks && (
                <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                  {channel.socialLinks.github && (
                    <a
                      href={getSafeUrl(channel.socialLinks.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300 transition"
                    >
                      <FaGithub size={18} />
                    </a>
                  )}
                  {channel.socialLinks.twitter && (
                    <a
                      href={getSafeUrl(channel.socialLinks.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition"
                    >
                      <FaTwitter size={18} />
                    </a>
                  )}
                  {channel.socialLinks.linkedin && (
                    <a
                      href={getSafeUrl(channel.socialLinks.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300 transition"
                    >
                      <FaLinkedin size={18} />
                    </a>
                  )}
                  {channel.socialLinks.website && (
                    <a
                      href={getSafeUrl(channel.socialLinks.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300 transition"
                    >
                      <FaGlobe size={18} />
                    </a>
                  )}
                  {channel.socialLinks.hackerone && (
                    <a
                      href={getSafeUrl(channel.socialLinks.hackerone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300 transition"
                    >
                      <FaBug size={18} />
                    </a>
                  )}
                </div>
              )}

              {!isOwnChannel && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubscribe}
                    disabled={!isAuthenticated || subscribeMutation.isLoading}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition disabled:opacity-50 border ${
                      !isAuthenticated
                        ? 'bg-dark-800 text-gray-500 cursor-not-allowed border-dark-700'
                        : isSubscribed
                        ? 'bg-dark-800 hover:bg-dark-700 text-gray-300 border-dark-700'
                        : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700 shadow-sm'
                    }`}
                  >
                    {isSubscribed ? <FaBell size={12} className="sm:w-[14px] sm:h-[14px]" /> : <FaRegBell size={12} className="sm:w-[14px] sm:h-[14px]" />}
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>

                  {isAuthenticated && (
                    <button
                      onClick={() => navigate(`/messages?with=${channel._id}`)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition border bg-dark-800 hover:bg-dark-700 text-gray-300 border-dark-700"
                    >
                      <FaCommentAlt size={12} className="sm:w-[14px] sm:h-[14px]" />
                      Message
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-0">
          <h2 className="text-lg sm:text-xl font-medium mb-6">Videos</h2>

          {videosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-0 sm:gap-x-4 gap-y-8 -mx-3 sm:mx-0">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-none sm:rounded-md border-y sm:border border-dark-800 mb-2 animate-shimmer"></div>
                  <div className="flex gap-2 px-3 sm:px-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-full border border-dark-800 flex-shrink-0 animate-shimmer"></div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4"></div>
                      <div className="h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-2/3"></div>
                      <div className="h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : channelVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base sm:text-lg text-gray-400">No videos yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-0 sm:gap-x-4 gap-y-8 -mx-3 sm:mx-0">
                {channelVideos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    showActions={isOwnChannel}
                  />
                ))}
              </div>
              <div ref={videosSentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
