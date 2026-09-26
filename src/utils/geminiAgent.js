// Gemini AI Agent Engine for Nice Notes Pro

// Test the Gemini API Key connection
export async function testGeminiConnection(apiKey, model = 'gemini-1.5-flash') {
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: 'Please enter a Gemini API key before testing connection.'
    };
  }

  const cleanKey = apiKey.trim();
  const startTime = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with the single word: "CONNECTED"' }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 20,
          temperature: 0.1
        }
      })
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      return {
        success: false,
        error: errMsg,
        latency: elapsed
      };
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return {
      success: true,
      message: `Connected successfully to ${model}!`,
      reply,
      latency: elapsed,
      model
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error while attempting to connect to Gemini API.',
      latency: Date.now() - startTime
    };
  }
}

// System instructions for the Gemini Agent
const AGENT_SYSTEM_PROMPT = `You are "Gemini Note Agent", an autonomous, smart AI productivity partner embedded directly in the Nice Notes Pro workspace.

YOUR CAPABILITIES:
You can analyze user requests, understand their notes, THINK step-by-step, and EXECUTE real actions in their workspace!

WORKSPACE SCHEMA:
Each note has:
- id: string
- title: string
- content: string
- category: "work" | "personal" | "ideas" | "study" | "general"
- color: "default" | "lavender" | "sky" | "emerald" | "amber" | "rose" | "slate"
- priority: "none" | "low" | "medium" | "high"
- tags: array of strings (e.g. ["Sprint", "Design"])
- todos: array of objects { text: string, completed: boolean }
- dueDate: optional YYYY-MM-DD string

OUTPUT FORMAT:
You MUST ALWAYS format your entire response as a valid JSON object matching this schema:
{
  "thought": "Your internal step-by-step reasoning explaining what you understood, what you decided to do, and why.",
  "message": "Friendly, professional message to the user summarizing the actions taken or answering their question.",
  "actions": [
    // Array of actions to perform. Can be empty if just answering a question.
    // ACTION TYPE 1: CREATE_NOTE
    {
      "type": "CREATE_NOTE",
      "data": {
        "title": "Title of the note",
        "content": "Rich markdown body with details, lists, or explanations",
        "category": "work|personal|ideas|study|general",
        "color": "default|lavender|sky|emerald|amber|rose|slate",
        "priority": "none|low|medium|high",
        "tags": ["Tag1", "Tag2"],
        "todos": [
          { "text": "Subtask 1", "completed": false },
          { "text": "Subtask 2", "completed": false }
        ],
        "dueDate": "YYYY-MM-DD"
      }
    },
    // ACTION TYPE 2: UPDATE_NOTE
    {
      "type": "UPDATE_NOTE",
      "data": {
        "noteId": "existing-id",
        "updates": {
          "title": "optional updated title",
          "content": "optional updated content",
          "priority": "high",
          "tags": ["Tag1"],
          "todos": [{ "text": "New task", "completed": false }]
        }
      }
    },
    // ACTION TYPE 3: ADD_TODOS
    {
      "type": "ADD_TODOS",
      "data": {
        "noteId": "existing-id",
        "todos": [
          { "text": "Task description", "completed": false }
        ]
      }
    }
  ]
}

CRITICAL RULES:
1. Always return ONLY raw valid JSON (no markdown backticks around the json, or strip them if needed).
2. "thought" must show your reasoning process clearly.
3. Be proactive: if the user asks for a project plan, brainstorm, or checklist, CREATE comprehensive, well-structured notes with tags, colors, and interactive todos!
`;

// Run the Gemini Agent with workspace context
export async function runGeminiAgent({
  apiKey,
  model = 'gemini-1.5-flash',
  userInput,
  notes = [],
  currentNote = null,
  history = []
}) {
  // Offline heuristic agent fallback if no API key is provided
  if (!apiKey || !apiKey.trim()) {
    return runOfflineHeuristicAgent({ userInput, notes, currentNote });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  // Prepare a compact representation of the user's workspace notes for context
  const workspaceSummary = notes.slice(0, 15).map((n) => ({
    id: n.id,
    title: n.title,
    category: n.category,
    priority: n.priority,
    tags: n.tags,
    todosCount: n.todos ? n.todos.length : 0,
    snippet: n.content ? n.content.substring(0, 120) : ''
  }));

  const fullPrompt = `${AGENT_SYSTEM_PROMPT}

CURRENT WORKSPACE CONTEXT:
Total notes: ${notes.length}
Recent notes in workspace:
${JSON.stringify(workspaceSummary, null, 2)}

${currentNote ? `CURRENTLY OPEN NOTE IN EDITOR:\n${JSON.stringify({
  id: currentNote.id,
  title: currentNote.title,
  category: currentNote.category,
  content: currentNote.content,
  tags: currentNote.tags,
  todos: currentNote.todos
}, null, 2)}` : 'No specific note currently open.'}

USER REQUEST:
"${userInput}"

Remember: Respond strictly with the required JSON structure containing "thought", "message", and "actions".`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Strip any markdown code fences if Gemini enclosed the JSON
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(rawText);
    return {
      thought: parsed.thought || 'Analyzed request and evaluated workspace state.',
      message: parsed.message || 'Done! I processed your request.',
      actions: Array.isArray(parsed.actions) ? parsed.actions : []
    };
  } catch (err) {
    console.warn('Gemini Agent online failed, falling back to smart heuristic engine:', err);
    // Fallback to local heuristic agent
    const fallback = runOfflineHeuristicAgent({ userInput, notes, currentNote });
    fallback.message = `[Note: Gemini API returned an error (${err.message}). Using built-in Smart Agent fallback]\n\n${fallback.message}`;
    return fallback;
  }
}

