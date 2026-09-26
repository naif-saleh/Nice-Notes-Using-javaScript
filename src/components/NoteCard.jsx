import React, { useState } from 'react';
import {
  Pin,
  Star,
  Lock,
  Unlock,
  Trash2,
  Calendar,
  Tag,
  CheckSquare,
  Square,
  Sparkles,
  Copy,
  Check,
  MoreVertical,
  Download,
  Share2,
  RotateCcw,
  Clock,
  Printer,
  FileText
} from 'lucide-react';
import { exportNoteToMarkdown, exportNoteToTxt, printNote } from '../utils/exportHelpers';

export default function NoteCard({
  note,
  viewMode = 'grid',
  onSelect,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onRestore,
  onPermanentDelete,
  onDuplicate,
  onOpenAITools,
  onOpenLockModal,
  addToast
}) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isTrash = Boolean(note.isTrash);
  const isLocked = Boolean(note.isLocked);

  const handleCardClick = (e) => {
    // If clicking on specific action buttons, don't open editor
    if (e.target.closest('button') || e.target.closest('.card-action-prevent')) return;

    if (isLocked) {
      onOpenLockModal(note);
    } else {
      onSelect(note);
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    const text = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Note copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const completedTodos = (note.todos || []).filter((t) => t.completed).length;
  const totalTodos = (note.todos || []).length;
  const progressPercent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // Due date status
  let dueDateBadge = null;
  if (note.dueDate) {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = note.dueDate < today;
    const isToday = note.dueDate === today;

    dueDateBadge = (
      <span className={`due-date-badge ${isOverdue ? 'overdue' : isToday ? 'today' : 'upcoming'}`}>
        <Calendar size={12} />
        <span>{isOverdue ? 'Overdue: ' : isToday ? 'Due Today' : 'Due: '}{note.dueDate}</span>
      </span>
    );
  }

  // Priority indicator
  const renderPriorityBadge = () => {
    if (!note.priority || note.priority === 'none') return null;
    return (
      <span className={`priority-badge priority-${note.priority}`}>
        {note.priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div
      className={`note-card card-color-${note.color || 'default'} view-${viewMode} ${
        note.isPinned ? 'is-pinned' : ''
      } animate-fade-in`}
      onClick={handleCardClick}
    >
      {/* Top Header / Meta */}
      <div className="note-card-header">
        <div className="card-meta-left">
          <span className={`category-tag category-${note.category || 'general'}`}>
            {note.category || 'general'}
          </span>
          {renderPriorityBadge()}
          {dueDateBadge}
        </div>

        <div className="card-meta-right">
          {!isTrash && (
            <>
              {/* Pin Button */}
              <button
                type="button"
                className={`card-quick-btn ${note.isPinned ? 'pinned' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(note.id);
                }}
                title={note.isPinned ? 'Unpin note' : 'Pin to top'}
              >
                <Pin size={16} />
              </button>

              {/* Favorite Button */}
              <button
                type="button"
                className={`card-quick-btn ${note.isFavorite ? 'favorited' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(note.id);
                }}
                title={note.isFavorite ? 'Favorited' : 'Add to favorites'}
              >
                <Star size={16} />
              </button>
            </>
          )}

          {isLocked && (
            <span className="card-lock-badge" title="PIN Protected Note">
              <Lock size={15} />
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="note-card-body">
        <h4 className="note-card-title">{note.title || 'Untitled Note'}</h4>

        {isLocked ? (
          <div className="note-locked-placeholder">
            <Lock size={28} className="lock-icon" />
            <p>This note is locked.</p>
            <span>Click to enter PIN code</span>
          </div>
        ) : (
          <>
            <p className="note-card-snippet">
              {note.content
                ? note.content.length > 220 && viewMode === 'grid'
                  ? `${note.content.substring(0, 220)}...`
                  : note.content
                : 'No additional text.'}
            </p>

            {/* Checklist Preview */}
            {totalTodos > 0 && (
              <div className="card-todos-summary">
                <div className="todos-summary-bar">
                  <div className="todos-summary-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="todos-summary-label">
                  <CheckSquare size={13} />
                  <span>
                    {completedTodos}/{totalTodos} tasks ({progressPercent}%)
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tags Row */}
      {!isLocked && note.tags && note.tags.length > 0 && (
        <div className="note-card-tags">
          {note.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="card-tag-pill">
              #{tag}
            </span>
          ))}
          {note.tags.length > 4 && (
            <span className="card-tag-more">+{note.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Card Footer Bar */}
      <div className="note-card-footer">
        <span className="note-timestamp" title={new Date(note.updatedAt).toLocaleString()}>
          <Clock size={12} />
          {new Date(note.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
          })}
        </span>

        <div className="card-footer-actions">
          {isTrash ? (
            <>
              <button
                type="button"
                className="btn-card-action restore"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(note.id);
                }}
                title="Restore note"
              >
                <RotateCcw size={15} />
                <span>Restore</span>
              </button>
              <button
                type="button"
                className="btn-card-action delete-perm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPermanentDelete(note.id);
                }}
                title="Delete permanently"
              >
                <Trash2 size={15} />
              </button>
            </>
          ) : (
            <>
              {/* Copy quick button */}
              <button
                type="button"
                className="btn-card-icon"
                onClick={handleCopy}
                title="Copy note text"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>

              {/* AI Tools quick trigger */}
              {!isLocked && (
                <button
                  type="button"
                  className="btn-card-icon ai"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAITools(note);
                  }}
                  title="Smart AI Assistant"
                >
                  <Sparkles size={14} />
                </button>
              )}

              {/* More Actions Menu */}
              <div className="dropdown-wrapper card-action-prevent">
                <button
                  type="button"
                  className="btn-card-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  title="More options"
                >
                  <MoreVertical size={14} />
                </button>

                {showMenu && (
                  <div className="card-dropdown-menu animate-scale-up" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDuplicate(note);
                      }}
                    >
                      <Copy size={14} /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        exportNoteToMarkdown(note);
                      }}
                    >
                      <Download size={14} /> Export Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        printNote(note);
                      }}
                    >
                      <Printer size={14} /> Print / PDF
                    </button>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(note.id);
                      }}
                    >
                      <Trash2 size={14} /> Move to Trash
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
