# SecTube - Cybersecurity Streaming Platform

A modern video streaming platform designed specifically for cybersecurity enthusiasts, bug hunters, ethical hackers, and security researchers to share knowledge and learn together.

## Quick Start

See [DEPLOYMENT.md](./DEPLOYMENT.md) for free deployment guide using Vercel, Render, and MongoDB Atlas.

## Features

### Video Browsing & Discovery
- **Browse Videos**: Explore with advanced filters (category, difficulty, sort by latest/popular/oldest)
- **Smart Search**: Responsive search bar (full on desktop, icon on mobile) with real-time results
- **Video Player**: Adaptive quality streaming (360p, 480p, 720p, 1080p) with Video.js
- **Channel Pages**: View creator profiles with stats, bio, specialties, and social links
- **Featured Content**: Discover trending and recommended videos on homepage
- **Pagination**: Smooth navigation across all video lists with optimized loading

### User Engagement
- **Subscribe/Unsubscribe**: Follow your favorite security researchers
- **Subscription Feed**: Personalized feed with latest videos from subscribed channels
- **Like/Dislike**: React to videos and see community engagement
- **Save/Bookmark**: Bookmark videos for quick access later
- **Watch History**: Automatic tracking of watched videos with timestamps
- **Comments System**: Comment on videos with nested replies support
- **Emoji Picker**: Add emojis to comments for expressive communication
- **Video Sharing**: Share to Twitter, Facebook, LinkedIn, WhatsApp, Telegram, or copy link

### Content Creation (Streamers)
- **Video Upload**: Upload videos up to 5GB with drag-and-drop support
- **Auto Transcoding**: Automatic processing to multiple qualities (360p-1080p)
- **Thumbnail Management**: Auto-generated or custom thumbnail upload
- **Channel Customization**: Set bio, specialties, and social links (GitHub, Twitter, LinkedIn, Website, HackerOne)
- **Video Management**: Edit, delete, and organize your content
- **Content Tagging**: Categorize with difficulty levels, tools used, and custom tags
- **Subscriber Tracking**: Monitor your subscriber count and growth
- **View Analytics**: Track views, likes, and engagement metrics
- **Upgrade System**: Easy upgrade from viewer to streamer role

### Authentication & Security
- **Email/Password Auth**: Secure authentication with bcrypt hashing (10 salt rounds)
- **Email Verification**: Mandatory email verification for new accounts
- **Two-Factor Authentication (2FA)**: TOTP-based protection (Google Authenticator, Authy compatible)
- **Password Recovery**: Secure, rate-limited password reset via email
- **SSO Integration**: Login with GitHub or Google OAuth
- **Silent Signup Protocol**: Protection against user enumeration
- **Anti-Enumeration Login**: Generic error messages for failed logins
- **JWT Tokens**: Secure session management with 7-day expiration
- **Role-Based Access**: Viewer, Streamer, and Admin roles with permissions
- **Rate Limiting**: Brute-force protection on authentication endpoints
- **XSS Prevention**: DOMPurify sanitization on all user inputs

### User Settings & Profile
- **Profile Management**: Update display name, username, email, avatar
- **Password Change**: Update password with current password verification
- **2FA Management**: Enable/disable 2FA with QR code setup
- **Streamer Settings**: Manage channel name, bio, specialties, social links
- **Account Upgrade**: Convert viewer account to streamer with channel setup
- **Collapsible Sidebar**: Mobile-friendly settings navigation with sticky header

