import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import NoteCard from './components/NoteCard';
import NoteEditorModal from './components/NoteEditorModal';
import SmartAIToolsModal from './components/SmartAIToolsModal';
import LockModal from './components/LockModal';
import SettingsModal from './components/SettingsModal';
import GeminiAgentPanel from './components/GeminiAgentPanel';
import ToastContainer from './components/ToastContainer';
import {
  loadNotesFromStorage,
  saveNotesToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  SAMPLE_NOTES
} from './utils/storage';
import { Plus, Sparkles, Inbox } from 'lucide-react';
import './App.css';

export default function App() {
  // Main state
  const [notes, setNotes] = useState(() => loadNotesFromStorage());
  const [settings, setSettings] = useState(() => loadSettingsFromStorage());
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const [viewMode, setViewMode] = useState('grid');

  // Modals & Active Targets
  const [editingNote, setEditingNote] = useState(null);
  const [aiTargetNote, setAiTargetNote] = useState(null);
  const [lockTargetNote, setLockTargetNote] = useState(null);
  const [lockMode, setLockMode] = useState('unlock'); // 'unlock' | 'set'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeminiAgentOpen, setIsGeminiAgentOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme attribute to <html> tag
  useEffect(() => {
    const currentTheme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    saveSettingsToStorage(settings);
  }, [settings]);

  // Persist notes
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewNote();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'Escape') {
        if (editingNote) setEditingNote(null);
        if (aiTargetNote) setAiTargetNote(null);
        if (lockTargetNote) setLockTargetNote(null);
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isGeminiAgentOpen) setIsGeminiAgentOpen(false);
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNote, aiTargetNote, lockTargetNote, isSettingsOpen, isGeminiAgentOpen, isMobileSidebarOpen]);

  // Handler: Create Note
  const handleCreateNewNote = () => {
    let initialCategory = 'general';
    if (activeFilter.startsWith('cat-')) {
      initialCategory = activeFilter.replace('cat-', '');
    }

    const newNote = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      category: initialCategory,
      color: settings.defaultColor || 'default',
      isPinned: activeFilter === 'pinned',
      isFavorite: activeFilter === 'favorites',
      isArchived: false,
      isTrash: false,
      isLocked: false,
      priority: 'none',
      tags: [],
      todos: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setEditingNote(newNote);
  };

  // Handler: Save Note
  const handleSaveNote = (noteToSave) => {
    setNotes((prevNotes) => {
      const exists = prevNotes.some((n) => n.id === noteToSave.id);
      if (exists) {
        return prevNotes.map((n) => (n.id === noteToSave.id ? noteToSave : n));
      } else {
        return [noteToSave, ...prevNotes];
      }
    });
    addToast('Note saved!', 'success');
  };

  // Handler: Execute Gemini Agent Autonomous Actions
  const handleExecuteAgentActions = (actions) => {
    if (!Array.isArray(actions) || actions.length === 0) return;

    actions.forEach((act) => {
      if (act.type === 'CREATE_NOTE' && act.data) {
        const createdNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: act.data.title || 'Untitled Note',
          content: act.data.content || '',
          category: act.data.category || 'ideas',
          color: act.data.color || 'sky',
          priority: act.data.priority || 'medium',
          tags: act.data.tags || ['AgentCreated'],
          todos: (act.data.todos || []).map((t, idx) => ({
            id: `todo-${Date.now()}-${idx}`,
            text: typeof t === 'string' ? t : t.text || 'Task',
            completed: Boolean(t.completed)
          })),
          dueDate: act.data.dueDate || '',
          isPinned: false,
          isFavorite: false,
          isArchived: false,
          isTrash: false,
          isLocked: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        setNotes((prev) => [createdNote, ...prev]);

        // Celebration confetti for agent creation
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else if (act.type === 'UPDATE_NOTE' && act.data?.noteId) {
        setNotes((prev) =>
          prev.map((n) => {
            if (n.id === act.data.noteId) {
              return { ...n, ...(act.data.updates || {}), updatedAt: Date.now() };
            }
            return n;
          })
        );
      } else if (act.type === 'ADD_TODOS' && act.data?.noteId) {
        const newTodos = (act.data.todos || []).map((t, idx) => ({
          id: `todo-${Date.now()}-${idx}`,
          text: typeof t === 'string' ? t : t.text || 'Task',
          completed: false
        }));

        setNotes((prev) =>
          prev.map((n) => {
            if (n.id === act.data.noteId) {
              return {
                ...n,
                todos: [...(n.todos || []), ...newTodos],
                updatedAt: Date.now()
              };
            }
            return n;
          })
        );
      }
    });
  };

  // Handler: Move to Trash (Soft delete)
  const handleDeleteNote = (noteId) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, isTrash: true, updatedAt: Date.now() } : n))
    );
    addToast('Note moved to Trash Bin', 'warning');
  };

  // Handler: Restore from Trash
  const handleRestoreNote = (noteId) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, isTrash: false, updatedAt: Date.now() } : n))
    );
    addToast('Note restored to active workspace!', 'success');
  };

  // Handler: Permanent Delete
  const handlePermanentDelete = (noteId) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    addToast('Note permanently deleted.', 'info');
  };

  // Handler: Empty Trash
  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete all notes in Trash?')) {
      setNotes((prevNotes) => prevNotes.filter((n) => !n.isTrash));
      addToast('Trash bin emptied.', 'info');
    }
  };

  // Handler: Pin / Favorite toggles
  const handleTogglePin = (noteId) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        if (n.id === noteId) {
          const nextPinned = !n.isPinned;
          addToast(nextPinned ? 'Pinned note to top' : 'Unpinned note', 'info');
          return { ...n, isPinned: nextPinned, updatedAt: Date.now() };
        }
        return n;
      })
    );
  };

  const handleToggleFavorite = (noteId) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        if (n.id === noteId) {
          const nextFav = !n.isFavorite;
          addToast(nextFav ? 'Added to favorites' : 'Removed from favorites', 'info');
          return { ...n, isFavorite: nextFav, updatedAt: Date.now() };
        }
        return n;
      })
    );
  };

  // Handler: Duplicate Note
  const handleDuplicateNote = (noteToDup) => {
    const duplicated = {
      ...noteToDup,
      id: `note-${Date.now()}`,
      title: `${noteToDup.title || 'Untitled'} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes((prev) => [duplicated, ...prev]);
    addToast('Note duplicated!', 'success');
  };

  // Handler: Lock & Security
  const handlePromptLock = (note) => {
    if (note.isLocked) {
      setLockMode('unlock');
      setLockTargetNote(note);
    } else {
      setLockMode('set');
      setLockTargetNote(note);
    }
  };

  const handleUnlockSuccess = (unlockedNote) => {
    setEditingNote(unlockedNote);
    addToast('Note unlocked for editing', 'success');
  };

  const handleSetLockSuccess = (newPin) => {
    if (!lockTargetNote) return;
    const updated = {
      ...lockTargetNote,
      isLocked: true,
      pinCode: newPin,
      updatedAt: Date.now()
    };
    handleSaveNote(updated);
    if (editingNote && editingNote.id === lockTargetNote.id) {
      setEditingNote(updated);
    }
    addToast('Note secured with PIN protection!', 'success');
  };

  // Backup & Import Handlers
  const handleImportNotes = (importedNotes) => {
    const existingIds = new Set(notes.map((n) => n.id));
    const sanitized = importedNotes.map((n) => ({
      ...n,
      id: existingIds.has(n.id) ? `imported-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` : n.id
    }));
    setNotes((prev) => [...sanitized, ...prev]);
  };

  const handleResetSampleNotes = () => {
    if (window.confirm('Reload sample notes into your workspace?')) {
      setNotes(SAMPLE_NOTES);
      addToast('Reset to sample notes.', 'info');
      setIsSettingsOpen(false);
    }
  };

  const handleClearAllNotes = () => {
    if (window.confirm('Delete all notes? This cannot be undone.')) {
      setNotes([]);
      addToast('All notes cleared.', 'warning');
      setIsSettingsOpen(false);
    }
  };

  // Toggle Theme helper
  const handleToggleTheme = () => {
    const themes = ['dark', 'sunset', 'light', 'midnight'];
    const currentIndex = themes.indexOf(settings.theme || 'dark');
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setSettings((prev) => ({ ...prev, theme: nextTheme }));
  };

  // Filter & Search Logic
  const filteredNotes = notes.filter((note) => {
    if (activeFilter === 'trash') {
      if (!note.isTrash) return false;
    } else if (activeFilter === 'archived') {
      if (!note.isArchived || note.isTrash) return false;
    } else {
      if (note.isTrash || note.isArchived) return false;

      if (activeFilter === 'pinned' && !note.isPinned) return false;
      if (activeFilter === 'favorites' && !note.isFavorite) return false;
      if (activeFilter.startsWith('cat-')) {
        const cat = activeFilter.replace('cat-', '');
        if (note.category !== cat) return false;
      }
    }

    if (priorityFilter !== 'all' && note.priority !== priorityFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = note.title?.toLowerCase().includes(q);
      const inContent = note.content?.toLowerCase().includes(q);
      const inTags = (note.tags || []).some((t) => t.toLowerCase().includes(q));
      const inTodos = (note.todos || []).some((t) => t.text?.toLowerCase().includes(q));

      if (!inTitle && !inContent && !inTags && !inTodos) {
        return false;
      }
    }

    return true;
  });

  // Sorting Logic
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (activeFilter === 'all') {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    switch (sortBy) {
      case 'createdAt_desc':
        return (b.createdAt || 0) - (a.createdAt || 0);
      case 'createdAt_asc':
        return (a.createdAt || 0) - (b.createdAt || 0);
      case 'title_asc':
        return (a.title || '').localeCompare(b.title || '');
      case 'priority_desc': {
        const pMap = { high: 3, medium: 2, low: 1, none: 0 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      case 'updatedAt_desc':
      default:
        return (b.updatedAt || 0) - (a.updatedAt || 0);
    }
  });

  return (
    <div className="app-root">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        notes={notes}
        onCreateNewNote={handleCreateNewNote}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGeminiAgent={() => setIsGeminiAgentOpen(true)}
        currentTheme={settings.theme || 'dark'}
        onToggleTheme={handleToggleTheme}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main View Area */}
      <main className="app-main">
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeFilter={activeFilter}
          activeNotesCount={sortedNotes.length}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onCreateNewNote={handleCreateNewNote}
          onEmptyTrash={handleEmptyTrash}
          onOpenGeminiAgent={() => setIsGeminiAgentOpen(true)}
        />

        <div className="notes-container">
          {sortedNotes.length > 0 ? (
            <div className={`notes-${viewMode}`}>
              {sortedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  viewMode={viewMode}
                  onSelect={(n) => setEditingNote(n)}
                  onTogglePin={handleTogglePin}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteNote}
                  onRestore={handleRestoreNote}
                  onPermanentDelete={handlePermanentDelete}
                  onDuplicate={handleDuplicateNote}
                  onOpenAITools={(n) => setAiTargetNote(n)}
                  onOpenLockModal={handlePromptLock}
                  addToast={addToast}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-view animate-fade-in">
              <div className="empty-state-icon-wrap">
                {searchQuery ? <Inbox size={36} /> : <Sparkles size={36} />}
              </div>
              <h3>
                {searchQuery
                  ? 'No matching notes found'
                  : activeFilter === 'trash'
                  ? 'Trash Bin is Empty'
                  : 'Start Capturing Your Thoughts'}
              </h3>
              <p>
                {searchQuery
                  ? `No results for "${searchQuery}". Try searching for another keyword or tag.`
                  : activeFilter === 'trash'
                  ? 'Notes you delete will show up here.'
                  : 'Create your first note to organize your projects, thoughts, tasks, and ideas with AI power.'}
              </p>
              {!searchQuery && activeFilter !== 'trash' && (
                <button className="btn-primary" onClick={handleCreateNewNote}>
                  <Plus size={16} />
                  <span>Create New Note</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Note Editor Modal */}
      {editingNote && (
        <NoteEditorModal
          isOpen={Boolean(editingNote)}
          note={editingNote}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onClose={() => setEditingNote(null)}
          onOpenAITools={(n) => setAiTargetNote(n)}
          onOpenLockModal={handlePromptLock}
          addToast={addToast}
        />
      )}

      {/* Smart AI Assistant Modal */}
      {aiTargetNote && (
        <SmartAIToolsModal
          isOpen={Boolean(aiTargetNote)}
          onClose={() => setAiTargetNote(null)}
          currentNote={aiTargetNote}
          onApplyChanges={(updatedFields) => {
            const updated = { ...aiTargetNote, ...updatedFields, updatedAt: Date.now() };
            handleSaveNote(updated);
            if (editingNote && editingNote.id === aiTargetNote.id) {
              setEditingNote(updated);
            }
          }}
          onAppendTodos={(newTodos) => {
            const updated = {
              ...aiTargetNote,
              todos: [...(aiTargetNote.todos || []), ...newTodos],
              updatedAt: Date.now()
            };
            handleSaveNote(updated);
            if (editingNote && editingNote.id === aiTargetNote.id) {
              setEditingNote(updated);
            }
          }}
          settings={settings}
          addToast={addToast}
        />
      )}

      {/* Gemini AI Autonomous Agent Panel */}
      {isGeminiAgentOpen && (
        <GeminiAgentPanel
          isOpen={isGeminiAgentOpen}
          onClose={() => setIsGeminiAgentOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          notes={notes}
          currentNote={editingNote}
          onExecuteAgentActions={handleExecuteAgentActions}
          onOpenNote={(note) => setEditingNote(note)}
          addToast={addToast}
        />
      )}

      {/* PIN Security Modal */}
      {lockTargetNote && (
        <LockModal
          isOpen={Boolean(lockTargetNote)}
          mode={lockMode}
          targetNote={lockTargetNote}
          onUnlock={handleUnlockSuccess}
          onSetLock={handleSetLockSuccess}
          onClose={() => setLockTargetNote(null)}
        />
      )}

      {/* Settings & Backups Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          notes={notes}
          onImportNotes={handleImportNotes}
          onResetSampleNotes={handleResetSampleNotes}
          onClearAllNotes={handleClearAllNotes}
          addToast={addToast}
        />
      )}
    </div>
  );
}
