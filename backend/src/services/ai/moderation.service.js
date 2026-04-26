import { AIClient } from './AIClient.js';

// Extract JSON object from LLM response (model may wrap it in extra text)
const parseJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

const COMMENT_PROMPT = `You are a content moderator for SecTube, a cybersecurity education platform.
Security research, ethical hacking, exploit analysis, malware discussion, CTF writeups, and penetration testing are ALLOWED and expected — do not flag these.

Reject ONLY clear cases of:
- Spam (ads, gibberish, unsolicited promotion, repeated text)
- Personal attacks or harassment targeting a specific person
- Doxxing (sharing private personal information)
- Malicious URLs designed to harm users

Flag (allow but mark for review):
- Mildly aggressive or borderline off-topic content

Respond with valid JSON only, no extra text:
{"action":"approved","reason":null}
{"action":"flagged","reason":"brief reason"}
{"action":"rejected","reason":"brief reason"}`;

const VIDEO_PROMPT = `You are a content reviewer for SecTube, a cybersecurity education platform.
Ethical hacking, penetration testing, malware analysis, CTF writeups, vulnerability research, and security tools are ALLOWED.

Mark non-compliant ONLY for clear cases of:
- Content targeting specific real individuals maliciously (not as examples)
- Scam or fraudulent content with no educational purpose
- Content completely unrelated to cybersecurity

Respond with valid JSON only, no extra text:
{"compliant":true,"reason":null}
{"compliant":false,"reason":"brief reason"}`;

const REPORT_PROMPT = `You are reviewing user abuse reports for SecTube, a cybersecurity platform.
Classify the report and respond with valid JSON only, no extra text:
{"legitimate":true|false,"priority":"low"|"medium"|"high","category":"spam"|"harassment"|"illegal"|"misinformation"|"other","summary":"one sentence"}`;

export const moderationService = {
  async moderateComment(commentText) {
    if (!AIClient.isAvailable()) return { action: 'approved', reason: null };

    try {
      const response = await AIClient.complete([
        { role: 'system', content: COMMENT_PROMPT },
        { role: 'user', content: commentText },
      ]);

      const result = parseJSON(response.choices[0]?.message?.content || '');
      if (!result || !['approved', 'flagged', 'rejected'].includes(result.action)) {
        return { action: 'approved', reason: null };
      }
      return { action: result.action, reason: result.reason || null };
    } catch {
      return { action: 'approved', reason: null }; // never block on AI failure
    }
  },

  async checkVideoCompliance({ title = '', description = '', category = '' }) {
    if (!AIClient.isAvailable()) return { compliant: true, reason: null };

    try {
      const response = await AIClient.complete([
        { role: 'system', content: VIDEO_PROMPT },
        { role: 'user', content: `Title: ${title}\nCategory: ${category}\nDescription: ${description.slice(0, 600)}` },
      ]);

      const result = parseJSON(response.choices[0]?.message?.content || '');
      if (!result || typeof result.compliant !== 'boolean') {
        return { compliant: true, reason: null };
      }
      return { compliant: result.compliant, reason: result.reason || null };
    } catch {
      return { compliant: true, reason: null };
    }
  },

  async analyzeReport(reportText, contentType = 'content') {
    if (!AIClient.isAvailable()) return { legitimate: true, priority: 'low', category: 'other', summary: reportText };

    try {
      const response = await AIClient.complete([
        { role: 'system', content: REPORT_PROMPT },
        { role: 'user', content: `Report about ${contentType}: ${reportText}` },
      ]);

      const result = parseJSON(response.choices[0]?.message?.content || '');
      return result || { legitimate: true, priority: 'low', category: 'other', summary: reportText };
    } catch {
      return { legitimate: true, priority: 'low', category: 'other', summary: reportText };
    }
  },
};