### AI Assistant
- **Intelligent Chatbot**: AI-powered assistant for platform navigation and video discovery
- **Platform Navigation**: AI navigates the user to any page ("take me to settings", "go to browse") with automatic redirect and chat close
- **UI-First Responses**: How-to questions answered with step-by-step UI instructions, not raw API docs
- **MCP Integration**: Model Context Protocol for seamless API interaction
- **Tool Calling**: AI automatically calls appropriate API endpoints
- **Authenticated Actions**: AI performs actions on behalf of logged-in users (like, save, subscribe)
- **Natural Language Queries**: Find videos using conversational language
- **Markdown Rendering**: Rich text formatting with code syntax highlighting
- **Persistent Chat History**: Conversations saved in localStorage across sessions
- **Security-First**: Automatic sanitization of sensitive data before AI processing
- **Multi-Model Support**: Compatible with various LLMs via OpenRouter (Gemini, LLaMA, Claude)

### Progressive Web App (PWA)
- **Installable**: Install on mobile and desktop devices like a native app
- **Offline Support**: Service worker with caching strategies for offline access
- **App Icon**: Custom icon for home screen and app drawer
- **Standalone Mode**: Full-screen experience without browser UI
- **Auto-Update**: Seamless updates with service worker registration

### User Experience & Design
- **Dark Mode**: Eye-friendly dark theme throughout the application
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Touch-Friendly**: Optimized tap targets and gestures for mobile devices
- **Shimmer Loading**: Professional gradient shimmer animations on all loading states
- **Optimized Skeletons**: Smart skeleton counts (3-8 items) to prevent scrollbars
- **Toast Notifications**: Non-blocking feedback for actions (3s auto-dismiss)
- **Confirmation Dialogs**: Two-step confirmation for destructive actions
- **Smooth Animations**: 60fps transitions and hover effects
- **Keyboard Navigation**: Tab order and keyboard shortcuts support
- **Error Handling**: User-friendly error messages with recovery suggestions

### Additional Features
- **Terms of Service**: Comprehensive terms page
- **Privacy Policy**: Detailed privacy policy
- **Admin Dashboard**: Admin panel for platform management
- **Analytics Page**: Streamer analytics and insights (coming soon)
- **RESTful API**: Clean API architecture with Swagger documentation
- **Video Processing**: Real-time FFmpeg transcoding with status updates
- **Automatic Thumbnails**: Generated at 10% timestamp (1280x720)
- **Multiple Categories**: 14 cybersecurity categories (Bug Bounty, Web Security, Penetration Testing, etc.)
- **Difficulty Levels**: Beginner, Intermediate, Advanced, Expert
- **Tools Tagging**: Specify tools used (Burp Suite, Metasploit, etc.)

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Redis** (ioredis) for response caching and view buffering
- **JWT** for authentication
- **Passport.js** for GitHub/Google SSO
- **FFmpeg** for video processing
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **speakeasy & qrcode** for TOTP 2FA
- **nodemailer** for secure email delivery
- **express-rate-limit** for brute-force protection
- **OpenRouter API** for AI model access
- **Swagger/OpenAPI** for API documentation and MCP tool generation
- **MCP (Model Context Protocol)** for AI agent integration
- **Axios** for HTTP requests

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Vite** for fast development
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **Video.js** for video playback
- **Axios** for HTTP requests
- **React Markdown** with remark-gfm for AI chat rendering
- **React Icons** for UI elements

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher)
- **FFmpeg** (for video processing)
- **npm** or **yarn**

### Installing FFmpeg

#### Windows
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your PATH environment variable

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd malto_stream_pltfrm
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Set up environment variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sectube

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5368709120
UPLOAD_PATH=./uploads
VIDEO_PATH=./videos
THUMBNAIL_PATH=./thumbnails

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# FFmpeg paths (adjust if needed)
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe

# Video Quality Settings
VIDEO_QUALITIES=360p,480p,720p,1080p

# AI & MCP Configuration (Optional - for AI chatbot)
OPENROUTER_API_KEY=your_openrouter_api_key
CHAT_MODEL=google/gemini-flash-1.5:free

