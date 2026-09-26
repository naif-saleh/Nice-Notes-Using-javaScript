# 🚀 Nice Notes Pro — Smart & Modern AI-Powered Notes Workspace

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_AI_Agent-1.5_Flash_%7C_Pro-4285F4?logo=google&logoColor=white)
![Netlify Ready](https://img.shields.io/badge/Netlify_Ready-npm_run_build-00C7B7?logo=netlify&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS-Glassmorphism-1572B6?logo=css3&logoColor=white)

**An ultra-modern, professional note-taking and productivity workspace powered by an autonomous Google Gemini AI Agent.**

[Features](#-features--capabilities) • [Gemini AI Agent](#-autonomous-gemini-ai-agent) • [Quick Start](#-quick-start) • [Netlify Deployment](#-netlify-deployment-guide) • [Keyboard Shortcuts](#-keyboard-shortcuts)

</div>

---

## 🌟 Evolution: Original vs. Nice Notes Pro 2.0

| Feature | Original Version | Nice Notes Pro 2.0 |
| :--- | :--- | :--- |
| **Framework** | Vanilla HTML/JS | **React 19 + Vite 8** |
| **AI Capabilities** | None | **Autonomous Gemini AI Agent** (Reasoning, Action Execution, NLP tools) |
| **API Connection Check** | None | **Built-in Live Connection Tester** (Latency & Model check) |
| **Task Management** | None | **Interactive Checklists** with progress bar & confetti celebrations |
| **Security** | None | **4-Digit PIN Lock Vault** for sensitive notes |
| **Voice Input** | None | **Speech-to-Text Voice Dictation** |
| **Themes** | 1 static gradient | **4 Curated Themes** (Obsidian Dark, Sunset Heritage, Clean Light, Midnight Cyberpunk) |
| **Organization** | Single flat list | **Categories, Tags, Priorities, Pinning, Favorites, Trash Bin** |
| **Search & Filters** | None | **Instant fuzzy search** + multi-criteria filtering & sorting |
| **Export / Backup** | LocalStorage only | **Markdown (.md), Plain Text (.txt), Print/PDF & Full JSON Backups** |
| **Deployability** | Static files | **Single-command `npm run build` ready for Netlify (`dist/`)** |

---

## ✨ Features & Capabilities

### 🧠 Autonomous Gemini AI Agent
- **Agentic Reasoning Stream**: The agent displays an internal **"Agent Thought Process"** explaining its rationale before taking actions.
- **Direct Workspace Execution**:
  - 📝 **Create rich structured notes** with automatic categorization, priority, tags, and formatting.
  - 📋 **Generate and append checklists** for projects, sprints, study guides, and daily tasks.
  - 🔄 **Update and enhance existing notes** on demand.
- **Connection Verification**:
  - Direct integration with Google Gemini (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`).
  - **1-Click "Check Connection"**: Measures roundtrip API latency in milliseconds and verifies model readiness.
  - **Zero-Config Offline Fallback**: If no key is set or you are offline, the built-in smart heuristics engine handles planning seamlessly!

### ✍️ Professional Note Editor
- **Rich Markdown Formatting**: Bold, italic, headings, bullet points, numbered lists, blockquotes, code snippets.
- **Interactive Checklist System**: Track tasks with completion checkboxes, progress percentage bar, and celebratory confetti upon task completion.
- **Voice Dictation**: Dictate ideas with your microphone using the Web Speech API with real-time audio wave pulses.
- **PIN Lock Protection**: Secure confidential notes with client-side PIN encryption.
- **Live Text Metrics**: Real-time word count, character count, and estimated reading time.
- **Vibrant Accent Swatches**: Choose from Lavender, Sky Blue, Emerald, Amber, Rose, and Slate.

### 🗂️ Workspace Organization & Search
- **Instant Search**: Real-time search across titles, content, tags, and checklist items (press `/` to search).
- **Categories**: Dedicated workspaces for `General`, `Work`, `Personal`, `Ideas`, and `Study`.
- **Priority Indicators**: Mark notes as `High`, `Medium`, or `Low` priority with distinct colored badges.
- **Multiple View Modes**: Toggle between responsive Masonry Grid Cards and high-density List View.
- **Trash & Soft Delete**: Safe trash bin with 1-click restore or permanent wipe.

### 💾 Backup, Export & Migration
- **Export Single Notes**: Download as `.md`, `.txt`, or print directly to PDF.
- **Full Data Backup**: Export and import complete workspace backups as structured JSON.
- **Automatic Migration**: Automatically parses and imports legacy HTML notes from previous app versions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js `18.x` or later (tested on Node v20)
- npm `9.x` or later

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/Nice-Notes-Using-javaScript.git

# Navigate into the project directory
cd Nice-Notes-Using-javaScript

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` to start taking notes.

---

## 🔑 Gemini AI Setup & Connection Check

To connect the Gemini AI Agent:

1. **Obtain an API Key**:
   - Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Configure in App**:
   - Click the **"Gemini Agent"** button in the top navigation bar or open **Settings** (`⚙️`).
   - Paste your API key in the input field.
   - Choose your preferred model (e.g. `gemini-1.5-flash`).
3. **Verify Connection**:
   - Click **"Check Connection"** or **"Test Connection"**.
   - You will see a verified status badge with live ping latency (e.g., `✓ Connected (180ms)`).
4. **Interact with the Agent**:
   - Ask: *"Create a full roadmap for a React application with a checklist"*
   - Ask: *"Draft meeting notes with marketing with high priority"*
   - Watch the agent display its thought process and autonomously populate your notes!

---

## 🌐 Netlify Deployment Guide

The project is fully pre-configured for **Netlify** with `netlify.toml` and `public/_redirects` to ensure seamless Single Page Application (SPA) routing.

### Step 1: Run the Production Build
```bash
npm run build
```
This generates an optimized, minified bundle in the **`dist/`** folder:
```
dist/
  ├── assets/
  │    ├── index-[hash].css
  │    └── index-[hash].js
  ├── images/
  ├── _redirects
  └── index.html
```

### Step 2: Deploy to Netlify

#### Method 1: Git Continuous Deployment (Recommended)
1. Push your code to GitHub.
2. In [Netlify Dashboard](https://app.netlify.com/), click **"Add new site"** > **"Import an existing project"**.
3. Select your repository.
4. Netlify will auto-detect the configuration from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Click **Deploy Site** — your app is live!

#### Method 2: Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login and deploy
netlify deploy --prod --dir=dist
```

#### Method 3: Drag & Drop
1. Log in to Netlify.
2. Go to the **Sites** tab.
3. Drag and drop your local **`dist/`** folder into the browser window.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> / <kbd>Cmd</kbd> + <kbd>N</kbd> | Create New Note |
| <kbd>/</kbd> | Focus Search Bar |
| <kbd>Esc</kbd> | Close Editor / Agent Drawer / Modal |

---

## 📁 Project Architecture

```
Nice-Notes-Using-javaScript/
├── public/
│   ├── images/               # Legacy & brand assets (notes.png, etc.)
│   └── _redirects            # Netlify SPA redirect configuration
├── src/
│   ├── components/
│   │   ├── GeminiAgentPanel.jsx  # Autonomous AI Agent drawer with thought stream
│   │   ├── NoteCard.jsx          # Note card component with progress & tags
│   │   ├── NoteEditorModal.jsx   # Rich text editor, checklists, voice & PIN
│   │   ├── SettingsModal.jsx     # Themes, Gemini key tester, backups
│   │   ├── Sidebar.jsx           # Categories, folders, productivity widget
│   │   ├── SmartAIToolsModal.jsx # Summarizer, To-Do extractor, tone rephraser
│   │   ├── ToastContainer.jsx    # Smooth floating notifications
│   │   └── TopBar.jsx            # Search bar, filters, sorting & agent trigger
│   ├── utils/
│   │   ├── exportHelpers.js      # MD, TXT, Print/PDF & JSON backup handlers
│   │   ├── geminiAgent.js        # Gemini API engine, connection tester & prompt logic
│   │   ├── smartAssistant.js     # Built-in offline NLP heuristics
│   │   ├── speechRecognition.js  # Web Speech API dictation wrapper
│   │   └── storage.js            # LocalStorage persistence & migration
│   ├── App.css                   # Glassmorphism, animations, responsive design
│   ├── App.jsx                   # Master state management & action dispatcher
│   ├── index.css                 # Theme tokens (Obsidian, Sunset, Light, Midnight)
│   └── main.jsx                  # React 19 root
├── netlify.toml              # Netlify build & security headers configuration
├── package.json              # Project dependencies & build scripts
└── vite.config.js            # Vite configuration
```

---

## 📜 License

Distributed under the MIT License. Feel free to use and customize for your personal and professional workflows!
