import { AIClient } from './AIClient.js';

const CATEGORIES = [
  'Web Application Security', 'Network Security', 'Bug Bounty', 'Penetration Testing',
  'Malware Analysis', 'Reverse Engineering', 'Mobile Security', 'Cloud Security',
  'CTF Writeup', 'OSINT', 'Cryptography', 'IoT Security', 'Security Tools', 'Tutorial', 'Other',
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const parseJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

const META_PROMPT = `You are a cybersecurity content analyst for SecTube.
Analyze the video metadata and return a JSON object with no extra text.

Valid categories: ${CATEGORIES.join(', ')}
Valid difficulties: ${DIFFICULTIES.join(', ')}

{"summary":"1-2 sentence description","suggestedCategory":"one from the list","suggestedDifficulty":"one from the list","tags":["up to 8 relevant tags"],"toolsUsed":["security tools mentioned, empty array if none"]}`;

const TRANSCRIPT_PROMPT = `You are a cybersecurity content analyst for SecTube.
Analyze this video transcript and return a JSON object with no extra text.

Valid difficulties: ${DIFFICULTIES.join(', ')}

{"summary":"2-3 sentence summary","keyPoints":["up to 5 key takeaways"],"toolsUsed":["tools mentioned in the transcript"],"suggestedTags":["up to 8 relevant tags"],"suggestedDifficulty":"one from the list"}`;

export const contentAnalysisService = {
  /**
   * Analyze title + description to suggest category, difficulty, tags, tools, and summary.
   * Called during upload to enrich missing metadata.
   */
  async analyzeMeta({ title = '', description = '', category = '' }) {
    if (!AIClient.isAvailable()) return null;

    try {
      const response = await AIClient.complete([
        { role: 'system', content: META_PROMPT },
        { role: 'user', content: `Title: ${title}\nCategory (user-selected): ${category || 'not set'}\nDescription: ${description.slice(0, 800)}` },
      ]);

      const result = parseJSON(response.choices[0]?.message?.content || '');
      if (!result) return null;

      return {
        summary: result.summary || null,
        suggestedCategory: CATEGORIES.includes(result.suggestedCategory) ? result.suggestedCategory : null,
        suggestedDifficulty: DIFFICULTIES.includes(result.suggestedDifficulty) ? result.suggestedDifficulty : null,
        tags: Array.isArray(result.tags) ? result.tags.slice(0, 8).map(String) : [],
        toolsUsed: Array.isArray(result.toolsUsed) ? result.toolsUsed.slice(0, 10).map(String) : [],
      };
    } catch {
      return null;
    }
  },

  /**
   * Deep-analyze a video transcript (when available).
   */
  async analyzeTranscript(transcript) {
    if (!AIClient.isAvailable()) return null;
    if (!transcript || transcript.trim().length < 50) return null;

    try {
      const response = await AIClient.complete([
        { role: 'system', content: TRANSCRIPT_PROMPT },
        { role: 'user', content: transcript.slice(0, 3000) },
      ]);

      const result = parseJSON(response.choices[0]?.message?.content || '');
      if (!result) return null;

      return {
        summary: result.summary || null,
        keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints.slice(0, 5) : [],
        toolsUsed: Array.isArray(result.toolsUsed) ? result.toolsUsed.slice(0, 10).map(String) : [],
        suggestedTags: Array.isArray(result.suggestedTags) ? result.suggestedTags.slice(0, 8).map(String) : [],
        suggestedDifficulty: DIFFICULTIES.includes(result.suggestedDifficulty) ? result.suggestedDifficulty : null,
      };
    } catch {
      return null;
    }
  },

  /**
   * Generate tags from title + description only.
   */
  async generateTags({ title = '', description = '' }) {
    const result = await contentAnalysisService.analyzeMeta({ title, description });
    return result?.tags ?? [];
  },

  /**
   * Suggest difficulty from title + description.
   */
  async suggestDifficulty({ title = '', description = '' }) {
    const result = await contentAnalysisService.analyzeMeta({ title, description });
    return result?.suggestedDifficulty ?? null;
  },
};