# Redis (Optional - for caching and view buffering)
# Local:   redis://localhost:6379
# Upstash: rediss://:password@host.upstash.io:6379  (free tier at upstash.com)
REDIS_URL=redis://localhost:6379
```

**Note:** To get an OpenRouter API key for the AI chatbot:
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Go to [API Keys](https://openrouter.ai/keys) and create a new key
3. Recommended free models: `google/gemini-flash-1.5:free`, `meta-llama/llama-3.1-8b-instruct:free`

### 4. Start MongoDB

Make sure MongoDB is running:
```bash
# Windows (if installed as service)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### 5. Run the application

#### Development mode (recommended)
Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

#### Production mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves both API and frontend)
cd ../backend
npm start 
```

## SSO Configuration Guide

To enable GitHub and Google login, you must register OAuth applications on their respective platforms.

### 1. GitHub SSO Setup
1.  Go to [GitHub Developer Settings](https://github.com/settings/developers).
2.  Click **New OAuth App**.
3.  **Homepage URL**: `http://localhost:5173`
4.  **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
5.  Generate a **Client Secret** and copy both the ID and Secret to your `.env`.

### 2. Google SSO Setup
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project and navigate to **APIs & Services > Credentials**.
3.  Click **Create Credentials > OAuth client ID** (Select *Web application*).
4.  **Authorized JavaScript origins**: `http://localhost:5173`
5.  **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
6.  Copy the **Client ID** and **Client Secret** to your `.env`.

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

#### Verify Email
```http
GET /api/auth/verify-email/:token
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify 2FA Login
```http
POST /api/auth/verify-login-2fa
Content-Type: application/json

{
  "userId": "user_id_here",
  "token": "123456"
}
```

#### Password Recovery
```http
POST /api/auth/forgotpassword
Content-Type: application/json
{ "email": "john@example.com" }

PUT /api/auth/resetpassword/:token
Content-Type: application/json
{ "password": "newpassword123" }
```

#### Security Management
```http
POST /api/auth/setup-2fa
POST /api/auth/verify-2fa
POST /api/auth/disable-2fa
PUT /api/auth/updatepassword
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Upgrade to Streamer
```http
POST /api/auth/upgrade-to-streamer
Authorization: Bearer <token>
Content-Type: application/json

{
  "channelName": "My Security Channel",
  "specialties": ["Bug Bounty", "Web Application Security"]
}
```

### Video Endpoints

#### Get Videos
```http
GET /api/videos?page=1&limit=12&category=Bug%20Bounty&sort=popular
```

#### Get Single Video
```http
GET /api/videos/:videoId
```

#### Upload Video (Streamers only)
```http
POST /api/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "video": <file>,
  "thumbnail": <file>,
  "title": "SQL Injection Tutorial",
  "description": "Learn SQL injection...",
  "category": "Web Application Security",
  "difficulty": "Beginner",
  "tags": "sql,web,tutorial",
  "toolsUsed": "Burp Suite,sqlmap"
}
```

#### Search Videos
```http
GET /api/videos/search?q=sql%20injection&category=Web%20Application%20Security
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/:username
```

#### Subscribe to User
```http
POST /api/users/:userId/subscribe
Authorization: Bearer <token>
```

### Channel Endpoints

#### Get All Channels
```http
GET /api/channels?page=1&limit=12
```

#### Get Featured Channels
```http
GET /api/channels/featured?limit=6
```

### AI Chat Endpoints

#### Chat with AI Assistant
```http
POST /api/chat
Authorization: Bearer <token> (optional)
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Find me videos about SQL injection" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Show the most popular one" }
  ]
}
```

**Note:** The AI assistant automatically uses MCP (Model Context Protocol) to interact with the SecTube API. It can:
- Search and filter videos
- Get user profiles and subscriptions
- Perform authenticated actions (like/save videos) when logged in
- Answer questions about cybersecurity topics

For detailed MCP documentation, see `backend/src/config/MCP_DOCUMENTATION.md`

## Project Structure

