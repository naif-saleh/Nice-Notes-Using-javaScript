import React from 'react';
import {
  FileText,
  Pin,
  Star,
  Archive,
  Trash2,
  Folder,
  Briefcase,
  Leaf,
  Lightbulb,
  GraduationCap,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Moon,
  CheckSquare,
  X,
  Bot
} from 'lucide-react';

export default function Sidebar({
  activeFilter,
  setActiveFilter,
  notes,
  onCreateNewNote,
  onOpenSettings,
  currentTheme,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
  onOpenGeminiAgent
}) {
  // Compute counts
  const activeNotes = notes.filter((n) => !n.isTrash && !n.isArchived);
  const totalActive = activeNotes.length;
  const pinnedCount = activeNotes.filter((n) => n.isPinned).length;
  const favoriteCount = activeNotes.filter((n) => n.isFavorite).length;
  const archivedCount = notes.filter((n) => n.isArchived && !n.isTrash).length;
  const trashCount = notes.filter((n) => n.isTrash).length;

  const getCategoryCount = (category) => {
    return activeNotes.filter((n) => n.category === category).length;
  };

  // Productivity summary
  const totalTasks = activeNotes.reduce((acc, n) => acc + (n.todos ? n.todos.length : 0), 0);
  const completedTasks = activeNotes.reduce(
    (acc, n) => acc + (n.todos ? n.todos.filter((t) => t.completed).length : 0),
    0
  );

  const navItem = (id, label, icon, count, isDanger = false) => {
    const isActive = activeFilter === id;
    return (
      <button
        key={id}
        className={`sidebar-nav-item ${isActive ? 'active' : ''} ${isDanger ? 'danger-item' : ''}`}
        onClick={() => {
          setActiveFilter(id);
          if (onCloseMobile) onCloseMobile();
        }}
      >
        <span className="nav-item-icon">{icon}</span>
        <span className="nav-item-label">{label}</span>
        {count !== undefined && count > 0 && (
          <span className={`nav-item-count ${isActive ? 'active' : ''}`}>{count}</span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`app-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src="/images/notes.png" alt="Notes" className="brand-img-logo" />
            <div className="brand-text">
              <h2>Nice Notes</h2>
              <span className="brand-badge">PRO</span>
            </div>
          </div>
          {isOpenMobile && (
            <button className="mobile-close-sidebar-btn" onClick={onCloseMobile}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* CTA: Create New Note & Gemini Agent */}
        <div className="sidebar-cta-wrap">
          <button className="btn-create-note-main" onClick={onCreateNewNote}>
            <div className="btn-cta-content">
              <Plus size={18} />
              <span>New Note</span>
            </div>
            <span className="kbd-shortcut-hint">Ctrl+N</span>
          </button>

          <button
            type="button"
            className="btn-sidebar-gemini-agent"
            onClick={onOpenGeminiAgent}
            title="Open Gemini AI Agent"
          >
            <div className="btn-cta-content">
              <Bot size={17} className="text-accent" />
              <span>Gemini Agent</span>
            </div>
            <span className="agent-trigger-indicator" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-scrollable">
          <div className="sidebar-nav-group">
            <span className="nav-group-title">WORKSPACE</span>
            {navItem('all', 'All Notes', <FileText size={17} />, totalActive)}
            {navItem('pinned', 'Pinned Notes', <Pin size={17} />, pinnedCount)}
            {navItem('favorites', 'Favorites', <Star size={17} />, favoriteCount)}
          </div>

          <div className="sidebar-nav-group">
            <span className="nav-group-title">CATEGORIES</span>
            {navItem(
              'cat-work',
              'Work',
              <span className="category-dot dot-work"><Briefcase size={14} /></span>,
              getCategoryCount('work')
            )}
            {navItem(
              'cat-personal',
              'Personal',
              <span className="category-dot dot-personal"><Leaf size={14} /></span>,
              getCategoryCount('personal')
            )}
            {navItem(
              'cat-ideas',
              'Ideas',
              <span className="category-dot dot-ideas"><Lightbulb size={14} /></span>,
              getCategoryCount('ideas')
            )}
            {navItem(
              'cat-study',
              'Study',
              <span className="category-dot dot-study"><GraduationCap size={14} /></span>,
              getCategoryCount('study')
            )}
            {navItem(
              'cat-general',
              'General',
              <span className="category-dot dot-general"><Folder size={14} /></span>,
              getCategoryCount('general')
            )}
          </div>

          <div className="sidebar-nav-group">
            <span className="nav-group-title">ARCHIVE & TRASH</span>
            {navItem('archived', 'Archived', <Archive size={17} />, archivedCount)}
            {navItem('trash', 'Trash Bin', <Trash2 size={17} />, trashCount, true)}
          </div>

          {/* Productivity Stats Widget */}
          <div className="sidebar-productivity-card">
            <div className="prod-card-header">
              <span className="prod-title">Productivity Status</span>
              <span className="prod-badge">Active</span>
            </div>
            <div className="prod-stats-row">
              <div className="prod-stat">
                <span className="stat-number">{totalActive}</span>
                <span className="stat-label">Notes</span>
              </div>
              <div className="prod-stat">
                <span className="stat-number">
                  {completedTasks}/{totalTasks}
                </span>
                <span className="stat-label">Tasks Done</span>
              </div>
            </div>
            {totalTasks > 0 && (
              <div className="prod-progress-bar">
                <div
                  className="prod-progress-fill"
                  style={{
                    width: `${Math.round((completedTasks / totalTasks) * 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-footer-btn"
            onClick={onToggleTheme}
            title={`Current: ${currentTheme}. Click to switch theme.`}
          >
            {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>Theme: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}</span>
          </button>

          <button
            className="sidebar-footer-btn"
            onClick={onOpenSettings}
            title="Settings & Backup"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
