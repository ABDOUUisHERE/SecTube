const DEFAULT_MAX = 12;

// Tool result messages must travel with their paired assistant message that
// triggered the call — slicing mid-pair confuses the LLM. This helper always
// keeps pairs intact.
const trimToPairs = (messages, max) => {
  if (messages.length <= max) return messages;

  const sliced = messages.slice(-max);

  // If the first message in the window is a tool result, drop it (orphaned)
  // until we land on a user or assistant message.
  let start = 0;
  while (start < sliced.length && sliced[start].role === 'tool') start++;

  return sliced.slice(start);
};

export const ContextWindow = {
  trim(messages, max = DEFAULT_MAX) {
    return trimToPairs(messages, max);
  },

  lastUserMessage(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i].content ?? '';
    }
    return '';
  },
};
