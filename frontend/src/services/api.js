import axios from 'axios';

const API_URL = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => {
    // Check if data is FormData (for avatar upload) or regular object
    const headers = data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : {};
    return api.put('/auth/profile', data, { headers });
  },
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  upgradeToStreamer: (data) => api.post('/auth/upgrade-to-streamer', data),
  downgradeToViewer: () => api.post('/auth/downgrade-to-viewer'),
  forgotPassword: (data) => api.post('/auth/forgotpassword', data),
  resetPassword: (token, data) => api.put(`/auth/resetpassword/${token}`, data),
  setup2FA: () => api.post('/auth/setup-2fa'),
  verify2FA: (data) => api.post('/auth/verify-2fa', data),
  disable2FA: (data) => api.post('/auth/disable-2fa', data),
  verifyLogin2FA: (data) => api.post('/auth/verify-login-2fa', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Video API
export const videoAPI = {
  getVideos: (params) => api.get('/videos', { params }),
  getVideo: (id) => api.get(`/videos/${id}`),
  uploadVideo: (formData, onUploadProgress) =>
    api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  updateVideo: (id, data) => api.put(`/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
  likeVideo: (id) => api.post(`/videos/${id}/like`),
  dislikeVideo: (id) => api.post(`/videos/${id}/dislike`),
  addComment: (id, data) => api.post(`/videos/${id}/comments`, data),
  getComments: (id, params) => api.get(`/videos/${id}/comments`, { params }),
  getCommentReplies: (commentId) => api.get(`/videos/comments/${commentId}/replies`),
  likeComment: (commentId) => api.post(`/videos/comments/${commentId}/like`),
  searchVideos: (params) => api.get('/videos/search', { params }),
  analyzeVideoMeta: (data) => api.post('/videos/analyze-meta', data),
  getRecommendations: (params) => api.get('/videos/recommendations', { params }),
};

// User API
export const userAPI = {
  getUser: (username) => api.get(`/users/${username}`),
  getUserVideos: (username, params) => api.get(`/users/${username}/videos`, { params }),
  subscribe: (userId) => api.post(`/users/${userId}/subscribe`),
  unsubscribe: (userId) => api.delete(`/users/${userId}/unsubscribe`),
  getSubscriptions: () => api.get('/users/me/subscriptions'),
  getFollowingStreamers: () => api.get('/users/me/following-streamers'),
  getSubscriptionFeed: (params) => api.get('/users/me/subscription-feed', { params }),
  getWatchHistory: (params) => api.get('/users/me/history', { params }),
  clearWatchHistory: () => api.delete('/users/me/history'),
  getSavedVideos: (params) => api.get('/users/me/saved', { params }),
  toggleSaveVideo: (videoId) => api.post(`/users/me/saved/${videoId}`),
  checkSavedStatus: (videoId) => api.get(`/users/me/saved/${videoId}/check`),
};

// Channel API
export const channelAPI = {
  getChannels: (params) => api.get('/channels', { params }),
  getChannel: (username) => api.get(`/channels/${username}`),
  getFeaturedChannels: (params) => api.get('/channels/featured', { params }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getVideoPerformance: (params) => api.get('/analytics/videos', { params }),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getCategoryDistribution: (params) => api.get('/analytics/categories', { params }),
  getDifficultyDistribution: (params) => api.get('/analytics/difficulty', { params }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getVideos: (params) => api.get('/admin/videos', { params }),
  updateVideo: (id, data) => api.put(`/admin/videos/${id}`, data),
};

// Message API
export const messageAPI = {
  send: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getThread: (userId, params) => api.get(`/messages/${userId}`, { params }),
  markRead: (userId) => api.put(`/messages/${userId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// Stream API
export const streamAPI = {
  create:           (data) => api.post('/streams', data),
  getLive:          () => api.get('/streams/live'),
  getFollowingLive: () => api.get('/streams/following'),
  getMine:          () => api.get('/streams/mine'),
  getStream:        (id) => api.get(`/streams/${id}`),
  update:           (id, data) => api.put(`/streams/${id}`, data),
  end:              (id) => api.put(`/streams/${id}/end`),
  regenerateKey:    (id) => api.put(`/streams/${id}/regenerate-key`),
};

// Notification API
export const notificationAPI = {
  getAll:       () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead:     (id) => api.put(`/notifications/${id}/read`),
  markAllRead:  () => api.put('/notifications/read-all'),
};

export default api;
