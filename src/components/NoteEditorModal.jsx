import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Pin,
  Star,
  Lock,
  Unlock,
  Trash2,
  Calendar,
  Tag,
  CheckSquare,
  Square,
  Plus,
  Mic,
  MicOff,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Code,
  Quote,
  Download,
  Printer,
  FileText,
  Clock,
  Eye,
  Check
} from 'lucide-react';
import { calculateTextStats, smartAutoTag } from '../utils/smartAssistant';
import { createSpeechRecognizer } from '../utils/speechRecognition';
import { exportNoteToMarkdown, exportNoteToTxt, printNote } from '../utils/exportHelpers';

export default function NoteEditorModal({
  isOpen,
  note,
  onSave,
  onDelete,
  onClose,
  onOpenAITools,
  onOpenLockModal,
  addToast
}) {
  const [formData, setFormData] = useState(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState(null);
  const textareaRef = useRef(null);

  // Sync state whenever note changes
  useEffect(() => {
    if (note) {
      setFormData({
        ...note,
        todos: note.todos ? [...note.todos] : [],
        tags: note.tags ? [...note.tags] : []
      });
    }
  }, [note]);

  // Setup speech recognition
  useEffect(() => {
    const recognizer = createSpeechRecognizer({
      onStart: () => setIsRecording(true),
      onEnd: () => setIsRecording(false),
      onError: (err) => {
        setIsRecording(false);
        addToast(`Voice error: ${err}`, 'warning');
      },
      onResult: ({ final }) => {
        if (final) {
          setFormData((prev) => ({
            ...prev,
            content: prev.content ? `${prev.content} ${final}` : final
          }));
        }
      }
    });

    setSpeechRecognizer(recognizer);

    return () => {
      if (recognizer) recognizer.stop();
    };
  }, []);

  if (!isOpen || !formData) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: Date.now()
    }));
  };

  const handleSaveAndClose = () => {
    onSave(formData);
    onClose();
  };

  // Formatting Helper
  const applyFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formData.content || '';
    const selectedText = currentVal.substring(start, end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newContent = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    handleChange('content', newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 50);
  };

  // Checklist Helpers
  const handleToggleTodo = (todoId) => {
    const updated = formData.todos.map((t) => {
      if (t.id === todoId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    // Check if all are now completed
    const allDone = updated.length > 0 && updated.every((t) => t.completed);
    if (allDone) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
      addToast('🎉 All tasks completed!', 'success');
    }

    handleChange('todos', updated);
  };

  const handleAddTodo = (e) => {
    if (e) e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newTodoText.trim(),
      completed: false
    };

    handleChange('todos', [...(formData.todos || []), newTodo]);
    setNewTodoText('');
  };

  const handleRemoveTodo = (todoId) => {
    handleChange(
      'todos',
      formData.todos.filter((t) => t.id !== todoId)
    );
  };

  // Tag Helpers
  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const tag = newTagInput.trim().replace(/^#/, '');
    if (!tag) return;

    if (!(formData.tags || []).includes(tag)) {
      handleChange('tags', [...(formData.tags || []), tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    handleChange(
      'tags',
      (formData.tags || []).filter((t) => t !== tagToRemove)
    );
  };

  // Voice toggle
  const toggleRecording = () => {
    if (!speechRecognizer || !speechRecognizer.isSupported) {
      addToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
      addToast('Voice dictation stopped.', 'info');
    } else {
      speechRecognizer.start();
      setIsRecording(true);
      addToast('Listening... Speak into your microphone.', 'info');
    }
  };

  // Stats
  const stats = calculateTextStats(formData.content || '');
  const completedTodosCount = (formData.todos || []).filter((t) => t.completed).length;
  const totalTodosCount = (formData.todos || []).length;
  const todosPercentage = totalTodosCount > 0 ? Math.round((completedTodosCount / totalTodosCount) * 100) : 0;

  // Auto tag suggestions
  const suggestedTags = smartAutoTag(formData.title || '', formData.content || '').filter(
    (t) => !(formData.tags || []).includes(t)
  );

  return (
    <div className="modal-backdrop" onClick={handleSaveAndClose}>
      <div
        className={`modal-card editor-modal-card animate-scale-up card-color-${formData.color || 'default'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editor Top Bar */}
        <div className="editor-top-bar">
          <div className="editor-top-meta">
            {/* Category Select */}
            <select
              value={formData.category || 'general'}
              onChange={(e) => handleChange('category', e.target.value)}
              className="select-pill category-select"
            >
              <option value="general">📁 General</option>
              <option value="work">💼 Work</option>
              <option value="personal">🌿 Personal</option>
              <option value="ideas">💡 Ideas</option>
              <option value="study">📚 Study</option>
            </select>

            {/* Priority Select */}
            <select
              value={formData.priority || 'none'}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="select-pill priority-select"
            >
              <option value="none">Priority: None</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>

            {/* Due Date Picker */}
            <div className="date-input-wrap">
              <Calendar size={14} className="date-icon" />
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="date-picker-input"
                title="Set due date"
              />
            </div>
          </div>

          <div className="editor-top-actions">
            {/* Pin Button */}
            <button
              type="button"
              className={`btn-icon-toggle ${formData.isPinned ? 'active-pin' : ''}`}
              onClick={() => handleChange('isPinned', !formData.isPinned)}
              title={formData.isPinned ? 'Unpin note' : 'Pin to top'}
            >
              <Pin size={18} />
            </button>

            {/* Favorite Button */}
            <button
              type="button"
              className={`btn-icon-toggle ${formData.isFavorite ? 'active-star' : ''}`}
              onClick={() => handleChange('isFavorite', !formData.isFavorite)}
              title={formData.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={18} />
            </button>

            {/* Lock / PIN Button */}
            <button
              type="button"
              className={`btn-icon-toggle ${formData.isLocked ? 'active-lock' : ''}`}
              onClick={() => onOpenLockModal(formData)}
              title={formData.isLocked ? 'Note is PIN protected' : 'Protect with PIN'}
            >
              {formData.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>

            {/* AI Assistant Button */}
            <button
              type="button"
              className="btn-ai-sparkle"
              onClick={() => onOpenAITools(formData)}
              title="Open Smart AI Assistant"
            >
              <Sparkles size={16} />
              <span>Smart AI</span>
            </button>

            {/* Close / Save Button */}
            <button
              type="button"
              className="modal-close-btn"
              onClick={handleSaveAndClose}
              title="Save & Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Color Palette Selector Bar */}
        <div className="color-palette-bar">
          <span className="palette-label">Accent:</span>
          {['default', 'lavender', 'sky', 'emerald', 'amber', 'rose', 'slate'].map((colorName) => (
            <button
              key={colorName}
              type="button"
              className={`color-swatch-dot swatch-${colorName} ${formData.color === colorName ? 'selected' : ''}`}
              onClick={() => handleChange('color', colorName)}
              title={`${colorName.charAt(0).toUpperCase() + colorName.slice(1)} theme`}
            />
          ))}
        </div>

        {/* Note Title Input */}
        <div className="editor-title-container">
          <input
            type="text"
            className="editor-title-input"
            placeholder="Title of your note..."
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        {/* Markdown & Format Toolbar */}
        <div className="editor-format-toolbar">
          <button type="button" onClick={() => applyFormatting('**', '**')} title="Bold">
            <Bold size={15} />
          </button>
          <button type="button" onClick={() => applyFormatting('*', '*')} title="Italic">
            <Italic size={15} />
          </button>
          <button type="button" onClick={() => applyFormatting('### ')} title="Heading">
            <Heading size={15} />
          </button>
          <button type="button" onClick={() => applyFormatting('• ')} title="Bullet list">
            <List size={15} />
          </button>
          <button type="button" onClick={() => applyFormatting('1. ')} title="Numbered list">
            <ListOrdered size={15} />
          </button>
          <button type="button" onClick={() => applyFormatting('> ')} title="Blockquote">
            <Quote size={15} />
          </button>
          <button type="button" onClick={() => applyFormatting('```\n', '\n```')} title="Code block">
            <Code size={15} />
          </button>

          <div className="toolbar-divider" />

          {/* Voice Dictation Button */}
          <button
            type="button"
            className={`btn-voice-dictation ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            title={isRecording ? 'Stop voice recording' : 'Dictate note with voice'}
          >
            {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
            <span>{isRecording ? 'Listening...' : 'Voice'}</span>
            {isRecording && <span className="voice-pulse-dot" />}
          </button>
        </div>

        {/* Note Content Textarea */}
        <div className="editor-content-area">
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            placeholder="Write your thoughts, ideas, markdown, or plans here..."
            value={formData.content || ''}
            onChange={(e) => handleChange('content', e.target.value)}
          />
        </div>

        {/* Interactive Checklist / Tasks Section */}
        <div className="editor-tasks-section">
          <div className="tasks-header-row">
            <div className="tasks-heading">
              <CheckSquare size={16} />
              <span>Interactive Checklist ({completedTodosCount}/{totalTodosCount})</span>
            </div>
            {totalTodosCount > 0 && (
              <span className="tasks-progress-text">{todosPercentage}% done</span>
            )}
          </div>

          {totalTodosCount > 0 && (
            <div className="tasks-progress-bar-bg">
              <div
                className="tasks-progress-bar-fill"
                style={{ width: `${todosPercentage}%` }}
              />
            </div>
          )}

          <div className="editor-todo-list">
            {(formData.todos || []).map((todo) => (
              <div key={todo.id} className={`editor-todo-item ${todo.completed ? 'completed' : ''}`}>
                <button
                  type="button"
                  className="todo-check-btn"
                  onClick={() => handleToggleTodo(todo.id)}
                >
                  {todo.completed ? <CheckSquare size={16} className="text-accent" /> : <Square size={16} />}
                </button>
                <span className="todo-text">{todo.text}</span>
                <button
                  type="button"
                  className="todo-delete-btn"
                  onClick={() => handleRemoveTodo(todo.id)}
                  title="Remove task"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTodo} className="add-todo-form">
            <input
              type="text"
              placeholder="+ Add a new checklist item (press Enter)..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
            />
            <button type="submit" className="btn-secondary btn-xs" disabled={!newTodoText.trim()}>
              <Plus size={14} />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Tags Section */}
        <div className="editor-tags-section">
          <div className="tags-label">
            <Tag size={14} />
            <span>Tags:</span>
          </div>

          <div className="tags-chips-list">
            {(formData.tags || []).map((t) => (
              <span key={t} className="tag-chip">
                #{t}
                <button type="button" onClick={() => handleRemoveTag(t)}>
                  <X size={12} />
                </button>
              </span>
            ))}

            <form onSubmit={handleAddTag} className="inline-tag-form">
              <input
                type="text"
                placeholder="+ tag"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
              />
            </form>
          </div>

          {/* AI Tag Suggestions */}
          {suggestedTags.length > 0 && (
            <div className="suggested-tag-chips-row">
              <span className="suggested-label">Suggested:</span>
              {suggestedTags.map((st) => (
                <button
                  key={st}
                  type="button"
                  className="suggested-chip"
                  onClick={() => handleChange('tags', [...(formData.tags || []), st])}
                >
                  +{st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor Bottom Meta & Actions */}
        <div className="editor-bottom-bar">
          <div className="editor-stats-readout">
            <span title="Word count"><strong>{stats.words}</strong> words</span>
            <span>•</span>
            <span title="Character count">{stats.chars} chars</span>
            <span>•</span>
            <span title="Reading time"><Clock size={12} /> {stats.readingTime}</span>
          </div>

          <div className="editor-bottom-actions">
            {/* Export Menu */}
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => exportNoteToMarkdown(formData)}
              title="Export as Markdown (.md)"
            >
              <Download size={14} />
              <span>Export MD</span>
            </button>

            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => printNote(formData)}
              title="Print / Save PDF"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            {/* Delete button */}
            <button
              type="button"
              className="btn-danger-ghost btn-sm"
              onClick={() => {
                onDelete(formData.id);
                onClose();
              }}
              title="Delete Note"
            >
              <Trash2 size={14} />
            </button>

            {/* Save & Done */}
            <button type="button" className="btn-primary" onClick={handleSaveAndClose}>
              <Check size={16} />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
