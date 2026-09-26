import React, { useRef } from 'react';
import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Menu,
  Trash2,
  Download,
  Plus,
  Bot,
  Sparkles
} from 'lucide-react';

export default function TopBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  priorityFilter,
  setPriorityFilter,
  viewMode,
  setViewMode,
  activeFilter,
  activeNotesCount,
  onOpenMobileSidebar,
  onCreateNewNote,
  onEmptyTrash,
  onOpenGeminiAgent
}) {
  const searchInputRef = useRef(null);

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'pinned':
        return '📌 Pinned Notes';
      case 'favorites':
        return '⭐ Favorite Notes';
      case 'cat-work':
        return '💼 Work Notes';
      case 'cat-personal':
        return '🌿 Personal Notes';
      case 'cat-ideas':
        return '💡 Ideas & Inventions';
      case 'cat-study':
        return '📚 Study & Learning';
      case 'cat-general':
        return '📁 General Notes';
      case 'archived':
        return '📦 Archived Notes';
      case 'trash':
        return '🗑️ Trash Bin';
      default:
        return '📝 All Notes';
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="mobile-hamburger-btn"
          onClick={onOpenMobileSidebar}
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-title-section">
          <h1 className="view-title">{getFilterTitle()}</h1>
          <span className="view-count-badge">{activeNotesCount}</span>
        </div>
      </div>

      {/* Middle: Instant Search Bar */}
      <div className="topbar-search-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search notes, tags, todos... (Press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={handleClearSearch} title="Clear search">
              <X size={14} />
            </button>
          )}
          {!searchQuery && <span className="search-kbd-hint">/</span>}
        </div>
      </div>

      {/* Right: Filters, Sorting & View Modes */}
      <div className="topbar-right">
        {activeFilter === 'trash' ? (
          activeNotesCount > 0 && (
            <button className="btn-danger-outline btn-sm" onClick={onEmptyTrash}>
              <Trash2 size={15} />
              <span>Empty Trash</span>
            </button>
          )
        ) : (
          <>
            {/* Priority Filter */}
            <div className="filter-select-wrapper" title="Filter by priority">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="topbar-select"
              >
                <option value="all">Priority: All</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="filter-select-wrapper" title="Sort notes">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="topbar-select"
              >
                <option value="updatedAt_desc">Recently Updated</option>
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="title_asc">Title (A - Z)</option>
                <option value="priority_desc">Priority (High to Low)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>

            {/* Gemini AI Agent Button */}
            <button
              type="button"
              className="btn-gemini-agent-trigger"
              onClick={onOpenGeminiAgent}
              title="Open Gemini AI Agent"
            >
              <Bot size={16} />
              <span>Gemini Agent</span>
              <span className="agent-trigger-indicator" />
            </button>

            {/* Mobile New Note Action */}
            <button
              className="btn-primary mobile-new-note-btn"
              onClick={onCreateNewNote}
              title="Create note"
            >
              <Plus size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