```
SecTube/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js              # MongoDB connection setup
│   │   │   ├── env.js                   # Dotenv loader (must import first in server.js)
│   │   │   ├── redis.js                 # ioredis client with graceful degradation
│   │   │   ├── passport.js              # Passport.js SSO configuration
│   │   │   ├── mcp.js                   # MCP configuration & Swagger tool generation
│   │   │   ├── swagger.js               # Swagger/OpenAPI documentation
│   │   │   ├── MCP_DOCUMENTATION.md     # Comprehensive MCP guide for AI agents
│   │   │   └── MCP_QUICK_REFERENCE.md   # Quick MCP reference
│   │   ├── controllers/
│   │   │   ├── auth.js                  # Auth logic (login, register, 2FA, SSO)
│   │   │   ├── chat.js                  # AI chat controller with MCP
│   │   │   ├── users.js                 # User management & subscriptions
│   │   │   ├── videos.js                # Video CRUD, caching & view buffering
│   │   │   └── channels.js              # Channel management & discovery
│   │   ├── middleware/
│   │   │   ├── auth.js                  # JWT authentication & role checking
│   │   │   ├── cache.js                 # Redis response cache middleware
│   │   │   ├── errorHandler.js          # Centralized error handling
│   │   │   ├── upload.js                # Multer video upload (max 5GB)
│   │   │   └── avatarUpload.js          # Multer avatar upload
│   │   ├── models/
│   │   │   ├── User.js                  # User schema with 2FA & roles
│   │   │   ├── Video.js                 # Video schema with processing status
│   │   │   └── Comment.js               # Comment schema with nested replies
│   │   ├── routes/
│   │   │   ├── auth.js                  # Auth routes (includes GitHub/Google OAuth)
│   │   │   ├── chat.js                  # AI chat routes
│   │   │   ├── users.js                 # User routes (profile, history, saved)
│   │   │   ├── videos.js                # Video routes (upload, search, comments)
│   │   │   └── channels.js              # Channel routes (featured, by username)
│   │   ├── services/
│   │   │   ├── email.js                 # Email service (verification, password reset)
│   │   │   └── ai/
│   │   │       ├── index.js             # AI services hub
│   │   │       ├── chat.service.js      # Chat service with OpenRouter
│   │   │       ├── tools/
│   │   │       │   └── toolExecutor.js  # MCP tool execution engine
│   │   │       ├── utils/
│   │   │       │   └── sanitizer.js     # Data sanitization for AI
│   │   │       └── README.md            # AI services documentation
│   │   ├── utils/
│   │   │   ├── videoProcessor.js        # FFmpeg video transcoding pipeline
│   │   │   └── viewBuffer.js            # Redis view dedup & buffered flush to MongoDB
│   │   └── server.js                    # Express app entry point & middleware setup
│   ├── uploads/                          # Temporary upload directory
│   ├── videos/                           # Processed video files (360p-1080p)
│   ├── thumbnails/                       # Video thumbnails (auto-generated)
│   ├── avatars/                          # User avatar images
│   ├── .env.example                      # Environment variables template
│   └── package.json                      # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation bar with responsive search
│   │   │   ├── Chatbot.jsx              # AI chatbot component
│   │   │   ├── VideoCard.jsx            # Video thumbnail card
│   │   │   ├── VideoCardSkeleton.jsx    # Video card loading skeleton with shimmer
│   │   │   ├── VideoPlayer.jsx          # Video.js player with quality selection
│   │   │   ├── LoadingSpinner.jsx       # Reusable loading spinner (full-screen/inline)
│   │   │   ├── CommentItem.jsx          # Comment component with replies
│   │   │   ├── EmojiPicker.jsx          # Emoji picker for comments
│   │   │   ├── CustomSelect.jsx         # Custom dropdown select component
│   │   │   ├── Button.jsx               # Reusable button component
│   │   │   ├── Input.jsx                # Reusable input component
│   │   │   ├── Textarea.jsx             # Reusable textarea component
│   │   │   ├── ConfirmDialog.jsx        # Confirmation dialogs
│   │   │   └── ProtectedRoute.jsx       # Route guard for auth
│   │   ├── pages/
│   │   │   ├── Home.jsx                 # Home page with featured videos
│   │   │   ├── Browse.jsx               # Browse with filters and pagination
│   │   │   ├── Search.jsx               # Search results page
│   │   │   ├── Video.jsx                # Video player page with comments
│   │   │   ├── Channel.jsx              # Channel profile page
│   │   │   ├── Upload.jsx               # Video upload page (streamers)
│   │   │   ├── Settings.jsx             # User settings with collapsible nav
│   │   │   ├── History.jsx              # Watch history page
│   │   │   ├── Saved.jsx                # Saved/bookmarked videos
│   │   │   ├── Subscriptions.jsx        # Subscription feed
│   │   │   ├── Login.jsx                # Login with 2FA support
│   │   │   ├── Register.jsx             # Registration page
│   │   │   ├── ForgotPassword.jsx       # Password recovery
│   │   │   ├── VerifyEmail.jsx          # Email verification
│   │   │   ├── Terms.jsx                # Terms of service
│   │   │   ├── Privacy.jsx              # Privacy policy
│   │   │   ├── Admin.jsx                # Admin dashboard
│   │   │   └── Analytics.jsx            # Analytics page (streamers)
│   │   ├── services/
│   │   │   └── api.js                   # Axios API client with interceptors
│   │   ├── store/
│   │   │   ├── authStore.js             # Auth state (Zustand + localStorage)
│   │   │   ├── toastStore.js            # Toast notifications
│   │   │   └── sidebarStore.js          # Sidebar state
│   │   ├── hooks/
│   │   │   └── useDropdownPosition.js   # Dropdown positioning hook
│   │   ├── utils/
│   │   │   └── sanitize.js              # XSS prevention utility
│   │   ├── config/
│   │   │   └── constants.js             # App constants and API URLs
│   │   ├── App.jsx                      # Main app component with routing
│   │   ├── main.jsx                     # React entry point
│   │   └── index.css                    # Global styles + shimmer animation
│   ├── public/
│   │   └── logo.png                     # App logo for PWA
│   ├── index.html                       # HTML with PWA meta tags & initial loader
│   ├── vite.config.js                   # Vite config with PWA plugin
│   ├── tailwind.config.js               # TailwindCSS configuration
│   └── package.json                     # Dependencies (includes vite-plugin-pwa)
├── .gitignore                           # Git ignore rules
├── package.json                         # Root workspace configuration
├── README.md                            # This file - project documentation
├── CLAUDE.md                            # Claude Code AI assistant instructions
└── DEPLOYMENT.md                        # Deployment guide (Vercel, Render, MongoDB Atlas)
```

