import { chunks } from './chunks.js';

const TOP_K = 3;

// Tokenise a string into lowercase words, stripping punctuation
const tokenise = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

// Score a chunk against query tokens using keyword overlap + partial match
const score = (chunk, queryTokens) => {
  const kwTokens = chunk.keywords.flatMap(tokenise);
  const textTokens = tokenise(chunk.text);
  const allTokens = new Set([...kwTokens, ...textTokens]);

  let hits = 0;
  for (const qt of queryTokens) {
    for (const ct of allTokens) {
      if (ct === qt || ct.includes(qt) || qt.includes(ct)) {
        // Keyword matches worth more than body matches
        hits += kwTokens.includes(ct) ? 2 : 1;
        break;
      }
    }
  }
  return hits;
};

export const KnowledgeRetriever = {
  retrieve(userMessage, k = TOP_K) {
    const queryTokens = tokenise(userMessage);
    if (!queryTokens.length) return [];

    const scored = chunks
      .map(chunk => ({ chunk, score: score(chunk, queryTokens) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return scored.map(({ chunk }) => chunk.text);
  },
};
