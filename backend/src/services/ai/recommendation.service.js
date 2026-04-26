import { AIClient } from './AIClient.js';
import Video from '../../models/Video.js';
import User from '../../models/User.js';

const REASON_PROMPT = `You are a recommendation engine assistant for SecTube, a cybersecurity video platform.
Given the user's viewing profile, write ONE short sentence (max 12 words) explaining why these videos were recommended.
Start with "Based on" or "Because you". No emojis. Respond with just the sentence, nothing else.`;

// Score a candidate video against user preferences
const scoreVideo = (video, categoryWeights, tagSet) => {
  let score = 0;
  score += (categoryWeights[video.category] || 0) * 3;
  score += (video.tags || []).filter(t => tagSet.has(t.toLowerCase())).length * 2;
  score += Math.log10((video.views || 0) + 1) * 0.5; // mild popularity boost
  return score;
};

export const recommendationService = {
  async getRecommendations(userId, { limit = 12, excludeVideoId } = {}) {
    // — Unauthenticated: return trending videos
    if (!userId) {
      const videos = await Video.find({ visibility: 'public', processingStatus: 'ready' })
        .sort({ views: -1 })
        .limit(limit)
        .populate('uploader', 'username displayName avatar channelName');
      return { videos, reason: 'Trending in Cybersecurity' };
    }

    // — Authenticated: build user preference profile
    const user = await User.findById(userId)
      .populate({ path: 'watchHistory.video', select: 'category tags _id', match: { processingStatus: 'ready' } })
      .select('watchHistory likedVideos');

    const history = (user?.watchHistory || [])
      .filter(h => h.video)
      .slice(0, 30);

    const watchedIds = new Set(history.map(h => String(h.video._id)));
    if (excludeVideoId) watchedIds.add(String(excludeVideoId));

    // Build category frequency weights
    const categoryWeights = {};
    const tagSet = new Set();

    for (const { video } of history) {
      categoryWeights[video.category] = (categoryWeights[video.category] || 0) + 1;
      (video.tags || []).forEach(t => tagSet.add(t.toLowerCase()));
    }

    // If no history yet, fall back to trending
    if (Object.keys(categoryWeights).length === 0) {
      const videos = await Video.find({ visibility: 'public', processingStatus: 'ready' })
        .sort({ views: -1 })
        .limit(limit)
        .populate('uploader', 'username displayName avatar channelName');
      return { videos, reason: 'Popular on SecTube' };
    }

    // Top 2 preferred categories
    const topCategories = Object.entries(categoryWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cat]) => cat);

    // Fetch candidates: videos in preferred categories not yet watched
    const candidates = await Video.find({
      visibility: 'public',
      processingStatus: 'ready',
      _id: { $nin: [...watchedIds] },
      category: { $in: topCategories },
    })
      .sort({ views: -1 })
      .limit(40)
      .populate('uploader', 'username displayName avatar channelName');

    // Score and sort
    let scored = candidates
      .map(v => ({ video: v, score: scoreVideo(v, categoryWeights, tagSet) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ video }) => video);

    // No category-matched candidates → fall back to trending (excluding watched)
    if (scored.length === 0) {
      scored = await Video.find({
        visibility: 'public',
        processingStatus: 'ready',
        _id: { $nin: [...watchedIds] },
      })
        .sort({ views: -1 })
        .limit(limit)
        .populate('uploader', 'username displayName avatar channelName');
    }

    // Still empty (e.g. small platform, user watched everything) → show any public videos
    if (scored.length === 0) {
      scored = await Video.find({ visibility: 'public', processingStatus: 'ready' })
        .sort({ views: -1 })
        .limit(limit)
        .populate('uploader', 'username displayName avatar channelName');
    }

    if (scored.length === 0) {
      return { videos: [], reason: '' };
    }

    // AI: generate a short personalized reason (fire-and-forget, fallback on error)
    let reason = `Based on your interest in ${topCategories[0]}`;
    if (AIClient.isAvailable()) {
      try {
        const profile = `Top categories watched: ${topCategories.join(', ')}. Common tags: ${[...tagSet].slice(0, 5).join(', ')}.`;
        const response = await AIClient.complete([
          { role: 'system', content: REASON_PROMPT },
          { role: 'user', content: profile },
        ]);
        const text = response.choices[0]?.message?.content?.trim();
        if (text && text.length < 100) reason = text;
      } catch { /* use fallback */ }
    }

    return { videos: scored, reason };
  },
};
