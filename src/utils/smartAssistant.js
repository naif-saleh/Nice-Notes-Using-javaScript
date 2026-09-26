// Smart Assistant & AI Text Processing for Nice Notes Pro

// Calculate text statistics
export function calculateTextStats(text = '') {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const sentences = clean ? clean.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    chars,
    charsNoSpaces,
    sentences,
    readingTime: `${readingTimeMinutes} min read`
  };
}

// Built-in Smart Summarizer (Extracts most salient points)
export function smartSummarizeOffline(text = '') {
  if (!text || text.trim().length < 20) {
    return 'Note is too short to generate a summary. Add more details first.';
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 15);

  if (sentences.length <= 2) {
    return `Summary:\n• ${sentences.join('\n• ')}`;
  }

  // Score sentences based on position, length, and presence of key action/summary words
  const keyWords = ['key', 'important', 'objective', 'goal', 'result', 'note', 'plan', 'must', 'next', 'critical', 'feature', 'summary'];
  const scored = sentences.map((sentence, idx) => {
    let score = 0;
    // Beginning and ending sentences have higher weight
    if (idx === 0) score += 3;
    if (idx === sentences.length - 1) score += 1.5;

    const lower = sentence.toLowerCase();
    keyWords.forEach(kw => {
      if (lower.includes(kw)) score += 2;
    });

    // Moderate length preference
    if (sentence.length > 30 && sentence.length < 150) score += 1;

    return { sentence, score, idx };
  });

  scored.sort((a, b) => b.score - a.score);
  const topSentences = scored.slice(0, Math.min(3, scored.length));
  // Re-sort in original chronological order for coherent flow
  topSentences.sort((a, b) => a.idx - b.idx);

  return `✨ Executive Summary:\n` + topSentences.map(s => `• ${s.sentence.replace(/^[-*•]\s*/, '')}`).join('\n');
}

// Smart Action Items / Task Extractor
export function extractActionItemsOffline(text = '') {
  if (!text) return [];

  const taskRegex = /^(?:TODO:?|FIX:?|MUST|SHOULD|NEED TO|PLEASE|REMEMBER TO|ACTION:?)\s*(.+)/i;
  const imperativeVerbs = [
    'add', 'build', 'create', 'update', 'delete', 'review', 'check', 'fix',
    'send', 'email', 'call', 'write', 'finish', 'complete', 'test', 'deploy',
    'prepare', 'schedule', 'organize', 'buy', 'purchase', 'submit', 'verify',
    'implement', 'design', 'refactor', 'clean', 'research', 'read'
  ];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const foundTasks = [];
  const seen = new Set();

  lines.forEach(line => {
    // Strip bullet markers
    const cleanedLine = line.replace(/^[-*•\d.)\]\s]+/, '').trim();
    if (!cleanedLine) return;

    let taskText = null;

    // Check explicit task prefix
    const match = cleanedLine.match(taskRegex);
    if (match) {
      taskText = match[1].trim();
    } else {
      // Check if starts with imperative verb
      const firstWord = cleanedLine.split(/\s+/)[0]?.toLowerCase();
      if (imperativeVerbs.includes(firstWord) && cleanedLine.split(/\s+/).length >= 2) {
        taskText = cleanedLine;
      }
    }

    if (taskText && !seen.has(taskText.toLowerCase())) {
      seen.add(taskText.toLowerCase());
      foundTasks.push({
        id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: taskText.charAt(0).toUpperCase() + taskText.slice(1),
        completed: false
      });
    }
  });

  return foundTasks;
}