## Categories

The platform supports the following cybersecurity categories:
- Web Application Security
- Network Security
- Bug Bounty
- Penetration Testing
- Malware Analysis
- Reverse Engineering
- Mobile Security
- Cloud Security
- CTF Writeup
- OSINT
- Cryptography
- IoT Security
- Security Tools
- Tutorial

## Difficulty Levels
- Beginner
- Intermediate
- Advanced
- Expert

## Troubleshooting

### AI Chatbot Issues

#### AI outputs raw tool calls as text instead of executing them
**Problem**: The chatbot shows `<tool_call> <function=...>` instead of actually calling functions.

**Solution**: Your selected model doesn't support function calling. Update `CHAT_MODEL` in `backend/.env` to a compatible model:
```env
# Recommended free models with function calling support
CHAT_MODEL=google/gemini-flash-1.5:free
# or
CHAT_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

Restart the backend after changing the model.

#### AI chatbot not responding
1. Check that `OPENROUTER_API_KEY` is set in `backend/.env`
2. Verify backend server is running (`npm run dev` in backend directory)
3. Check browser console for errors
4. Ensure you have credits/quota on your OpenRouter account

#### "AI chat is currently unavailable" error
- The `OPENROUTER_API_KEY` environment variable is missing or invalid
- Add your API key from [openrouter.ai/keys](https://openrouter.ai/keys) to `backend/.env`

### Redis Issues

#### "REDIS_URL not set — caching and view buffering disabled"
Redis is optional. The app works without it. To enable:
1. **Local**: Install Redis and set `REDIS_URL=redis://localhost:6379` in `backend/.env`
2. **Cloud (free)**: Create a free database at [upstash.com](https://upstash.com) and use the `rediss://` connection string

#### Redis connected but caching not working
Ensure `REDIS_URL` is set **before** the server starts. The `.env` file must be loaded before any other module reads `process.env`. The `config/env.js` import at the top of `server.js` handles this — do not move it.

### Common Issues

#### FFmpeg Not Found
If video processing fails with FFmpeg errors:
1. Verify FFmpeg installation: `ffmpeg -version`
2. Update `FFMPEG_PATH` and `FFPROBE_PATH` in `backend/.env` to absolute paths
3. On Windows, use forward slashes or escaped backslashes in paths

#### MongoDB Connection
- Ensure MongoDB is running before starting backend
- Default connection: `mongodb://localhost:27017/sectube`
- Check connection status in backend startup logs

#### CORS Issues
- Ensure `FRONTEND_URL` in `backend/.env` matches your frontend dev server URL
- Default is `http://localhost:5173`

#### Video Upload Timeouts
- Large video files may timeout with default settings
- Increase `MAX_FILE_SIZE` in backend .env
- Check available disk space in `backend/uploads/` and `backend/videos/`

## Deployment

For detailed deployment instructions for free hosting, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deployment Summary

**Free Tier Options:**
- **Frontend**: Vercel (recommended) or Netlify
- **Backend**: Render or Railway
- **Database**: MongoDB Atlas (512MB free)
- **File Storage**: Cloudinary (25GB free)

See the full deployment guide for step-by-step instructions.

## AI Assistant & MCP Integration

SecTube features an intelligent AI chatbot powered by MCP (Model Context Protocol) that can help users navigate the platform, discover videos, and perform actions naturally.

### Features

- **Natural Language Interaction**: Ask questions in plain English
- **Platform Navigation**: Say "take me to settings" or "go to browse" — AI calls the `navigate_to` tool and the app redirects automatically
- **UI-First How-To Answers**: Questions like "how do I upload a video?" get step-by-step UI instructions, not API documentation
- **API Tool Calling**: AI automatically uses the right API endpoints via MCP for data actions
- **Authenticated Actions**: Inherits user permissions to like videos, subscribe to channels, update profile, etc.
- **Markdown Rendering**: Rich text responses with code syntax highlighting
- **Persistent History**: Chat conversations saved in localStorage across sessions
- **Security First**: Automatic sanitization of sensitive data (passwords, tokens, API keys)
- **Multi-Model Support**: Compatible with various LLMs via OpenRouter API

### How It Works

1. **Swagger → MCP Tools**: API endpoints are automatically converted to MCP tools
2. **`navigate_to` Tool**: A special client-side tool (no API call) that signals the frontend to redirect to a platform page
3. **AI Model Selection**: Configure any OpenRouter-compatible model
4. **Tool Execution**: AI calls tools with user's JWT token for authenticated actions
5. **Data Sanitization**: Sensitive fields filtered before sending to AI
6. **Response Rendering**: Markdown-formatted responses displayed in chat UI

### Example Queries

- "Take me to my settings"
- "Go to the browse page"
- "Find me videos about SQL injection for beginners"
- "Subscribe to the top bug bounty channels"
- "What videos have I watched recently?"
- "Update my bio to: Cybersecurity enthusiast"
- "Show me my saved videos"
- "Like this video and subscribe to the channel"

### Documentation

- **Comprehensive Guide**: `backend/src/config/MCP_DOCUMENTATION.md`
- **Quick Reference**: `backend/src/config/MCP_QUICK_REFERENCE.md`
- **Architecture**: `backend/src/services/ai/README.md`
- **API Docs**: Available at `/api-docs` when running backend in development mode

### Configuration

The AI chatbot is optional and requires:
1. OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai/keys))
2. Model selection in `.env` file

