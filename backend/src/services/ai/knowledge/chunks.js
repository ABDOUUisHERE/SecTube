/**
 * SecTube platform knowledge base.
 * Each chunk covers one feature area. Keywords drive retrieval —
 * add synonyms users might actually type.
 */

export const chunks = [
  {
    id: 'platform_overview',
    keywords: ['sectube', 'platform', 'what is', 'about', 'cybersecurity', 'hacking', 'ctf', 'bug bounty'],
    text: `SecTube is a video streaming platform dedicated to cybersecurity content: bug bounties, ethical hacking, CTF writeups, penetration testing, malware analysis, reverse engineering, OSINT, and more. Videos are categorised by topic and difficulty (Beginner → Expert). Anyone can watch. To upload you need a Streamer account.`,
  },

  {
    id: 'navigation',
    keywords: ['navigate', 'go to', 'open', 'where', 'find page', 'home', 'browse', 'menu', 'sidebar', 'navbar'],
    text: `Main navigation:
- Sidebar (hamburger icon, top-left): Home, Browse, History, Saved, Subscriptions, My Channel, Analytics.
- Navbar icons (top-right): upload arrow, messages envelope, notification bell, AI chatbot stars icon, theme toggle, user avatar.
- Clicking your avatar opens a dropdown: Settings, Logout.`,
  },

  {
    id: 'upload',
    keywords: ['upload', 'post video', 'publish', 'streamer', 'add video', 'share video', 'upload panel', 'arrow up'],
    text: `To upload a video you must be a Streamer. Click the upload arrow icon in the top navbar to open the upload panel. Fill in: title, description, category (e.g. "CTF Writeup"), difficulty (Beginner/Intermediate/Advanced/Expert), tags, tools used, visibility (Public / Unlisted / Private), then attach your video file and an optional custom thumbnail. Click Upload. Processing (transcoding to multiple qualities) runs in the background — the video status changes from "processing" to "ready" when done.
You can also upload from Settings → Upload section.`,
  },

  {
    id: 'search_browse',
    keywords: ['search', 'find', 'look for', 'browse', 'filter', 'category', 'difficulty', 'trending', 'popular', 'recent', 'explore'],
    text: `To find videos:
- Search bar in the navbar: type a keyword and press Enter.
- Browse page: filter by category (Web Application Security, Bug Bounty, CTF Writeup, Penetration Testing, OSINT, etc.) and difficulty (Beginner, Intermediate, Advanced, Expert). Sort by newest, most viewed, or top rated.
- Home page shows the general feed with infinite scroll.
- Subscriptions page shows videos only from channels you follow.`,
  },

  {
    id: 'video_player',
    keywords: ['watch', 'video', 'player', 'quality', 'like', 'dislike', 'save', 'share', 'description', 'show more', 'comments', 'reply', 'views', 'pin', 'mobile'],
    text: `Video player page features:
- Quality selector: choose 360p / 480p / 720p / 1080p.
- Like / dislike buttons (requires login). Like count is visible.
- Save button: saves to your Saved list (requires login).
- Share button: copy link, or share to Twitter, Facebook, Reddit, Telegram.
- Subscribe / Unsubscribe button for the channel (requires login).
- Description with "Show more / Show less" toggle.
- Comments section: add a comment (requires login), reply to comments, like comments. Loads more comments on scroll.
- On mobile the video player sticks to the top of the screen while you scroll.`,
  },

  {
    id: 'channel',
    keywords: ['channel', 'subscribe', 'unsubscribe', 'follow', 'streamer page', 'channel page', 'profile page', 'content creator'],
    text: `Channel pages show the streamer's avatar, channel name, bio, subscriber count, social links, specialties, and their uploaded videos. Click **Subscribe** to follow (requires login) — you'll get notifications for new content and see their videos in your Subscriptions feed. Click again to Unsubscribe.`,
  },

  {
    id: 'settings_profile',
    keywords: ['settings', 'profile', 'edit', 'display name', 'bio', 'avatar', 'picture', 'social links', 'twitter', 'github', 'linkedin', 'hackerone', 'bugcrowd', 'discord', 'tryhackme', 'website', 'specialties', 'expertise'],
    text: `Settings page sections:
- Identity: change display name, bio, avatar (upload an image).
- Expertise: select your specialties (Web Application Security, Bug Bounty, Reverse Engineering, etc.).
- Social Links: Twitter, GitHub, LinkedIn, Website, HackerOne, Bugcrowd, Discord, YouTube, TryHackMe.
To open Settings: click your avatar in the navbar → Settings.`,
  },

  {
    id: 'settings_security',
    keywords: ['password', 'change password', '2fa', 'two factor', 'authenticator', 'security', 'totp', 'qr code', 'disable 2fa', 'enable 2fa', 'master key'],
    text: `Security settings are in Settings → Security section:
- Change password: enter current password, new password, confirm. Requires login.
- Two-Factor Authentication (2FA / TOTP): click "Enable 2FA" → scan the QR code with an authenticator app (Google Authenticator, Authy, etc.) → enter the 6-digit code to verify. To disable: click "Disable 2FA" and confirm with your password.`,
  },

  {
    id: 'settings_streamer',
    keywords: ['streamer', 'upgrade', 'downgrade', 'become streamer', 'viewer', 'channel name', 'creator', 'role'],
    text: `To become a Streamer: Settings → Streamer section → click "Upgrade to Streamer" → enter a channel name and select your specialties. This unlocks video upload, a public channel page (/channel/USERNAME), and the Analytics dashboard.
To go back to Viewer: Settings → Streamer section → "Downgrade to Viewer". This hides your channel and disables uploads but keeps your account.`,
  },

  {
    id: 'messaging',
    keywords: ['message', 'messages', 'dm', 'direct message', 'chat', 'inbox', 'conversation', 'send message', 'private'],
    text: `Private messaging is at /messages (envelope icon in navbar, shows unread badge).
- Left panel: list of conversations sorted by latest message. Unread conversations are highlighted.
- Right panel: message thread. Scroll up to load older messages.
- Type in the input box (supports multi-line with Shift+Enter), click the send button or press Enter.
- Real-time: messages appear instantly via Socket.IO without refreshing.
Requires login.`,
  },

  {
    id: 'notifications',
    keywords: ['notification', 'notify', 'bell', 'alert', 'unread', 'mark read', 'comment notification', 'subscribe notification', 'reply notification'],
    text: `Notifications are in the bell icon (top navbar). A red badge shows the unread count.
Click the bell to open the dropdown. Notification types:
- New comment on your video.
- Reply to your comment.
- Someone subscribed to your channel.
- New private message received.
Click a notification to go to the relevant page. "Mark all as read" clears the badge. Notifications are real-time via Socket.IO.
Requires login.`,
  },

  {
    id: 'history',
    keywords: ['history', 'watch history', 'watched', 'recently watched', 'clear history'],
    text: `Watch history (sidebar → **History**): shows all videos you have watched, most recent first, with infinite scroll. You can clear your entire history with the **Clear History** button. Requires login.`,
  },

  {
    id: 'saved',
    keywords: ['saved', 'save', 'bookmark', 'watchlist', 'watch later', 'saved videos'],
    text: `Saved videos (sidebar → **Saved**): shows all videos you have saved using the Save button on the video player. Infinite scroll. Requires login.`,
  },

  {
    id: 'subscriptions',
    keywords: ['subscriptions', 'following', 'feed', 'subscription feed', 'subscribed channels'],
    text: `Subscriptions feed (sidebar → **Subscriptions**): shows the latest videos from all channels you follow, in chronological order, with infinite scroll. Requires login.`,
  },

  {
    id: 'analytics',
    keywords: ['analytics', 'stats', 'statistics', 'views', 'performance', 'dashboard', 'streamer dashboard', 'insights', 'chart'],
    text: `Analytics dashboard (sidebar → **Analytics**, visible to Streamers only). Shows:
- Overview: total views, total videos, subscribers, likes.
- Video performance: views and likes per video.
- Trends over time (last 7 / 30 / 90 days).
- Category distribution of your videos.
- Difficulty distribution.
Requires Streamer role.`,
  },

  {
    id: 'admin',
    keywords: ['admin', 'administration', 'manage users', 'manage videos', 'ban', 'delete user', 'moderation', 'admin panel'],
    text: `Admin dashboard (requires Admin role). Sections:
- Platform stats: total users, videos, views, streamers.
- User management: list all users, change roles, delete accounts.
- Video management: list all videos, change visibility, delete videos.
Access is restricted — only accounts with the Admin role can open this page.`,
  },

  {
    id: 'auth',
    keywords: ['login', 'register', 'sign up', 'sign in', 'logout', 'forgot password', 'reset password', 'verify email', 'oauth', 'google login', 'github login'],
    text: `Authentication:
- Register: email, username, password. A verification email is sent — click the link to activate.
- Login: email + password. If 2FA is enabled, enter your 6-digit code after.
- Forgot password: click **Forgot password** on the login page → enter your email → receive a reset link.
- OAuth: login with Google or GitHub via the buttons on the login/register page.
- Logout: click your avatar → **Logout**.`,
  },

  {
    id: 'video_management',
    keywords: ['edit video', 'delete video', 'update video', 'change title', 'change description', 'change visibility', 'my videos', 'manage videos'],
    text: `To manage your uploaded videos go to your channel page or Settings → Upload section. You can edit a video's title, description, category, difficulty, tags, tools used, and visibility (Public / Unlisted / Private). You can also delete a video. Only the uploader or an Admin can edit or delete a video.`,
  },

  {
    id: 'theme',
    keywords: ['theme', 'dark mode', 'light mode', 'appearance', 'dark', 'light', 'toggle theme'],
    text: `SecTube supports dark and light themes. Toggle using the sun/moon icon in the sidebar or navbar. Your preference is saved in the browser.`,
  },
];
