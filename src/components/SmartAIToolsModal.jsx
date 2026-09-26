import React, { useState } from 'react';
import {
  Sparkles,
  ListTodo,
  FileText,
  Wand2,
  Tags,
  Copy,
  Plus,
  Check,
  X,
  Loader2,
  Bot
} from 'lucide-react';
import {
  smartSummarizeOffline,
  extractActionItemsOffline,
  rephraseToneOffline,
  smartAutoTag,
  callGeminiAssistant
} from '../utils/smartAssistant';

export default function SmartAIToolsModal({
  isOpen,
  onClose,
  currentNote,
  onApplyChanges,
  onAppendTodos,
  settings,
  addToast
}) {
  const [activeTab, setActiveTab] = useState('summarize');
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen || !currentNote) return null;

  const hasApiKey = Boolean(settings?.geminiApiKey);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setAiOutput('');
    try {
      if (hasApiKey) {
        const res = await callGeminiAssistant({
          apiKey: settings.geminiApiKey,
          content: `${currentNote.title}\n\n${currentNote.content}`,
          task: 'summarize'
        });
        setAiOutput(res);
      } else {
        // Fast offline extraction
        const res = smartSummarizeOffline(`${currentNote.title}\n\n${currentNote.content}`);
        setAiOutput(res);
      }
    } catch (err) {
      console.warn('AI summary fallback to offline:', err);
      const res = smartSummarizeOffline(`${currentNote.title}\n\n${currentNote.content}`);
      setAiOutput(res);
      addToast('Generated using built-in smart assistant.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractTasks = async () => {
    setLoading(true);
    setExtractedTasks([]);
    try {
      if (hasApiKey) {
        const res = await callGeminiAssistant({
          apiKey: settings.geminiApiKey,
          content: `${currentNote.title}\n\n${currentNote.content}`,
          task: 'action-items'
        });
        try {
          const parsed = JSON.parse(res);
          if (Array.isArray(parsed)) {
            setExtractedTasks(parsed.map((item, idx) => ({
              id: `extracted-${Date.now()}-${idx}`,
              text: typeof item === 'string' ? item : item.text || 'Task',
              completed: false
            })));
            setAiOutput(`Extracted ${parsed.length} action items.`);
          } else {
            throw new Error('Not array');
          }
        } catch {
          const offlineTasks = extractActionItemsOffline(currentNote.content);
          setExtractedTasks(offlineTasks);
          setAiOutput(res);
        }
      } else {
        const tasks = extractActionItemsOffline(currentNote.content);
        setExtractedTasks(tasks);
        if (tasks.length === 0) {
          setAiOutput('No obvious action items found. You can add your own or write sentences starting with verbs (e.g. "Review PR", "Deploy build").');
        } else {
          setAiOutput(`Identified ${tasks.length} action items from your note!`);
        }
      }
    } catch (err) {
      console.warn(err);
      const tasks = extractActionItemsOffline(currentNote.content);
      setExtractedTasks(tasks);
      setAiOutput(`Identified ${tasks.length} action items.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRephrase = async (tone) => {
    setLoading(true);
    setAiOutput('');
    try {
      if (hasApiKey && tone === 'professional') {
        const res = await callGeminiAssistant({
          apiKey: settings.geminiApiKey,
          content: currentNote.content,
          task: 'rephrase'
        });
        setAiOutput(res);
      } else {
        const res = rephraseToneOffline(currentNote.content, tone);
        setAiOutput(res);
      }
    } catch (err) {
      console.warn(err);
      const res = rephraseToneOffline(currentNote.content, tone);
      setAiOutput(res);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTags = () => {
    const tags = smartAutoTag(currentNote.title, currentNote.content);
    setSuggestedTags(tags);
    if (tags.length === 0) {
      setAiOutput('No new category tags suggested. The note content is general.');
    } else {
      setAiOutput(`Suggested tags based on content analysis: ${tags.join(', ')}`);
    }
  };

  const handleCustomPromptSubmit = async (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setLoading(true);
    setAiOutput('');
    try {
      if (hasApiKey) {
        const res = await callGeminiAssistant({
          apiKey: settings.geminiApiKey,
          content: currentNote.content,
          prompt: customPrompt,
          task: 'custom'
        });
        setAiOutput(res);
      } else {
        setAiOutput(`To run arbitrary custom generative prompts, please add a free Google Gemini API key in Settings. Meanwhile, built-in smart tools (Summarize, Extract Tasks, Polish, Auto-Tag) work completely offline!`);
      }
    } catch (err) {
      setAiOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const appendToNote = () => {
    if (!aiOutput) return;
    const updatedContent = `${currentNote.content}\n\n---\n${aiOutput}`;
    onApplyChanges({ content: updatedContent });
    addToast('Appended AI output to note!', 'success');
    onClose();
  };

  const replaceNoteContent = () => {
    if (!aiOutput) return;
    onApplyChanges({ content: aiOutput });
    addToast('Replaced note content with AI output!', 'success');
    onClose();
  };

  const importTasksToNote = () => {
    if (extractedTasks.length === 0) return;
    onAppendTodos(extractedTasks);
    addToast(`Added ${extractedTasks.length} checklist items to note!`, 'success');
    onClose();
  };

  const applyTag = (tag) => {
    const existingTags = currentNote.tags || [];
    if (!existingTags.includes(tag)) {
      const updated = [...existingTags, tag];
      onApplyChanges({ tags: updated });
      addToast(`Added tag #${tag}`, 'success');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card ai-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge ai-sparkle">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>Smart AI Assistant</h3>
              <p className="modal-subtitle">
                Intelligent NLP tools & summaries {hasApiKey ? '(Gemini Connected)' : '(Offline Engine)'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="ai-tabs-nav">
          <button
            className={`ai-tab-btn ${activeTab === 'summarize' ? 'active' : ''}`}
            onClick={() => { setActiveTab('summarize'); handleGenerateSummary(); }}
          >
            <FileText size={16} />
            <span>Summarize</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tasks'); handleExtractTasks(); }}
          >
            <ListTodo size={16} />
            <span>Extract To-Dos</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === 'tone' ? 'active' : ''}`}
            onClick={() => setActiveTab('tone')}
          >
            <Wand2 size={16} />
            <span>Tone & Polish</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === 'tags' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tags'); handleSuggestTags(); }}
          >
            <Tags size={16} />
            <span>Auto-Tags</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <Bot size={16} />
            <span>Custom Prompt</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="ai-tab-content">
          {activeTab === 'summarize' && (
            <div className="ai-action-intro">
              <p>Generates an executive, bullet-point summary highlighting the key points of your note.</p>
              <button className="btn-secondary btn-sm" onClick={handleGenerateSummary} disabled={loading}>
                {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                <span>Regenerate Summary</span>
              </button>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="ai-action-intro">
              <p>Detects action items and tasks automatically so you can convert them into interactive checklist items.</p>
              <button className="btn-secondary btn-sm" onClick={handleExtractTasks} disabled={loading}>
                {loading ? <Loader2 size={14} className="spin" /> : <ListTodo size={14} />}
                <span>Scan for Tasks</span>
              </button>
            </div>
          )}

          {activeTab === 'tone' && (
            <div className="ai-tone-options">
              <p>Transform your writing style:</p>
              <div className="tone-buttons-grid">
                <button className="btn-tone" onClick={() => handleRephrase('professional')} disabled={loading}>
                  👔 <strong>Professional</strong>
                  <span>Polished, business-ready formatting</span>
                </button>
                <button className="btn-tone" onClick={() => handleRephrase('concise')} disabled={loading}>
                  ⚡ <strong>Concise</strong>
                  <span>High-signal, trimmed fluff</span>
                </button>
                <button className="btn-tone" onClick={() => handleRephrase('bulletized')} disabled={loading}>
                  📋 <strong>Bullet Points</strong>
                  <span>Structured key takeaways</span>
                </button>
                <button className="btn-tone" onClick={() => handleRephrase('grammar')} disabled={loading}>
                  ✨ <strong>Grammar Fix</strong>
                  <span>Clean whitespace & capitalization</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="ai-tags-section">
              <p>Suggested tags based on topic detection:</p>
              <div className="suggested-tags-cloud">
                {suggestedTags.length > 0 ? (
                  suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      className="suggested-tag-chip"
                      onClick={() => applyTag(tag)}
                      title={`Add #${tag} to note`}
                    >
                      <Plus size={12} />
                      <span>#{tag}</span>
                    </button>
                  ))
                ) : (
                  <span className="no-data-hint">Click below to analyze note content for tags</span>
                )}
              </div>
              <button className="btn-secondary btn-sm" onClick={handleSuggestTags} style={{ marginTop: '12px' }}>
                <Tags size={14} />
                <span>Re-Analyze Tags</span>
              </button>
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCustomPromptSubmit} className="ai-custom-form">
              <div className="form-group">
                <label>Custom Instruction for this note:</label>
                <input
                  type="text"
                  placeholder="e.g. 'Draft a polite follow-up email based on this note' or 'Translate to Spanish'"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary btn-sm" disabled={loading || !customPrompt.trim()}>
                {loading ? <Loader2 size={14} className="spin" /> : <Bot size={14} />}
                <span>Run Prompt</span>
              </button>
            </form>
          )}

          {/* Results Output Box */}
          <div className="ai-result-box">
            <div className="ai-result-header">
              <span className="ai-result-label">Result:</span>
              {aiOutput && (
                <button className="btn-ghost btn-xs" onClick={copyToClipboard}>
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="ai-loading-placeholder">
                <Loader2 size={24} className="spin text-accent" />
                <span>Analyzing and generating with smart assistant...</span>
              </div>
            ) : (
              <div className="ai-result-text">
                {aiOutput ? (
                  <pre>{aiOutput}</pre>
                ) : (
                  <p className="placeholder-text">Select an action above to see smart recommendations.</p>
                )}
              </div>
            )}
          </div>

          {/* Extracted Tasks Preview */}
          {activeTab === 'tasks' && extractedTasks.length > 0 && (
            <div className="extracted-tasks-preview">
              <div className="tasks-preview-header">
                <strong>Found Action Items:</strong>
                <button className="btn-primary btn-sm" onClick={importTasksToNote}>
                  <Plus size={14} />
                  <span>Import All to Note Tasks</span>
                </button>
              </div>
              <ul className="extracted-task-list">
                {extractedTasks.map((t) => (
                  <li key={t.id}>
                    <span className="task-bullet">☐</span>
                    <span>{t.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-actions ai-modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {aiOutput && activeTab !== 'tasks' && (
            <>
              <button type="button" className="btn-secondary" onClick={appendToNote}>
                Append to Note
              </button>
              <button type="button" className="btn-primary" onClick={replaceNoteContent}>
                Replace Note Body
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