// Built-in Smart Heuristic Agent (Works 100% offline without API key)
function runOfflineHeuristicAgent({ userInput, notes, currentNote }) {
  const lower = userInput.toLowerCase();

  // Scenario 1: User asks to create a note or plan
  if (lower.includes('create') || lower.includes('plan') || lower.includes('draft') || lower.includes('write')) {
    const titleMatch = userInput.match(/(?:create|draft|plan|write)(?:\s+(?:a|an))?\s+(?:note\s+(?:about|for|on)|plan\s+(?:for|about))?\s*["']?([^"'\n.?!]+)["']?/i);
    let title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'New Action Plan';
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const isSprint = lower.includes('sprint') || lower.includes('dev') || lower.includes('code');
    const isStudy = lower.includes('study') || lower.includes('learn') || lower.includes('course');
    const isMeeting = lower.includes('meeting') || lower.includes('call');

    let category = 'general';
    let color = 'sky';
    let tags = ['SmartAgent'];
    let todos = [];
    let content = '';

    if (isSprint) {
      category = 'work';
      color = 'sky';
      tags = ['Sprint', 'Dev', 'Roadmap'];
      todos = [
        { text: 'Define sprint backlog & scope', completed: true },
        { text: 'Implement core features & components', completed: false },
        { text: 'Test edge cases & error boundaries', completed: false },
        { text: 'Run production build & deploy', completed: false }
      ];
      content = `# ${title}\n\nKey sprint goals and architectural deliverables.\n\n### Milestones\n- Milestone 1: Environment verification & setup\n- Milestone 2: Feature development\n- Milestone 3: QA & Deployment`;
    } else if (isStudy) {
      category = 'study';
      color = 'lavender';
      tags = ['Study', 'Learning', 'Notes'];
      todos = [
        { text: 'Review foundational concepts & docs', completed: false },
        { text: 'Build interactive practice example', completed: false },
        { text: 'Summarize key takeaways & formulas', completed: false }
      ];
      content = `# ${title}\n\nStudy roadmap, concepts, and notes.\n\n### Core Topics\n1. Foundations\n2. Practical Implementation\n3. Summary & Review`;
    } else {
      category = 'ideas';
      color = 'amber';
      tags = ['Brainstorm', 'Ideas'];
      todos = [
        { text: 'Outline core value proposition', completed: false },
        { text: 'Identify key stakeholders & requirements', completed: false },
        { text: 'Establish next actionable milestones', completed: false }
      ];
      content = `# ${title}\n\nStructured plan generated by Smart Note Agent.\n\n### Overview\n- Objective: Deliver high quality results\n- Strategy: Iterative development & continuous validation`;
    }

    return {
      thought: `Understood that the user wants to create a new structured plan/note for "${title}". Selected category '${category}', vibrant color theme '${color}', and generated relevant interactive checklist items.`,
      message: `I created a new organized note for you: "${title}" with structured sections, category '${category}', and an actionable checklist!`,
      actions: [
        {
          type: 'CREATE_NOTE',
          data: {
            title,
            content,
            category,
            color,
            priority: 'medium',
            tags,
            todos,
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
          }
        }
      ]
    };
  }

  // Scenario 2: Summarize current or all notes
  if (lower.includes('summarize') || lower.includes('summary')) {
    if (currentNote && currentNote.content) {
      return {
        thought: `User requested a summary of the currently open note "${currentNote.title}". Extracted key highlights.`,
        message: `Here is the summary of "${currentNote.title}":\n\n• ${currentNote.content.slice(0, 200).replace(/\n/g, ' ')}...`,
        actions: []
      };
    } else {
      const titles = notes.slice(0, 5).map(n => `• ${n.title} (${n.category})`).join('\n');
      return {
        thought: `User requested a workspace summary. Compiled overview of active notes.`,
        message: `Here is a summary of your workspace:\nYou have ${notes.length} total notes. Top items:\n${titles}`,
        actions: []
      };
    }
  }

  // Scenario 3: Extract tasks or checklist
  if (lower.includes('task') || lower.includes('todo') || lower.includes('checklist')) {
    if (currentNote) {
      const generated = [
        { text: `Review requirements for ${currentNote.title || 'note'}`, completed: false },
        { text: `Execute key action items`, completed: false }
      ];
      return {
        thought: `Extracted action items for current note "${currentNote.title}".`,
        message: `I created checklist items for "${currentNote.title}" and added them to your note.`,
        actions: [
          {
            type: 'ADD_TODOS',
            data: {
              noteId: currentNote.id,
              todos: generated
            }
          }
        ]
      };
    }
  }

  // Default response
  return {
    thought: `Analyzed user inquiry: "${userInput}". Formulated helpful guidance with available agent capabilities.`,
    message: `I am your Gemini Note Agent! I can think and execute actions in your notes.\n\nTry telling me:\n• "Create a comprehensive project plan for a portfolio website"\n• "Draft meeting notes with marketing with a high priority"\n• "Create a study schedule for React and TypeScript with checklist"\n• "Extract to-dos from my note"\n\nTo enable full live Generative AI, enter and verify your free Gemini API key in Settings!`,
    actions: []
  };
}
