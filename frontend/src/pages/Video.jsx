import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaThumbsDown, FaShare, FaRegSmile, FaBell, FaRegBell, FaTwitter, FaLinkedin, FaFacebook, FaWhatsapp, FaTelegram, FaCopy, FaCheck, FaExclamationTriangle, FaBookmark, FaRegBookmark, FaEllipsisV } from 'react-icons/fa';
import { videoAPI, userAPI } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import CommentItem from '../components/CommentItem';
import EmojiPicker from '../components/EmojiPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { getAvatarUrl, getThumbnailUrl } from '../config/constants';
import { useDropdownPosition, getDropdownClasses } from '../hooks/useDropdownPosition';
import sanitize from '../utils/sanitize';

const Video = () => {
  const { videoId } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [descClamped, setDescClamped] = useState(false);
  const descRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeVideoMenu, setActiveVideoMenu] = useState(null);
  const [savedVideos, setSavedVideos] = useState({});
  const emojiButtonRef = useRef(null);
  const shareButtonRef = useRef(null);
  const mobileShareButtonRef = useRef(null);
  const videoMenuRefs = useRef({});

  const { data: videoData, isLoading } = useQuery(
    ['video', videoId],
    () => videoAPI.getVideo(videoId),
    {
      refetchInterval: (data) => {
        // If video is still processing, poll every 3 seconds
        const status = data?.data?.data?.processingStatus;
        return status === 'processing' ? 3000 : false;
      }
    }
  );

  const video = videoData?.data?.data;
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Detect if description is visually truncated (actual overflow, not character count)
  useEffect(() => {
    if (!showDescription && descRef.current) {
      setDescClamped(descRef.current.scrollHeight > descRef.current.clientHeight);
    }
  }, [video?.description, showDescription]);

  // Update local state when video data changes
  useEffect(() => {
    if (video) {
      setIsLiked(video.isLiked || false);
      setIsDisliked(video.isDisliked || false);
      // Check if current user is subscribed to the uploader
      if (user && video.uploader?.subscribers) {
        const currentUserId = user._id || user.id;
        setIsSubscribed(video.uploader.subscribers.some(sub => {
          const subId = typeof sub === 'object' ? (sub._id || sub.id) : sub;
          return String(subId) === String(currentUserId);
        }));
      } else {
        setIsSubscribed(false);
      }
    }
  }, [video, user]);

  // Check saved status
  useEffect(() => {
    const checkSaved = async () => {
      if (isAuthenticated && videoId) {
        try {
          const res = await userAPI.checkSavedStatus(videoId);
          setIsSaved(res.data.isSaved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };
    checkSaved();
  }, [isAuthenticated, videoId]);

  const {
    data: commentsData,
    fetchNextPage: fetchMoreComments,
    hasNextPage: hasMoreComments,
    isFetchingNextPage: isFetchingMoreComments,
  } = useInfiniteQuery(
    ['comments', videoId],
    ({ pageParam = 1 }) => videoAPI.getComments(videoId, { page: pageParam, limit: 20 }),
    {
      getNextPageParam: (lastPage) => {
        const { page, pages } = lastPage.data;
        return page < pages ? page + 1 : undefined;
      },
    }
  );
  const allComments   = commentsData?.pages?.flatMap(p => p.data.data) ?? [];
  const totalComments = commentsData?.pages?.[0]?.data?.total ?? 0;

  const commentsSentinelRef = useInfiniteScroll(
    () => { if (hasMoreComments && !isFetchingMoreComments) fetchMoreComments(); },
    { enabled: !!hasMoreComments && !isFetchingMoreComments }
  );

  // Fetch related videos (same category, excluding current video)
  const { data: relatedVideosData } = useQuery(
    ['relatedVideos', video?.category, videoId],
    () => videoAPI.getVideos({
      category: video?.category,
      limit: 10,
      sort: 'popular'
    }),
    {
      enabled: !!video?.category // Only fetch when we have the video category
    }
  );

  // Filter out current video from related videos (memoized to prevent infinite loops)
  const relatedVideos = useMemo(() => {
    return (relatedVideosData?.data?.data || []).filter(v => v._id !== videoId);
  }, [relatedVideosData, videoId]);

  // Calculate dropdown positions
  const shareMenuPosition = useDropdownPosition(shareButtonRef, showShareMenu, 350);
  const emojiPickerPosition = useDropdownPosition(emojiButtonRef, showEmojiPicker, 300);

  // Close video menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = Object.values(videoMenuRefs.current).some(
        ref => ref && ref.contains(event.target)
      );
      if (!isClickInside) {
        setActiveVideoMenu(null);
      }
    };

    if (activeVideoMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeVideoMenu]);

  // Handle save/unsave related video
  const handleToggleSaveRelated = async (videoId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast({ type: 'warning', message: 'Please login to save videos' });
      return;
    }

    try {
      const res = await userAPI.toggleSaveVideo(videoId);
      setSavedVideos(prev => ({ ...prev, [videoId]: res.data.isSaved }));
      addToast({
        type: res.data.isSaved ? 'success' : 'info',
        message: res.data.message
      });
      setActiveVideoMenu(null);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update saved status' });
    }
  };

  // Handle share related video
  const handleShareRelated = (videoId, title, e) => {
    e.preventDefault();
    e.stopPropagation();

    const videoUrl = `${window.location.origin}/video/${videoId}`;
    navigator.clipboard.writeText(videoUrl);
    addToast({ type: 'success', message: 'Link copied to clipboard!' });
    setActiveVideoMenu(null);
  };

  // Check saved status for related videos
  // Create stable dependency from video IDs to prevent infinite loops
  const relatedVideoIds = useMemo(() =>
    relatedVideos.map(v => v._id).join(','),
    [relatedVideos]
  );

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && relatedVideos.length > 0) {
        const statuses = {};
        for (const vid of relatedVideos) {
          try {
            const res = await userAPI.checkSavedStatus(vid._id);
            statuses[vid._id] = res.data.isSaved;
          } catch (error) {
            console.error('Error checking saved status:', error);
          }
        }
        setSavedVideos(statuses);
      }
    };
    checkSavedStatus();
  }, [isAuthenticated, relatedVideoIds, relatedVideos]);

  const likeMutation = useMutation(() => videoAPI.likeVideo(videoId), {
    onSuccess: (response) => {
      setIsLiked(response.data.data.isLiked);
      setIsDisliked(response.data.data.isDisliked);
      // Update cache without refetching to avoid incrementing views
      queryClient.setQueryData(['video', videoId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: {
              ...oldData.data.data,
              likeCount: response.data.data.likes,
              dislikeCount: response.data.data.dislikes,
              isLiked: response.data.data.isLiked,
              isDisliked: response.data.data.isDisliked
            }
          }
        };
      });
    },
  });

  const dislikeMutation = useMutation(() => videoAPI.dislikeVideo(videoId), {
    onSuccess: (response) => {
      setIsLiked(response.data.data.isLiked);
      setIsDisliked(response.data.data.isDisliked);
      // Update cache without refetching to avoid incrementing views
      queryClient.setQueryData(['video', videoId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: {
              ...oldData.data.data,
              likeCount: response.data.data.likes,
              dislikeCount: response.data.data.dislikes,
              isLiked: response.data.data.isLiked,
              isDisliked: response.data.data.isDisliked
            }
          }
        };
      });
    },
  });

  const saveMutation = useMutation(() => userAPI.toggleSaveVideo(videoId), {
    onSuccess: (response) => {
      const { isSaved, message } = response.data;
      setIsSaved(isSaved);
      addToast({
        type: isSaved ? 'success' : 'info',
        message: message
      });
    },
    onError: () => {
      addToast({
        type: 'error',
        message: 'Failed to update saved status'
      });
    }
  });

  const commentMutation = useMutation(
    (data) => videoAPI.addComment(videoId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', videoId]);
        setComment('');
        setShowEmojiPicker(false);
        addToast({ type: 'success', message: 'Comment posted successfully' });
      },
      onError: () => {
        addToast({ type: 'error', message: 'Failed to post comment' });
      }
    }
  );

  const subscribeMutation = useMutation(
    () => isSubscribed
      ? userAPI.unsubscribe(video.uploader._id)
      : userAPI.subscribe(video.uploader._id),
    {
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['video', videoId]);

        // Optimistically update the UI
        const previousSubscribed = isSubscribed;
        const wasSubscribed = isSubscribed;
        setIsSubscribed(!isSubscribed);

        return { previousSubscribed, wasSubscribed };
      },
      onSuccess: (data, variables, context) => {
        // Refetch to get updated subscriber count
        queryClient.invalidateQueries(['video', videoId]);
        addToast({
          type: context.wasSubscribed ? 'info' : 'success',
          message: context.wasSubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully'
        });
      },
      onError: (error, variables, context) => {
        // Revert on error
        if (context?.previousSubscribed !== undefined) {
          setIsSubscribed(context.previousSubscribed);
        }
        addToast({
          type: 'error',
          message: error.response?.data?.message || 'Failed to update subscription'
        });
      }
    }
  );

  const handleSubscribeClick = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        message: 'Please login to subscribe to this channel'
      });
      return;
    }
    subscribeMutation.mutate();
  };

  const handleCopyLink = async () => {
    const videoUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(videoUrl);
      setLinkCopied(true);
      addToast({
        type: 'success',
        message: 'Link copied to clipboard!'
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to copy link'
      });
    }
  };

  const handleShare = (platform) => {
    const videoUrl = window.location.href;
    const videoTitle = video?.title || 'Check out this video';

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(videoTitle)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(videoTitle + ' ' + videoUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(videoTitle)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate({ content: comment });
  };

  const handleReplySubmit = async (content, parentCommentId) => {
    await videoAPI.addComment(videoId, { content, parentComment: parentCommentId });
    queryClient.invalidateQueries(['comments', videoId]);
  };

  const onEmojiSelect = (emoji) => {
    setComment((prev) => prev + emoji);
  };

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDesktop = shareButtonRef.current && shareButtonRef.current.contains(event.target);
      const isClickInsideMobile = mobileShareButtonRef.current && mobileShareButtonRef.current.contains(event.target);

      if (!isClickInsideDesktop && !isClickInsideMobile) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

  if (isLoading) {
    return (
      <div className="px-0 sm:px-4 md:px-6 py-0 sm:py-4 md:py-6">
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 sm:gap-4 md:gap-6">
            {/* Main content skeleton */}
            <div className="md:col-span-12 lg:col-span-9">
              {/* Video player skeleton */}
              <div className="relative aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-none sm:rounded-md overflow-hidden mb-3 sm:mb-4 border-y sm:border border-dark-800 animate-shimmer">
                {/* Play icon placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-dark-700/50 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[20px] sm:border-l-[24px] border-l-dark-600 border-y-[12px] sm:border-y-[14px] border-y-transparent ml-1"></div>
                  </div>
                </div>
              </div>

              {/* Title skeleton */}
              <div className="px-3 sm:px-0 mb-3">
                <div className="h-5 sm:h-6 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4"></div>
              </div>

              {/* Mobile compact info skeleton - visible only on phones */}
              <div className="block sm:hidden px-3 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-32"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] border border-dark-800 animate-shimmer"></div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="w-10 h-8 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="w-20 h-8 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="w-10 h-8 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="w-10 h-8 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet info skeleton - hidden on phones */}
              <div className="hidden sm:flex flex-col sm:flex-col md:flex-row md:items-center justify-between mb-4 gap-3 md:gap-4 px-0 sm:px-0">
                <div className="flex items-center justify-between flex-1">
                  {/* Channel info */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] border border-dark-800 animate-shimmer"></div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="h-4 sm:h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-32"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-24"></div>
                    </div>
                  </div>
                  {/* Subscribe button skeleton */}
                  <div className="h-8 sm:h-9 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer w-24 sm:w-28"></div>
                </div>
                {/* Separator */}
                <div className="hidden md:block h-8 w-px bg-dark-700"></div>
                {/* Action buttons skeleton */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <div className="h-8 sm:h-9 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer w-24"></div>
                  <div className="h-8 sm:h-9 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer w-20"></div>
                  <div className="h-8 sm:h-9 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer w-20"></div>
                </div>
              </div>

              {/* Description skeleton */}
              <div className="bg-dark-900 rounded-none sm:rounded-md border-y sm:border border-dark-800 p-3 sm:p-4 mb-3 sm:mb-4 mx-0 sm:mx-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                  <div className="h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-16"></div>
                  <div className="h-5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-5/6"></div>
                  <div className="h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-4/6"></div>
                </div>
              </div>

              {/* Comments section */}
              <div className="px-3 sm:px-0">
                {/* Comments title skeleton */}
                <div className="h-5 sm:h-6 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-28 mb-3 sm:mb-4"></div>

                {/* Comment form skeleton */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] border border-dark-800 flex-shrink-0 animate-shimmer"></div>
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="h-16 sm:h-20 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer"></div>
                      <div className="flex justify-end gap-1.5 sm:gap-2">
                        <div className="h-7 sm:h-8 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer w-16 sm:w-20"></div>
                        <div className="h-7 sm:h-8 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded-md animate-shimmer w-20 sm:w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-dark-800 mb-6"></div>

                {/* Comments list skeleton */}
                <div className="space-y-1">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-2 sm:gap-2.5 py-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] border border-dark-800 flex-shrink-0 animate-shimmer"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 sm:h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-32 sm:w-40"></div>
                        <div className="h-3 sm:h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
                        <div className="h-3 sm:h-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/4"></div>
                        <div className="h-2.5 sm:h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-20 sm:w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Related videos sidebar skeleton */}
            <div className="hidden sm:block md:col-span-12 lg:col-span-3 px-0 sm:px-0">
              <div className="h-5 sm:h-6 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-28 sm:w-32 mb-3 md:mb-4"></div>
              <div className="flex md:flex-row lg:flex-col gap-3 md:gap-4 lg:gap-3 overflow-x-auto md:overflow-x-auto lg:overflow-x-visible pb-3 md:pb-4 lg:pb-0 scrollbar-hide">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 md:w-64 lg:w-auto">
                    <div className="flex md:flex-col lg:flex-row gap-2 md:gap-0 lg:gap-3">
                      <div className="relative flex-shrink-0 w-32 md:w-full lg:w-40">
                        <div className="w-full aspect-video bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded border border-dark-800 animate-shimmer"></div>
                      </div>
                      <div className="flex-1 min-w-0 md:mt-2 lg:mt-0 space-y-1 md:space-y-1.5">
                        <div className="h-3 sm:h-3.5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-full"></div>
                        <div className="h-3 sm:h-3.5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-4/5"></div>
                        <div className="h-2.5 sm:h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] rounded animate-shimmer w-3/5 hidden md:block"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="px-6 py-6 text-center">
        <p className="text-xl text-gray-400">Video not found</p>
      </div>
    );
  }

  // Show processing state
  if (video.processingStatus === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 min-h-[70vh]">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-lg font-medium text-white mb-1">Processing Your Content</h2>
        <p className="text-gray-500 max-w-xs mx-auto">
          We're currently transcoding your video for multiple qualities. This page will update automatically.
        </p>
      </div>
    );
  }

  // Show failed state
  if (video.processingStatus === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 min-h-[70vh]">
        <FaExclamationTriangle className="text-gray-700 mb-4" size={48} />
        <h2 className="text-lg font-medium text-white mb-1">Processing Failed</h2>
        <p className="text-gray-500 max-w-xs mx-auto mb-6">
          There was an error processing your video. Please try uploading again.
        </p>
        <Link
          to="/settings#upload"
          className="text-primary-500 hover:text-primary-400 font-medium transition"
        >
          Upload Another Video
        </Link>
      </div>
    );
  }

  return (
    <div className="px-0 sm:px-4 md:px-6 py-0 sm:py-4 md:py-6">
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 sm:gap-4 md:gap-6">
          {/* Main content */}
          <div className="md:col-span-12 lg:col-span-9">
            {/* Video player — sticky on mobile, normal flow on sm+ */}
            <div className="sticky top-14 sm:static z-10 sm:z-auto bg-black sm:bg-transparent mb-0 sm:mb-4">
              <VideoPlayer video={video} />
            </div>

            {/* Video title */}
            <h1 className="text-lg sm:text-xl font-semibold mb-3 px-3 sm:px-0">{sanitize(video.title)}</h1>

            {/* Mobile compact info - visible only on phones */}
            <div className="block sm:hidden px-3 mb-4">
              {/* Author, views, time */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <span className="text-white">{sanitize(video.uploader?.displayName || video.uploader?.username)}</span>
                <span>•</span>
                <span>{video.views} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}</span>
              </div>

              {/* Author image and action buttons */}
              <div className="flex items-center gap-3">
                {/* Author image */}
                <Link to={`/channel/${video.uploader?.username}`}>
                  <img
                    src={getAvatarUrl(video.uploader?.avatar)}
                    alt={video.uploader?.displayName || video.uploader?.username}
                    className="w-9 h-9 rounded-full"
                    onError={(e) => {
                      e.target.src = getAvatarUrl();
                    }}
                  />
                </Link>

                {/* Action buttons - icons only */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  {/* Subscribe button */}
                  {user?._id !== video.uploader?._id && (
                    <button
                      onClick={handleSubscribeClick}
                      disabled={!isAuthenticated || subscribeMutation.isLoading}
                      className={`px-3 py-2 rounded-full transition border ${
                        !isAuthenticated
                          ? 'bg-dark-800 text-gray-500 cursor-not-allowed border-dark-700'
                          : isSubscribed
                          ? 'bg-dark-800 hover:bg-dark-700 text-gray-300 border-dark-700'
                          : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700'
                      }`}
                      title={isSubscribed ? 'Subscribed' : 'Subscribe'}
                    >
                      {isSubscribed ? <FaBell size={14} /> : <FaRegBell size={14} />}
                    </button>
                  )}

                  {/* Like/Dislike combined button */}
                  <div className="flex items-center bg-dark-900 rounded-full border border-dark-700">
                    <button
                      onClick={() => likeMutation.mutate()}
                      disabled={!isAuthenticated}
                      className={`flex items-center px-3 py-2 rounded-l-full transition ${
                        isLiked ? 'text-primary-500' : 'text-gray-400 hover:bg-dark-800'
                      }`}
                      title={`${video?.likeCount || 0} likes`}
                    >
                      <FaThumbsUp size={14} />
                      <span className="ml-1.5 text-xs">{video?.likeCount || 0}</span>
                    </button>
                    <div className="w-px h-4 bg-dark-700"></div>
                    <button
                      onClick={() => dislikeMutation.mutate()}
                      disabled={!isAuthenticated}
                      className={`px-3 py-2 rounded-r-full transition ${
                        isDisliked ? 'text-primary-500' : 'text-gray-400 hover:bg-dark-800'
                      }`}
                      title="Dislike"
                    >
                      <FaThumbsDown size={14} />
                    </button>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={!isAuthenticated}
                    className={`px-3 py-2 rounded-full transition border ${
                      isSaved
                        ? 'bg-dark-800 text-primary-500 border-primary-900/50'
                        : 'bg-dark-900 text-gray-400 border-dark-700 hover:bg-dark-800'
                    }`}
                    title={isSaved ? 'Saved' : 'Save'}
                  >
                    {isSaved ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                  </button>

                  {/* Share button */}
                  <div className="relative" ref={mobileShareButtonRef}>
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="px-3 py-2 rounded-full transition border border-dark-700 bg-dark-900 text-gray-400 hover:bg-dark-800"
                      title="Share"
                    >
                      <FaShare size={14} />
                    </button>

                    {/* Share dropdown menu for mobile */}
                    {showShareMenu && (
                      <div className="absolute top-full right-0 mt-1 w-44 bg-dark-900 rounded border border-dark-700 py-1 z-50">
                        <button
                          onClick={handleCopyLink}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                        >
                          {linkCopied ? <FaCheck size={11} className="text-green-500" /> : <FaCopy size={11} />}
                          <span className="text-xs">{linkCopied ? 'Copied!' : 'Copy link'}</span>
                        </button>
                        <div className="h-px bg-dark-700 my-0.5"></div>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                        >
                          <FaTwitter size={11} className="text-[#1DA1F2]" />
                          <span className="text-xs">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                        >
                          <FaFacebook size={11} className="text-[#1877F2]" />
                          <span className="text-xs">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                        >
                          <FaWhatsapp size={11} className="text-[#25D366]" />
                          <span className="text-xs">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare('telegram')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                        >
                          <FaTelegram size={11} className="text-[#0088cc]" />
                          <span className="text-xs">Telegram</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop/Tablet Video info - hidden on phones */}
            <div className="hidden sm:flex flex-col sm:flex-col md:flex-row md:items-center justify-between mb-4 gap-3 md:gap-4 px-0 sm:px-0">
              <div className="flex items-center justify-between flex-1">
                <Link to={`/channel/${video.uploader?.username}`} className="flex items-center gap-2 sm:gap-3">
                  <img
                    src={getAvatarUrl(video.uploader?.avatar)}
                    alt={video.uploader?.displayName || video.uploader?.username}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                    onError={(e) => {
                      e.target.src = getAvatarUrl();
                    }}
                  />
                  <div>
                    <div className="text-sm sm:text-base font-medium">{sanitize(video.uploader?.displayName || video.uploader?.username)}</div>
                    <div className="text-xs text-gray-400">
                      {video.uploader?.subscribers?.length || 0} subscribers
                    </div>
                  </div>
                </Link>

                {/* Subscribe button - show for all non-owners, grayed if not authenticated */}
                {user?._id !== video.uploader?._id && (
                  <button
                    onClick={handleSubscribeClick}
                    disabled={!isAuthenticated || subscribeMutation.isLoading}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md transition disabled:opacity-50 text-xs sm:text-sm font-medium border ${
                      !isAuthenticated
                        ? 'bg-dark-800 text-gray-500 cursor-not-allowed border-dark-700'
                        : isSubscribed
                        ? 'bg-dark-800 hover:bg-dark-700 text-gray-300 border-dark-700'
                        : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700 shadow-sm'
                    }`}
                  >
                    {isSubscribed ? <FaBell size={14} /> : <FaRegBell size={14} />}
                    <span className="text-xs sm:text-sm font-medium">
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </span>
                  </button>
                )}
              </div>

              {/* Separator - only show when subscribe button is visible */}
              {user?._id !== video.uploader?._id && (
                <div className="hidden md:block h-8 w-px bg-dark-700"></div>
              )}

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <div className="flex items-center bg-dark-900 rounded-md border border-dark-700">
                  <button
                    onClick={() => likeMutation.mutate()}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 hover:bg-dark-800 rounded-l-md disabled:opacity-50 transition text-xs sm:text-sm font-medium ${
                      isLiked ? 'text-primary-500' : 'text-gray-400'
                    }`}
                  >
                    <FaThumbsUp size={13} className="sm:w-[14px] sm:h-[14px]" />
                    <span>{video?.likeCount || 0}</span>
                  </button>
                  <div className="w-px h-4 sm:h-5 bg-dark-700"></div>
                  <button
                    onClick={() => dislikeMutation.mutate()}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 hover:bg-dark-800 rounded-r-md disabled:opacity-50 transition text-xs sm:text-sm ${
                      isDisliked ? 'text-primary-500' : 'text-gray-400'
                    }`}
                  >
                    <FaThumbsDown size={13} className="sm:w-[14px] sm:h-[14px]" />
                  </button>
                </div>

                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={!isAuthenticated}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md transition border font-medium text-xs sm:text-sm ${
                    isSaved
                      ? 'bg-dark-800 text-primary-500 border-primary-900/50'
                      : 'bg-dark-900 hover:bg-dark-800 text-gray-400 border-dark-700'
                  }`}
                >
                  {isSaved ? <FaBookmark size={13} className="sm:w-[14px] sm:h-[14px]" /> : <FaRegBookmark size={13} className="sm:w-[14px] sm:h-[14px]" />}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <div className="relative" ref={shareButtonRef}>
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-dark-900 hover:bg-dark-800 px-2.5 sm:px-3 py-1.5 rounded-md transition border border-dark-700 text-xs sm:text-sm font-medium text-gray-400"
                  >
                    <FaShare size={13} className="sm:w-[14px] sm:h-[14px]" />
                    <span>Share</span>
                  </button>

                  {/* Share dropdown menu */}
                  {showShareMenu && (
                    <div className={`absolute right-0 ${getDropdownClasses(shareMenuPosition)} w-44 bg-dark-900 rounded border border-dark-700 py-1 z-50`}>
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                      >
                        {linkCopied ? <FaCheck size={11} className="text-green-500" /> : <FaCopy size={11} />}
                        <span className="text-xs">{linkCopied ? 'Copied!' : 'Copy link'}</span>
                      </button>
                      <div className="h-px bg-dark-700 my-0.5"></div>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                      >
                        <FaTwitter size={11} className="text-[#1DA1F2]" />
                        <span className="text-xs">Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                      >
                        <FaFacebook size={11} className="text-[#1877F2]" />
                        <span className="text-xs">Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                      >
                        <FaLinkedin size={11} className="text-[#0A66C2]" />
                        <span className="text-xs">LinkedIn</span>
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                      >
                        <FaWhatsapp size={11} className="text-[#25D366]" />
                        <span className="text-xs">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleShare('telegram')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left"
                      >
                        <FaTelegram size={11} className="text-[#0088cc]" />
                        <span className="text-xs">Telegram</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-dark-900 rounded-none sm:rounded-md border-y sm:border border-dark-800 p-3 sm:p-4 mb-3 sm:mb-4 mx-0 sm:mx-0">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-2 flex-wrap">
                <span className="hidden sm:inline">{video.views} views</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}</span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-dark-800 px-1.5 sm:px-2 py-0.5 rounded text-xs border border-dark-700">{sanitize(video.category)}</span>
                <span className="bg-dark-800 px-1.5 sm:px-2 py-0.5 rounded text-xs border border-dark-700">{sanitize(video.difficulty)}</span>
              </div>

              <div ref={descRef} className={`text-xs sm:text-sm whitespace-pre-wrap ${!showDescription && 'line-clamp-2'}`}>
                {sanitize(video.description)}
              </div>

              {(descClamped || showDescription) && (
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-300 mt-2"
                >
                  {showDescription ? 'Show less' : 'Show more'}
                </button>
              )}

              {video.toolsUsed && video.toolsUsed.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                  <div className="text-sm font-medium mb-2">Tools used:</div>
                  <div className="flex flex-wrap gap-2">
                    {video.toolsUsed.map((tool) => (
                      <span key={tool} className="bg-dark-800 px-2 py-0.5 rounded text-xs border border-dark-700">
                        {sanitize(tool)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="px-3 sm:px-0">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                {totalComments} Comments
              </h2>

              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-6 sm:mb-8">
                  <div className="flex gap-2 sm:gap-3">
                    <img
                      src={getAvatarUrl(user?.avatar)}
                      alt="Your avatar"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover"
                      onError={(e) => {
                        e.target.src = getAvatarUrl();
                      }}
                    />
                    <div className="flex-1 relative">
                      <div className="relative">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full bg-dark-900 border border-dark-700 rounded-md px-2.5 sm:px-3 py-2 pr-9 sm:pr-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                          rows={3}
                          maxLength={1000}
                        />
                        <button
                          ref={emojiButtonRef}
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-primary-500 transition-colors"
                          title="Add emoji"
                        >
                          <FaRegSmile className="text-lg" />
                        </button>
                      </div>

                      {showEmojiPicker && (
                        <div className={`absolute z-50 ${getDropdownClasses(emojiPickerPosition)} right-0`}>
                          <EmojiPicker
                            onEmojiSelect={onEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setComment('');
                            setShowEmojiPicker(false);
                          }}
                          className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm bg-dark-800 hover:bg-dark-700 rounded-md transition border border-dark-700 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!comment.trim() || commentMutation.isLoading}
                          className="px-2.5 sm:px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-xs sm:text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed border border-primary-700 shadow-sm"
                        >
                          {commentMutation.isLoading ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="mb-8 text-sm text-gray-400">
                  <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                    Sign in
                  </Link>{' '}
                  to leave a comment
                </p>
              )}

              {/* Separator */}
              <div className="h-px bg-dark-800 mb-6"></div>

              <div className="space-y-1">
                {allComments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    videoUploaderId={videoData?.data?.data?.uploader?._id}
                    onReplySubmit={handleReplySubmit}
                  />
                ))}
                <div ref={commentsSentinelRef} className="h-2" />
                {isFetchingMoreComments && (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related videos - Hidden on mobile, horizontal on tablets, sidebar on desktop */}
          <div className="hidden sm:block md:col-span-12 lg:col-span-3 px-0 sm:px-0">
            <h3 className="text-base sm:text-lg font-semibold mb-3 md:mb-4">Related videos</h3>
            {relatedVideos.length > 0 ? (
              <div className="flex md:flex-row lg:flex-col gap-3 md:gap-4 lg:gap-3 overflow-x-auto md:overflow-x-auto lg:overflow-x-visible pb-3 md:pb-4 lg:pb-0 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                {relatedVideos.slice(0, 8).map((relatedVideo) => (
                  <div key={relatedVideo._id} className="relative group flex-shrink-0 md:w-64 lg:w-auto">
                    <Link
                      to={`/video/${relatedVideo._id}`}
                      className="flex md:flex-col lg:flex-row gap-2 md:gap-0 lg:gap-3"
                    >
                      <div className="relative flex-shrink-0 w-32 md:w-full lg:w-40">
                        <img
                          src={getThumbnailUrl(relatedVideo.thumbnail)}
                          alt={relatedVideo.title}
                          className="w-full aspect-video object-cover rounded"
                          onError={(e) => {
                            e.target.src = getThumbnailUrl();
                          }}
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 px-1 py-0.5 rounded text-xs text-white">
                          {Math.floor(relatedVideo.duration / 60)}:{(relatedVideo.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 md:mt-2 lg:mt-0">
                        <h4 className="text-xs sm:text-sm font-medium line-clamp-2 mb-0.5 md:mb-1">{sanitize(relatedVideo.title)}</h4>
                        <p className="text-xs text-gray-400 mb-0.5 md:mb-1 hidden md:block">{sanitize(relatedVideo.uploader?.displayName)}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 hidden md:flex">
                          <span>{relatedVideo.views >= 1000 ? `${(relatedVideo.views / 1000).toFixed(1)}K` : relatedVideo.views} views</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(relatedVideo.uploadedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Three-dot menu */}
                    <div
                      ref={el => videoMenuRefs.current[relatedVideo._id] = el}
                      className="absolute top-0 right-0 md:top-2 lg:top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveVideoMenu(activeVideoMenu === relatedVideo._id ? null : relatedVideo._id);
                        }}
                        className="p-2 hover:bg-dark-800 rounded-full transition"
                      >
                        <FaEllipsisV size={14} className="text-gray-400" />
                      </button>

                      {activeVideoMenu === relatedVideo._id && (
                        <div className="absolute top-full right-0 mt-1 w-36 bg-dark-900 rounded border border-dark-700 py-1 z-50">
                          <button
                            onClick={(e) => handleToggleSaveRelated(relatedVideo._id, e)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left text-xs"
                          >
                            {savedVideos[relatedVideo._id] ? <FaBookmark size={11} className="text-primary-400" /> : <FaRegBookmark size={11} />}
                            <span>{savedVideos[relatedVideo._id] ? 'Unsave' : 'Save'}</span>
                          </button>
                          <button
                            onClick={(e) => handleShareRelated(relatedVideo._id, relatedVideo.title, e)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-dark-800 transition text-left text-xs"
                          >
                            <FaShare size={11} />
                            <span>Share</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base text-gray-500">No related videos found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