Recommended free models:
- `google/gemini-flash-1.5:free` - Fast, good function calling
- `meta-llama/llama-3.1-8b-instruct:free` - Open source, reliable
- `anthropic/claude-3.5-sonnet` - Best quality (paid)

## Future Enhancements

### Next Up (High Priority)
- **Dark/Light Theme Toggle**: User preference for theme selection
- **Video Playlists**: Create and manage custom video collections
- **Advanced Notifications**: Real-time notifications for subscriptions and interactions
- **Enhanced Analytics**: Streamer dashboard with detailed insights and charts
- **Video Chapters**: Timestamped sections for easier navigation
- **Keyboard Shortcuts**: Power-user features for faster navigation
- **Enhanced PWA Icons**: Custom icon set from PWABuilder integration
- **Comment Reactions**: Emoji reactions on comments and replies
- **Profile Customization**: Banner images, custom themes for channels

### Planned Features
- **Live Streaming**: RTMP/WebRTC support for real-time broadcasts
- **Live Chat**: Real-time chat during live streams
- **Smart Recommendations**: AI-powered video suggestions based on viewing history
- **Video Content Analysis**: Automatic tagging and categorization using AI
- **Multi-language Support**: i18n for global accessibility
- **Mobile Apps**: React Native apps for iOS and Android
- **CDN Integration**: Global delivery with Cloudflare or AWS CloudFront
- **Achievements System**: Badges and rewards for user engagement
- **Private Messaging**: Direct messaging between users
- **Collaborative Playlists**: Shared playlists with friends

