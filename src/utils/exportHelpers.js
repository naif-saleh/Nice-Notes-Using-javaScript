// Export and import helpers for Nice Notes Pro

// Download file utility
function triggerDownload(content, filename, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export single note to Markdown (.md)
export function exportNoteToMarkdown(note) {
  let md = `# ${note.title || 'Untitled Note'}\n\n`;
  md += `> **Category:** ${note.category} | **Priority:** ${note.priority || 'None'} | **Updated:** ${new Date(note.updatedAt).toLocaleString()}\n`;
  if (note.tags && note.tags.length > 0) {
    md += `> **Tags:** ${note.tags.map(t => `#${t}`).join(' ')}\n`;
  }
  md += `\n---\n\n`;
  md += `${note.content || ''}\n\n`;

  if (note.todos && note.todos.length > 0) {
    md += `### Checklist / Tasks\n\n`;
    note.todos.forEach(t => {
      md += `- [${t.completed ? 'x' : ' '}] ${t.text}\n`;
    });
    md += `\n`;
  }

  const safeTitle = (note.title || 'note').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  triggerDownload(md, `${safeTitle}.md`, 'text/markdown;charset=utf-8');
}

// Export single note to Plain Text (.txt)
export function exportNoteToTxt(note) {
  let txt = `${note.title || 'Untitled Note'}\n`;
  txt += `=========================================\n`;
  txt += `Category: ${note.category} | Priority: ${note.priority || 'None'}\n`;
  txt += `Date: ${new Date(note.updatedAt).toLocaleString()}\n`;
  if (note.tags && note.tags.length > 0) {
    txt += `Tags: ${note.tags.join(', ')}\n`;
  }
  txt += `=========================================\n\n`;
  txt += `${note.content || ''}\n\n`;

  if (note.todos && note.todos.length > 0) {
    txt += `TASKS:\n`;
    note.todos.forEach((t, i) => {
      txt += `${i + 1}. [${t.completed ? 'X' : ' '}] ${t.text}\n`;
    });
  }

  const safeTitle = (note.title || 'note').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  triggerDownload(txt, `${safeTitle}.txt`, 'text/plain;charset=utf-8');
}

// Print / PDF Note
export function printNote(note) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todosHtml = (note.todos && note.todos.length > 0) 
    ? `<h3>Tasks</h3><ul>${note.todos.map(t => `<li style="text-decoration: ${t.completed ? 'line-through' : 'none'}">[${t.completed ? '✓' : ' '}] ${t.text}</li>`).join('')}</ul>`
    : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${note.title || 'Note'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #111; }
          h1 { margin-bottom: 8px; color: #6b21a8; }
          .meta { font-size: 13px; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 24px; }
          .content { white-space: pre-wrap; font-size: 16px; margin-bottom: 30px; }
          ul { list-style: none; padding-left: 0; }
          li { padding: 4px 0; }
        </style>
      </head>
      <body>
        <h1>${note.title || 'Untitled Note'}</h1>
        <div class="meta">
          <strong>Category:</strong> ${note.category} | 
          <strong>Date:</strong> ${new Date(note.updatedAt).toLocaleString()}
          ${note.tags?.length ? ` | <strong>Tags:</strong> ${note.tags.join(', ')}` : ''}
        </div>
        <div class="content">${(note.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        ${todosHtml}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Export All Notes as JSON Backup
export function exportAllNotesAsJson(notes) {
  const data = {
    exportVersion: '2.0',
    exportDate: new Date().toISOString(),
    totalNotes: notes.length,
    notes: notes
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const filename = `nice_notes_backup_${new Date().toISOString().slice(0, 10)}.json`;
  triggerDownload(jsonStr, filename, 'application/json;charset=utf-8');
}

// Parse imported JSON backup file
export function parseNotesBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else if (parsed && Array.isArray(parsed.notes)) {
          resolve(parsed.notes);
        } else {
          reject(new Error('Invalid backup file format. Expected a list of notes.'));
        }
      } catch (err) {
        reject(new Error('Failed to parse JSON file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed.'));
    reader.readAsText(file);
  });
}
