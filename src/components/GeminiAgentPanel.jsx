import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Brain,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FilePlus,
  ListTodo,
  Check,
  RefreshCw
} from 'lucide-react';
import { testGeminiConnection, runGeminiAgent } from '../utils/geminiAgent';

export default function GeminiAgentPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  notes,
  currentNote,
  onExecuteAgentActions,
  onOpenNote,
  addToast
}) {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      thought: 'Workspace initialized. Ready to assist with note creation, task extraction, planning, and organization.',
      text: 'Hello! I am your **Gemini Note Agent**. I can reason about your ideas and take real actions in your workspace — like creating detailed notes, breaking down projects into interactive checklists, and organizing your thoughts.\n\nWhat would you like to build or plan today?',
      actions: []
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Connection testing state
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(settings?.geminiApiKey || '');
  const [selectedModel, setSelectedModel] = useState(settings?.geminiModel || 'gemini-1.5-flash');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // { success, message, latency, error }

  const chatEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTestingKey(true);
    setConnectionStatus(null);

    const res = await testGeminiConnection(apiKeyInput, selectedModel);
    setIsTestingKey(false);
    setConnectionStatus(res);

    if (res.success) {
      // Save settings
      onUpdateSettings({
        ...settings,
        geminiApiKey: apiKeyInput.trim(),
        geminiModel: selectedModel
      });
      addToast(`Connected to Gemini (${selectedModel}) in ${res.latency}ms!`, 'success');
    } else {
      addToast(`Connection test failed: ${res.error}`, 'error');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isProcessing) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsProcessing(true);

    try {
      const response = await runGeminiAgent({
        apiKey: settings?.geminiApiKey,
        model: settings?.geminiModel || 'gemini-1.5-flash',
        userInput: text,
        notes,
        currentNote
      });

      // Execute actions if returned
      if (response.actions && response.actions.length > 0) {
        onExecuteAgentActions(response.actions);
        addToast(`Gemini Agent executed ${response.actions.length} action(s)!`, 'success');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          thought: response.thought,
          text: response.message,
          actions: response.actions || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          thought: 'Encountered an unexpected error processing request.',
          text: `Error: ${err.message}. Please check your Gemini API key in settings.`,
          actions: []
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const hasApiKey = Boolean(settings?.geminiApiKey);

  return (
    <div className="agent-panel-backdrop" onClick={onClose}>
      <div className="agent-panel-drawer animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Panel Header */}
        <div className="agent-panel-header">
          <div className="agent-brand">
            <div className="agent-avatar-glow">
              <Bot size={22} className="agent-icon" />
              <Sparkles size={12} className="agent-mini-sparkle" />
            </div>
            <div>
              <div className="agent-title-row">
                <h3>Gemini Note Agent</h3>
                <span className={`connection-badge ${hasApiKey ? 'connected' : 'offline'}`}>
                  {hasApiKey ? '🟢 Live Gemini' : '🟡 Offline Mode'}
                </span>
              </div>
              <p className="agent-subtitle">Agentic AI partner that thinks and executes actions</p>
            </div>
          </div>

          <div className="agent-header-controls">
            <button
              className="btn-agent-key-toggle"
              onClick={() => setShowKeySetup(!showKeySetup)}
              title="Set or Check Gemini API Key"
            >
              <Key size={15} />
              <span>{hasApiKey ? 'API Key Set' : 'Set API Key'}</span>
            </button>
            <button className="agent-close-btn" onClick={onClose} title="Close Agent">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* API Key Setup & Connection Checker Dropdown */}
        {showKeySetup && (
          <div className="agent-key-setup-card animate-fade-in">
            <div className="key-setup-header">
              <div className="key-setup-title">
                <Key size={16} />
                <strong>Google Gemini API Key & Connection Tester</strong>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="get-key-link"
              >
                <span>Get Free Key at Google AI Studio</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <p className="key-setup-desc">
              Connect your free Gemini API key to enable live reasoning and generation. Your key never leaves your browser.
            </p>

            <div className="key-input-row">
              <input
                type="password"
                placeholder="Paste Gemini API key (AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="agent-key-input"
              />

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="agent-model-select"
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Free)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Newest)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
              </select>

              <button
                type="button"
                className="btn-primary btn-check-conn"
                onClick={handleTestConnection}
                disabled={isTestingKey || !apiKeyInput.trim()}
              >
                {isTestingKey ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />}
                <span>Check Connection</span>
              </button>
            </div>

            {/* Test Connection Results Box */}
            {connectionStatus && (
              <div className={`conn-status-banner ${connectionStatus.success ? 'success' : 'error'}`}>
                {connectionStatus.success ? (
                  <>
                    <CheckCircle2 size={16} />
                    <div className="status-text">
                      <strong>✓ Connection Successful!</strong>
                      <span>
                        Response latency: <strong>{connectionStatus.latency}ms</strong> | Model: {selectedModel} ready to think and execute.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <div className="status-text">
                      <strong>✕ Connection Failed:</strong>
                      <span>{connectionStatus.error}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat / Action Messages Container */}
        <div className="agent-messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`agent-message-wrapper ${msg.role}`}>
              {msg.role === 'agent' && (
                <div className="agent-msg-avatar">
                  <Bot size={18} />
                </div>
              )}

              <div className="agent-message-bubble">
                {/* Agent Thought Box */}
                {msg.thought && (
                  <div className="agent-thought-box">
                    <div className="thought-header">
                      <Brain size={14} className="thought-icon" />
                      <span>Agent Thought Process:</span>
                    </div>
                    <p className="thought-body">{msg.thought}</p>
                  </div>
                )}

                {/* Main Message Text */}
                <div className="msg-text-content">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                {/* Action Feedback Cards */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="agent-actions-executed-wrap">
                    <div className="actions-badge">
                      <Zap size={13} />
                      <span>{msg.actions.length} Action(s) Executed on Workspace</span>
                    </div>

                    <div className="actions-list">
                      {msg.actions.map((act, aIdx) => (
                        <div key={aIdx} className="action-executed-card">
                          {act.type === 'CREATE_NOTE' && (
                            <>
                              <FilePlus size={16} className="text-accent" />
                              <div className="action-card-text">
                                <strong>Created Note:</strong> "{act.data?.title}"
                                <div className="action-meta">
                                  Category: {act.data?.category} | Priority: {act.data?.priority || 'normal'}
                                  {act.data?.todos?.length > 0 && ` | ${act.data.todos.length} Checklist Items`}
                                </div>
                              </div>
                            </>
                          )}
                          {act.type === 'ADD_TODOS' && (
                            <>
                              <ListTodo size={16} className="text-accent" />
                              <div className="action-card-text">
                                <strong>Added Checklist Items:</strong>
                                <span>{act.data?.todos?.length} tasks appended</span>
                              </div>
                            </>
                          )}
                          {act.type === 'UPDATE_NOTE' && (
                            <>
                              <Check size={16} className="text-accent" />
                              <div className="action-card-text">
                                <strong>Updated Note</strong>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="agent-message-wrapper agent">
              <div className="agent-msg-avatar">
                <Bot size={18} />
              </div>
              <div className="agent-message-bubble processing">
                <div className="agent-thinking-indicator">
                  <Brain size={16} className="spin text-accent" />
                  <span className="thinking-text">Gemini Agent is thinking and planning actions...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="agent-quick-chips">
          <span className="chips-label">Try asking:</span>
          <button
            className="chip-btn"
            onClick={() => handleQuickPrompt('Create a comprehensive project roadmap for our website launch with interactive checklist')}
          >
            🚀 Launch Roadmap
          </button>
          <button
            className="chip-btn"
            onClick={() => handleQuickPrompt('Create a 7-day study plan for React and Modern Web Dev with daily tasks')}
          >
            📚 7-Day Study Plan
          </button>
          <button
            className="chip-btn"
            onClick={() => handleQuickPrompt('Brainstorm 4 innovative productivity app features with high priority note')}
          >
            💡 Brainstorm Ideas
          </button>
          <button
            className="chip-btn"
            onClick={() => handleQuickPrompt('Summarize all my active notes in the workspace')}
          >
            📊 Workspace Summary
          </button>
        </div>

        {/* Input Bar */}
        <div className="agent-input-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="agent-input-form"
          >
            <input
              type="text"
              placeholder="Ask Gemini Agent to plan, create, organize, or summarize..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isProcessing}
              className="agent-text-input"
            />

            <button
              type="submit"
              className="btn-agent-send"
              disabled={!inputVal.trim() || isProcessing}
              title="Send to Gemini Agent"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