### Infrastructure Improvements
- **Elasticsearch**: Advanced full-text search capabilities
- **Cloud Storage**: AWS S3 or Cloudflare R2 for scalable video storage
- **WebSocket**: Real-time features (live chat, notifications)
- **Docker**: Containerization for easier deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Automated Testing**: Jest (unit), Cypress (e2e), Playwright (integration)
- **Monitoring**: Sentry for error tracking, Analytics for user insights

### Recently Completed
- **Redis Caching**: Video list responses cached (30s TTL), view dedup via Redis SET NX, buffered view writes flushed every 30s — graceful degradation if Redis is unavailable
- **AI Platform Navigation**: `navigate_to` MCP tool lets the AI redirect users to any page on the platform
- **AI UI-First Responses**: Chatbot answers how-to questions with UI steps, not API documentation
- **Progressive Web App (PWA)**: Installable on mobile/desktop with offline support
- **Unified Loading UI**: Shimmer animations and optimized skeleton loaders
- **Mobile Responsiveness**: Touch-friendly interfaces across all pages
- **AI Chatbot**: MCP integration with OpenRouter
- **Swagger/OpenAPI**: Comprehensive API documentation
- **Authenticated AI Actions**: JWT-based user actions via AI
- **Persistent Chat History**: Cross-session storage
- **Enhanced Mobile UX**: Collapsible navigation, responsive search, optimized buttons

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Considerations

This platform is designed for **educational purposes** and **authorized security research**. When using this platform:

- Only upload content related to ethical hacking and authorized security testing
- Respect responsible disclosure practices
- Do not share exploits for active vulnerabilities without proper coordination
- Follow all applicable laws and regulations
- Obtain proper authorization before conducting security testing

## License

All Rights Reserved. No part of this project may be copied or used without prior written permission.

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Acknowledgments

- Built with modern web technologies
- Inspired by the cybersecurity community
- Special thanks to all contributors and security researchers

---

**Happy Learning and Stay Secure!**
