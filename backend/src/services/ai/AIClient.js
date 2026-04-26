import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY is not set. Chat functionality will be disabled.');
}

const client = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.BACKEND_URL || 'http://localhost:5000',
        'X-Title': 'SecTube AI',
      },
    })
  : null;

const MODEL = () => process.env.CHAT_MODEL || 'anthropic/claude-3.5-sonnet';
const MAX_TOOL_RESULT_CHARS = 1500;

export const AIClient = {
  isAvailable: () => !!client,

  async complete(messages, tools) {
    if (!client) throw new Error('AI client not configured. Ensure OPENROUTER_API_KEY is set.');
    return client.chat.completions.create({
      model: MODEL(),
      messages,
      ...(tools?.length && { tools, tool_choice: 'auto' }),
    });
  },

  // Prevent large tool responses from consuming the context window
  capToolResult(result) {
    if (typeof result === 'string' && result.length > MAX_TOOL_RESULT_CHARS) {
      return result.slice(0, MAX_TOOL_RESULT_CHARS) + '\n... [response truncated to save context]';
    }
    return result;
  },
};
