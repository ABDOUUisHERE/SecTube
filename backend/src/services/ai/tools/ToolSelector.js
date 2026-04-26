// Match tool names to logical groups
const GROUPS = {
  navigation:    (n) => n === 'navigate_to',
  video_read:    (n) => /^get_videos/.test(n),
  video_actions: (n) => /^(post|delete|put)_videos/.test(n) && !n.includes('comment'),
  comments:      (n) => n.includes('comment'),
  auth:          (n) => n.includes('auth') || n.endsWith('_me') || n.includes('_me_'),
  user_read:     (n) => /^get_users/.test(n) && !n.includes('_me_'),
  social:        (n) => n.includes('subscribe'),
  history:       (n) => n.includes('history') || (n.includes('saved') && n.includes('me')),
};

// Keyword patterns → groups to include
const INTENT_MAP = [
  { re: /\b(go to|open|take me|navigate|visit)\b/i,                        groups: ['navigation'] },
  { re: /\b(search|find|look for|browse|videos?|watch|trending|popular|recent|latest|show me videos?)\b/i, groups: ['navigation', 'video_read'] },
  { re: /\b(like|dislike|save|unsave|bookmark)\b/i,                        groups: ['navigation', 'video_actions'] },
  { re: /\b(comment|reply)\b/i,                                            groups: ['navigation', 'comments'] },
  { re: /\b(subscribe|unsubscribe|follow|channel)\b/i,                     groups: ['navigation', 'social', 'user_read'] },
  { re: /\b(profile|settings|avatar|bio|account|password|upgrade|streamer)\b/i, groups: ['navigation', 'auth'] },
  { re: /\b(who am i|my (info|account|profile)|logged.?in)\b/i,            groups: ['navigation', 'auth'] },
  { re: /\b(watch history|history|watched)\b/i,                            groups: ['navigation', 'history'] },
  { re: /\b(saved|bookmarks?|my saved)\b/i,                                groups: ['navigation', 'history'] },
  { re: /\b(user|channel page|other user)\b/i,                             groups: ['navigation', 'user_read'] },
];

export const ToolSelector = {
  selectFor(userMessage, allTools) {
    const matched = new Set(['navigation']); // always include navigation

    for (const { re, groups } of INTENT_MAP) {
      if (re.test(userMessage)) groups.forEach(g => matched.add(g));
    }

    // If only navigation matched (no real intent found), return all tools
    // so the AI can make sense of ambiguous messages
    if (matched.size === 1) return allTools;

    return allTools.filter(tool =>
      [...matched].some(group => GROUPS[group]?.(tool.name))
    );
  },
};
