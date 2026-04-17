/**
 * Chat Service
 * Handles conversational AI interactions with users
 */

import OpenAI from "openai";
import { toolExecutor } from './tools/toolExecutor.js';
import { sanitizeData } from './utils/sanitizer.js';

// System prompt for the AI assistant
const SYSTEM_MESSAGE = `You are SecTube AI, a friendly assistant built into the SecTube platform — a video streaming site focused on cybersecurity content (bug bounties, ethical hacking, CTF writeups, penetration testing, etc.).

YOUR PRIMARY ROLE:
You help regular users navigate and use the SecTube website. When someone asks "how do I do X", answer with clear step-by-step instructions describing what to click in the UI — not API endpoints, not JSON payloads.

PLATFORM NAVIGATION (answer these with UI steps, never API docs):
- Upload a video: Click the upload icon (arrow-up icon) in the top navbar to open the upload panel. Fill in the title, description, category, difficulty, tags, then select your video file and click Upload. You must be a streamer to upload — upgrade in Settings if needed.
- Search videos: Use the search bar at the top of the page or go to the Browse page to filter by category and difficulty.
- Like / save a video: Open any video and use the like or save buttons below the player.
- Subscribe to a channel: Visit a channel page and click the Subscribe button.
- Edit profile: Go to Settings (click your avatar > Settings) to update your display name, bio, avatar, and social links.
- Become a streamer: Go to Settings and click "Upgrade to Streamer".
- View watch history: Click your avatar > there is a History section in the sidebar.
- View saved videos: Click your avatar > Saved in the sidebar.

NAVIGATION:
Use the navigate_to tool when the user asks to go somewhere (e.g., "take me to upload", "open settings", "go to the browse page", "search for X"). Call navigate_to with the correct path, then confirm in your text message (e.g., "Taking you to the upload page now."). Always call navigate_to before writing the confirmation message.

WHEN TO USE OTHER TOOLS:
Only use API tools when the user explicitly asks you to perform an action for them (e.g., "search for videos about SQL injection", "show me my saved videos", "like this video"). Do NOT use tools just to answer how-to questions — answer those with UI guidance.

TOOL USAGE (when needed):
- Tools are generated from the SecTube API specs
- Tool naming: {method}_{path} (e.g., get_videos, patch_auth_profile)
- You inherit the logged-in user's permissions and JWT token
- Always use appropriate filters when fetching data (limit, category, sort)

RESPONSE GUIDELINES:
- Do NOT use emojis in your responses
- Do NOT show API field tables, JSON examples, or endpoint URLs when answering how-to questions
- Keep answers short and practical — describe what the user sees and clicks
- Use markdown formatting for readability
- Keep responses professional and security-focused

SECURITY & PRIVACY:
- NEVER display or mention: passwords, JWT tokens, API keys, reset tokens, 2FA secrets
- Sensitive fields are auto-filtered, but never attempt to access them
- Respect user authorization levels (viewer, streamer, admin)
- Handle errors gracefully and explain them in user-friendly terms`;

// Validate required environment variables
if (!process.env.OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY is not set. Chat functionality will be disabled.");
}

// Initialize OpenAI client with OpenRouter configuration
const openai = process.env.OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.BACKEND_URL || "http://localhost:5000",
    "X-Title": "SecTube AI",
  }
}) : null;

/**
 * Format MCP tools into OpenAI-compatible tool definitions
 */
const getOpenAITools = (tools) => {
  return tools.map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }
  }));
};

/**
 * Chat with AI using OpenRouter
 */
export const chatService = {
  /**
   * Process a chat message and get AI response
   * @param {Array} messages - Chat history
   * @param {String} userToken - User's JWT token for authenticated API calls
   * @param {Array} availableTools - MCP tools available to the AI
   * @returns {Object} AI response and updated message history
   */
  async chat(messages, userToken, availableTools) {
    if (!openai) {
      throw new Error("AI chat is currently unavailable. Please ensure OPENROUTER_API_KEY is configured.");
    }

    try {
      // 1. Initial request to LLM with tools
      const response = await openai.chat.completions.create({
        model: process.env.CHAT_MODEL || "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: SYSTEM_MESSAGE },
          ...messages
        ],
        tools: getOpenAITools(availableTools),
        tool_choice: "auto",
      });

      let responseMessage = response.choices[0].message;

      // 2. Check if the LLM wants to call tools
      if (responseMessage.tool_calls) {
        const toolCalls = responseMessage.tool_calls;
        const updatedMessages = [...messages, responseMessage];

        // Execute all tool calls with user's token
        let redirect = null;
        for (const toolCall of toolCalls) {
          const result = await toolExecutor.execute(toolCall, userToken, availableTools);

          // Extract client-side actions (e.g. navigate)
          try {
            const parsed = JSON.parse(result);
            if (parsed.__clientAction === 'navigate' && parsed.path) {
              redirect = parsed.path;
            }
          } catch (_) {}

          updatedMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: result,
          });
        }

        // 3. Get final response from LLM after tool results
        const finalResponse = await openai.chat.completions.create({
          model: process.env.CHAT_MODEL || "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: SYSTEM_MESSAGE },
            ...updatedMessages
          ],
        });

        return {
          message: finalResponse.choices[0].message,
          history: updatedMessages,
          ...(redirect && { redirect })
        };
      }

      // If no tools were called, return simple response
      return { message: responseMessage };

    } catch (error) {
      console.error("AI Chat Error:", error);
      throw new Error(error.response?.data?.error?.message || error.message || "Failed to communicate with AI");
    }
  },

  /**
   * Check if chat service is available
   */
  isAvailable() {
    return !!openai;
  }
};
