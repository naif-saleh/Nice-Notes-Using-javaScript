// Storage and data management for Nice Notes Pro
const STORAGE_KEY = 'nice_notes_v2_data';
const SETTINGS_KEY = 'nice_notes_settings';
const LEGACY_STORAGE_KEY = 'notes';

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light' | 'sunset' | 'midnight'
  viewMode: 'grid', // 'grid' | 'list' | 'compact'
  sortBy: 'updatedAt_desc',
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  autoSaveInterval: 1000,
  defaultColor: 'default',
  defaultCategory: 'general',
};

// Seed sample notes for a fresh delightful onboarding experience
export const SAMPLE_NOTES = [
  {
    id: 'sample-1',
    title: '🚀 Welcome to Nice Notes Pro!',
    content: `Nice Notes has been completely upgraded into a professional, smart, and feature-packed workspace.

Here is what you can do:
• 🧠 **Smart AI Assistant**: Click the sparkle icon to auto-summarize notes, extract action items, polish writing tone, or auto-tag.
• 🎙️ **Voice Dictation**: Click the mic button to speak your thoughts directly into notes.
• 🔒 **Note Lock / Vault**: Secure sensitive information with a custom PIN code.
• 🎨 **Color Themes & Accents**: Personalize each note with vibrant pastel cards and dark/light themes.
• 🚀 **1-Click Netlify Ready**: Built with React & Vite. Run 'npm run build' to deploy straight to Netlify!`,
    category: 'ideas',
    color: 'lavender',
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    isTrash: false,
    isLocked: false,
    priority: 'high',
    tags: ['Welcome', 'Productivity', 'SmartNotes'],
    todos: [
      { id: 't1', text: 'Explore the Smart AI Assistant tools', completed: false },
      { id: 't2', text: 'Create your first custom note', completed: true },
      { id: 't3', text: 'Try switching themes (Dark, Sunset, Midnight)', completed: false },
      { id: 't4', text: 'Test exporting as Markdown or JSON backup', completed: false }
    ],
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 1000 * 60 * 10,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  },
  {
    id: 'sample-2',
    title: '📋 Sprint Planning & Feature Roadmap',
    content: `Key objectives for our upcoming release:
- Finalize Netlify CI/CD pipeline and single-page routing
- Optimize client-side fuzzy search across 1,000+ notes
- Ensure 100% offline functionality with LocalStorage auto-sync
- Add rich keyboard shortcuts (Ctrl+N, Ctrl+F, Esc)`,
    category: 'work',
    color: 'sky',
    isPinned: true,
    isFavorite: false,
    isArchived: false,
    isTrash: false,
    isLocked: false,
    priority: 'medium',
    tags: ['Work', 'Sprint', 'Roadmap'],
    todos: [
      { id: 't21', text: 'Review pull requests', completed: true },
      { id: 't22', text: 'Build dist and test offline bundle', completed: false },
      { id: 't23', text: 'Verify responsive mobile layout', completed: true }
    ],
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 1,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  },
  {
    id: 'sample-3',
    title: '💡 Startup & Product Ideas',
    content: `Reflections on productivity tools in 2026:
Micro-interactions matter tremendously. Software should feel instant, joyful, and effortlessly responsive. 
Keep visual hierarchy clean, utilize glassmorphic translucency, and respect user privacy by saving everything locally first.`,
    category: 'ideas',
    color: 'amber',
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    isTrash: false,
    isLocked: false,
    priority: 'low',
    tags: ['Ideas', 'Design', 'Philosophy'],
    todos: [],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1
  }
];

// Helper to migrate legacy notes from previous version (HTML string stored in localStorage "notes")
function migrateLegacyNotes() {
  try {
    const legacyHtml = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyHtml) return [];

    // Parse temporary div
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = legacyHtml;
    const elements = tempDiv.querySelectorAll('.inbox-text, p');
    const migrated = [];

    elements.forEach((el, index) => {
      // Remove any images like delete.png from content
      const imgs = el.querySelectorAll('img');
      imgs.forEach(img => img.remove());
      const rawText = el.innerText?.trim();
      if (rawText) {
        const lines = rawText.split('\n').filter(Boolean);
        const title = lines[0] ? lines[0].slice(0, 50) : `Migrated Note ${index + 1}`;
        const content = lines.slice(1).join('\n') || lines[0] || '';

        migrated.push({
          id: `migrated-${Date.now()}-${index}`,
          title: title,
          content: content,
          category: 'general',
          color: 'default',
          isPinned: false,
          isFavorite: false,
          isArchived: false,
          isTrash: false,
          isLocked: false,
          priority: 'none',
          tags: ['Migrated'],
          todos: [],
          createdAt: Date.now() - (index * 60000),
          updatedAt: Date.now() - (index * 60000)
        });
      }
    });

    if (migrated.length > 0) {
      console.log(`Successfully migrated ${migrated.length} legacy notes.`);
    }
    return migrated;
  } catch (err) {
    console.error('Failed to parse legacy notes:', err);
    return [];
  }
}

// Load all notes from storage
export function loadNotesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Check for legacy notes
    const legacyMigrated = migrateLegacyNotes();
    if (legacyMigrated.length > 0) {
      const combined = [...SAMPLE_NOTES, ...legacyMigrated];
      saveNotesToStorage(combined);
      return combined;
    }

    // First time user: save sample notes
    saveNotesToStorage(SAMPLE_NOTES);
    return SAMPLE_NOTES;
  } catch (err) {
    console.error('Error loading notes:', err);
    return SAMPLE_NOTES;
  }
}

// Save notes to storage
export function saveNotesToStorage(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to localStorage:', err);
  }
}

// Load settings
export function loadSettingsFromStorage() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
}

// Save settings
export function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