// Smart Tone Rewriter / Polisher
export function rephraseToneOffline(text = '', tone = 'professional') {
  if (!text || text.trim().length === 0) return '';

  const clean = text.trim();

  switch (tone) {
    case 'professional': {
      // Capitalize sentences, refine informal greetings/fillers, improve punctuation
      let result = clean
        .replace(/\b(wanna|gonna|gotta)\b/gi, match => {
          if (match.toLowerCase() === 'wanna') return 'wish to';
          if (match.toLowerCase() === 'gonna') return 'going to';
          if (match.toLowerCase() === 'gotta') return 'need to';
          return match;
        })
        .replace(/\b(asap)\b/gi, 'as soon as possible')
        .replace(/\b(btw)\b/gi, 'additionally')
        .replace(/\b(imo|imho)\b/gi, 'in my perspective');

      // Capitalize first letter of every line
      result = result.split('\n').map(l => {
        if (!l.trim()) return l;
        return l.trim().charAt(0).toUpperCase() + l.trim().slice(1);
      }).join('\n');

      return `📌 Polished Version:\n\n${result}`;
    }

    case 'concise': {
      // Strips filler sentences and compresses into direct statements
      const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
      const trimmed = lines.map(line => {
        let l = line.replace(/^(Basically|Essentially|To be honest|Actually|In my opinion|It should be noted that),?\s*/i, '');
        return l.charAt(0).toUpperCase() + l.slice(1);
      });
      return trimmed.join('\n');
    }

    case 'bulletized': {
      const sentences = clean
        .split(/(?<=[.!?])\s+|\n+/)
        .map(s => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(s => s.length > 5);

      return sentences.map(s => `• ${s.charAt(0).toUpperCase() + s.slice(1)}`).join('\n');
    }

    case 'grammar': {
      // Clean excessive spaces, double punctuation, capitalize sentences
      let fixed = clean
        .replace(/[ \t]+/g, ' ')
        .replace(/\s*([,.:;?!])\s*/g, '$1 ')
        .replace(/\s*\n\s*/g, '\n')
        .replace(/([.?!]\s+|^)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
      return fixed;
    }

    default:
      return clean;
  }
}

// Smart Auto-Tagger: Suggests tags based on semantic content
export function smartAutoTag(title = '', content = '') {
  const combined = `${title} ${content}`.toLowerCase();
  const suggestions = [];

  const categoryPatterns = {
    'Work': /\b(meeting|project|sprint|roadmap|deadline|client|presentation|team|report|kpi|budget)\b/,
    'Code': /\b(react|javascript|python|git|api|bug|deploy|css|html|frontend|backend|database|npm|docker)\b/,
    'Ideas': /\b(idea|concept|brainstorm|startup|innovation|future|vision|create|design)\b/,
    'Personal': /\b(health|workout|family|home|travel|holiday|routine|journal|habit)\b/,
    'Study': /\b(learn|book|course|lecture|exam|research|paper|notes|study|article)\b/,
    'Finance': /\b(invoice|payment|salary|cost|expense|tax|crypto|investment|revenue)\b/,
    'Urgent': /\b(urgent|asap|critical|emergency|priority|immediately)\b/,
    'To-Do': /\b(todo|task|action|checklist|follow-up|reminder)\b/
  };

  Object.entries(categoryPatterns).forEach(([tag, regex]) => {
    if (regex.test(combined)) {
      suggestions.push(tag);
    }
  });

  return suggestions.slice(0, 4);
}

// Live Gemini API Integration (optional if API key is provided)
export async function callGeminiAssistant({ apiKey, prompt, content, task = 'summarize' }) {
  if (!apiKey) {
    throw new Error('No Gemini API key provided. Using built-in smart assistant.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  let fullPrompt = '';
  switch (task) {
    case 'summarize':
      fullPrompt = `Provide a concise, professional executive summary with bullet points for this note:\n\n${content}`;
      break;
    case 'action-items':
      fullPrompt = `Extract actionable to-do list items from this note as a JSON array of strings formatted like ["task 1", "task 2"]. Output only the JSON array:\n\n${content}`;
      break;
    case 'rephrase':
      fullPrompt = `Rewrite the following note to be well-structured, clear, and professional:\n\n${content}`;
      break;
    case 'custom':
      fullPrompt = `${prompt}\n\nNote Content:\n${content}`;
      break;
    default:
      fullPrompt = `${prompt}\n\n${content}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return textOutput || 'No response generated.';
}
