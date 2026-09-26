import React, { useState, useRef } from 'react';
import {
  Settings,
  X,
  Palette,
  Key,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Keyboard,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exportAllNotesAsJson, parseNotesBackupFile } from '../utils/exportHelpers';
import { SAMPLE_NOTES } from '../utils/storage';
import { testGeminiConnection } from '../utils/geminiAgent';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  notes,
  onImportNotes,
  onResetSampleNotes,
  onClearAllNotes,
  addToast
}) {
  const [apiKey, setApiKey] = useState(settings?.geminiApiKey || '');
  const [model, setModel] = useState(settings?.geminiModel || 'gemini-1.5-flash');
  const [theme, setTheme] = useState(settings?.theme || 'dark');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await testGeminiConnection(apiKey, model);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      addToast(`Connected to Gemini (${model}) in ${res.latency}ms!`, 'success');
    } else {
      addToast(`Connection failed: ${res.error}`, 'error');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      theme,
      geminiApiKey: apiKey.trim(),
      geminiModel: model
    });
    addToast('Settings saved successfully!', 'success');
    onClose();
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    onUpdateSettings({
      ...settings,
      theme: newTheme
    });
  };

  const handleExportBackup = () => {
    exportAllNotesAsJson(notes);
    addToast(`Exported ${notes.length} notes backup!`, 'success');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedNotes = await parseNotesBackupFile(file);
      onImportNotes(importedNotes);
      addToast(`Successfully imported ${importedNotes.length} notes!`, 'success');
    } catch (err) {
      addToast(`Import failed: ${err.message}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card settings-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge settings">
              <Settings size={20} />
            </div>
            <div>
              <h3>Workspace Settings</h3>
              <p className="modal-subtitle">Customize themes, AI configuration, and manage backups.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="settings-form">
          {/* Theme Selector */}
          <div className="settings-section">
            <div className="section-title">
              <Palette size={16} />
              <span>Appearance & Color Theme</span>
            </div>
            <div className="theme-options-grid">
              <button
                type="button"
                className={`theme-card dark ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <div className="theme-preview dark-preview"></div>
                <div className="theme-meta">
                  <strong>Obsidian Dark</strong>
                  <span>Deep cosmic violet</span>
                </div>
                {theme === 'dark' && <Check size={16} className="theme-check" />}
              </button>

              <button
                type="button"
                className={`theme-card sunset ${theme === 'sunset' ? 'active' : ''}`}
                onClick={() => handleThemeChange('sunset')}
              >
                <div className="theme-preview sunset-preview"></div>
                <div className="theme-meta">
                  <strong>Sunset Glow</strong>
                  <span>Heritage purple & blue</span>
                </div>
                {theme === 'sunset' && <Check size={16} className="theme-check" />}
              </button>

              <button
                type="button"
                className={`theme-card light ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <div className="theme-preview light-preview"></div>
                <div className="theme-meta">
                  <strong>Clean Light</strong>
                  <span>Airy & high contrast</span>
                </div>
                {theme === 'light' && <Check size={16} className="theme-check" />}
              </button>

              <button
                type="button"
                className={`theme-card midnight ${theme === 'midnight' ? 'active' : ''}`}
                onClick={() => handleThemeChange('midnight')}
              >
                <div className="theme-preview midnight-preview"></div>
                <div className="theme-meta">
                  <strong>Midnight Tech</strong>
                  <span>Cyberpunk neon cyan</span>
                </div>
                {theme === 'midnight' && <Check size={16} className="theme-check" />}
              </button>
            </div>
          </div>

          {/* AI Settings */}
          <div className="settings-section">
            <div className="section-title">
              <Sparkles size={16} />
              <span>Google Gemini AI Integration & Agent</span>
            </div>
            <p className="section-help-text">
              Connect your free Google Gemini API key to enable live agentic reasoning, autonomous task planning, and smart synthesis.
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: '6px', color: 'var(--text-accent)' }}
              >
                Get a free API key at Google AI Studio &rarr;
              </a>
            </p>
            <div className="form-group api-key-group">
              <div className="input-with-button">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="agent-model-select"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Free)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Newest Generation)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
                </select>

                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                >
                  {isTesting ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
                  <span>Test Connection</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`conn-status-banner ${testResult.success ? 'success' : 'error'}`}
                  style={{ marginTop: '8px' }}
                >
                  {testResult.success ? (
                    <>
                      <CheckCircle2 size={16} />
                      <div className="status-text">
                        <strong>✓ Connection Successful!</strong>
                        <span>Model: {model} verified ({testResult.latency}ms latency). Ready for agent actions!</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} />
                      <div className="status-text">
                        <strong>✕ Connection Failed:</strong>
                        <span>{testResult.error}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <span className="privacy-badge">
                <ShieldCheck size={14} /> Stored securely in your browser's local storage only.
              </span>
            </div>
          </div>

          {/* Data Backup & Management */}
          <div className="settings-section">
            <div className="section-title">
              <Database size={16} />
              <span>Data Management & Backup</span>
            </div>
            <p className="section-help-text">
              Your notes are automatically saved to your browser. You can export or import full backups anytime.
            </p>
            <div className="backup-buttons-row">
              <button type="button" className="btn-secondary" onClick={handleExportBackup}>
                <Download size={16} />
                <span>Export JSON Backup ({notes.length} notes)</span>
              </button>

              <button type="button" className="btn-secondary" onClick={handleImportClick}>
                <Upload size={16} />
                <span>Import JSON Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileSelected}
              />

              <button type="button" className="btn-secondary" onClick={onResetSampleNotes}>
                <RotateCcw size={16} />
                <span>Load Sample Notes</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="settings-section">
            <div className="section-title">
              <Keyboard size={16} />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="shortcuts-grid">
              <div className="shortcut-item">
                <span className="shortcut-label">Create New Note</span>
                <kbd>Ctrl</kbd> + <kbd>N</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-label">Search Notes</span>
                <kbd>Ctrl</kbd> + <kbd>F</kbd> or <kbd>/</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-label">Close Modal / Esc</span>
                <kbd>Esc</kbd>
              </div>
            </div>
          </div>

          {/* Netlify Deploy info */}
          <div className="settings-section netlify-info-box">
            <div className="netlify-header">
              <strong>🚀 Netlify Deployment Ready</strong>
              <span className="status-pill ready">Ready for Production</span>
            </div>
            <p>
              This app is completely converted to React + Vite. Run <code>npm run build</code> to generate the optimized <code>dist/</code> folder and deploy directly to Netlify!
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
