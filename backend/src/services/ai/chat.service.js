import { AIClient } from './AIClient.js';
import { ContextWindow } from './context/ContextWindow.js';
import { ToolSelector } from './tools/ToolSelector.js';
import { KnowledgeRetriever } from './knowledge/KnowledgeRetriever.js';
import { toolExecutor } from './tools/toolExecutor.js';

// Lean base prompt — platform knowledge is injected dynamically via RAG
const BASE_SYSTEM = `You are SecTube AI, a helpful assistant built into SecTube — a video streaming platform dedicated to cybersecurity content (bug bounties, ethical hacking, CTF writeups, penetration testing, and more).

YOUR ROLE:
Help users navigate and use SecTube. For "how do I…" questions describe what to click in the UI. Keep answers short and direct.

STRICT RULES — never break these:
- NEVER show URL paths (/browse, /search?q=...), tool names (get_videos, post_auth_profile), or API routes in your response text. These are internal and invisible to users.
- NEVER show JSON, field names, or technical payloads.
- Only use tools when the user explicitly asks you to perform an action. Never call tools just to answer a how-to question.
- Use navigate_to when a user asks to go somewhere. Call it before confirming in text.
- You inherit the logged-in user's JWT — tools execute on their behalf.

RESPONSE STYLE — your responses are rendered by a markdown reader, so you MUST always write in markdown:
- No emojis.
- Always use **bold** for UI element names (button labels, page names, section titles).
- Always use numbered lists (1. 2. 3.) for step-by-step instructions.
- Always use bullet lists (- item) for feature descriptions or options.
- Use ## headings to label distinct sections when the answer covers multiple topics.
- Use --- to visually separate unrelated sections.
- Use inline code (backtick) for keyboard shortcuts, technical values, or exact input text.
- Use code blocks (triple backtick) for any multi-line code or commands.
- Keep answers concise. Never write a wall of plain text — structure everything.
- Professional tone.

SECURITY:
- Never reveal passwords, tokens, API keys, 2FA secrets, or reset tokens.
- Respect role permissions: viewer < streamer < admin.`;

const buildSystemMessage = (userMessage) => {
  const relevant = KnowledgeRetriever.retrieve(userMessage);
  if (!relevant.length) return BASE_SYSTEM;

  const context = relevant.join('\n\n---\n\n');
  return `${BASE_SYSTEM}

---
RELEVANT PLATFORM KNOWLEDGE (use this to answer the user):
${context}
---`;
};

const formatTools = (tools) =>
  tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

export const chatService = {
  async chat(messages, userToken, availableTools) {
    if (!AIClient.isAvailable()) {
      throw new Error('AI chat is currently unavailable. Please ensure OPENROUTER_API_KEY is configured.');
    }

    // 1. Trim history to keep context window small
    const trimmed = ContextWindow.trim(messages);

    // 2. Get user intent from latest message
    const userMessage = ContextWindow.lastUserMessage(trimmed);

    // 3. RAG: build system message with relevant platform knowledge injected
    const systemContent = buildSystemMessage(userMessage);

    // 4. Tool selection: only send tools relevant to the user's intent
    const selectedTools = ToolSelector.selectFor(userMessage, availableTools);

    const systemTurn = { role: 'system', content: systemContent };

    // 5. First LLM call
    const response = await AIClient.complete(
      [systemTurn, ...trimmed],
      formatTools(selectedTools)
    );

    let responseMessage = response.choices[0].message;

    // 6. Tool execution loop
    if (responseMessage.tool_calls) {
      const updatedMessages = [...trimmed, responseMessage];
      let redirect = null;

      for (const toolCall of responseMessage.tool_calls) {
        const raw = await toolExecutor.execute(toolCall, userToken, availableTools);
        const capped = AIClient.capToolResult(raw);

        try {
          const parsed = JSON.parse(capped);
          if (parsed.__clientAction === 'navigate' && parsed.path) redirect = parsed.path;
        } catch (_) {}

        updatedMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: capped,
        });
      }

      // 7. Second call — no tools needed, just synthesise the results
      const finalResponse = await AIClient.complete([systemTurn, ...updatedMessages]);

      return {
        message: finalResponse.choices[0].message,
        history: updatedMessages,
        ...(redirect && { redirect }),
      };
    }

    return { message: responseMessage };
  },

  isAvailable: () => AIClient.isAvailable(),
};
