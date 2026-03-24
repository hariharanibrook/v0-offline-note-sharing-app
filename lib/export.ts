import { Note, NoteFile, getDatabase } from '@/lib/db';

export async function exportNotesAsJSON(notes: Note[]): Promise<string> {
  const db = await getDatabase();
  
  // Enrich notes with file data
  const enrichedNotes = await Promise.all(
    notes.map(async (note) => {
      const files = await Promise.all(
        note.fileIds.map(async (fileId) => {
          try {
            const file = await db.get('noteFiles', fileId);
            return file ? { ...file, blob: undefined } : null;
          } catch {
            return null;
          }
        })
      );
      
      return {
        ...note,
        files: files.filter(Boolean),
      };
    })
  );

  return JSON.stringify(enrichedNotes, null, 2);
}

export async function exportNotesAsMarkdown(notes: Note[]): Promise<string> {
  let markdown = '# Notes Backup\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `Total Notes: ${notes.length}\n\n`;
  markdown += '---\n\n';

  for (const note of notes) {
    markdown += `## ${note.title}\n\n`;
    markdown += `**Created:** ${new Date(note.createdAt).toLocaleDateString()}\n\n`;
    markdown += `**Updated:** ${new Date(note.updatedAt).toLocaleDateString()}\n\n`;
    
    if (note.description) {
      markdown += `**Description:** ${note.description}\n\n`;
    }
    
    if (note.tags.length > 0) {
      markdown += `**Tags:** ${note.tags.join(', ')}\n\n`;
    }
    
    markdown += `${note.content}\n\n`;
    markdown += '---\n\n';
  }

  return markdown;
}

export async function exportNotesAsCSV(notes: Note[]): Promise<string> {
  const headers = ['Title', 'Description', 'Tags', 'Word Count', 'Created', 'Updated'];
  const rows = notes.map((note) => {
    const wordCount = note.content.split(/\s+/).length;
    const tags = note.tags.join(';');
    
    return [
      `"${note.title.replace(/"/g, '""')}"`,
      `"${(note.description || '').replace(/"/g, '""')}"`,
      `"${tags}"`,
      wordCount,
      new Date(note.createdAt).toLocaleDateString(),
      new Date(note.updatedAt).toLocaleDateString(),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportAllNotes(notes: Note[], format: 'json' | 'markdown' | 'csv') {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (format) {
    case 'json': {
      const content = await exportNotesAsJSON(notes);
      downloadFile(content, `notes-backup-${timestamp}.json`, 'application/json');
      break;
    }
    case 'markdown': {
      const content = await exportNotesAsMarkdown(notes);
      downloadFile(content, `notes-backup-${timestamp}.md`, 'text/markdown');
      break;
    }
    case 'csv': {
      const content = await exportNotesAsCSV(notes);
      downloadFile(content, `notes-backup-${timestamp}.csv`, 'text/csv');
      break;
    }
  }
}

export async function createBackup(notes: Note[]): Promise<Blob> {
  const content = await exportNotesAsJSON(notes);
  return new Blob([content], { type: 'application/json' });
}

export async function restoreFromBackup(backupFile: File): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const notes = JSON.parse(content) as Note[];
        resolve(notes);
      } catch (error) {
        reject(new Error('Invalid backup file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };
    
    reader.readAsText(backupFile);
  });
}
