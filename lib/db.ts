import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface NoteFile {
  id: string;
  noteId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  blob: Blob;
  uploadedAt: number;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  fileIds: string[];
  isShared?: boolean;
  shareCode?: string;
  sharedAt?: number;
}

export interface SharedNote {
  id: string;
  noteId: string;
  shareCode: string;
  sharedBy: string;
  sharedAt: number;
  expiresAt?: number;
  viewCount: number;
}

interface NotesDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-userId': string; 'by-createdAt': number; 'by-shareCode': string };
  };
  noteFiles: {
    key: string;
    value: NoteFile;
    indexes: { 'by-noteId': string };
  };
  sharedNotes: {
    key: string;
    value: SharedNote;
    indexes: { 'by-shareCode': string; 'by-noteId': string };
  };
}

let db: IDBPDatabase<NotesDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<NotesDB>> {
  if (db) return db;

  db = await openDB<NotesDB>('NotesDB', 1, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      // Notes store
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-userId', 'userId');
        notesStore.createIndex('by-createdAt', 'createdAt');
        notesStore.createIndex('by-shareCode', 'shareCode');
      }

      // Note files store
      if (!db.objectStoreNames.contains('noteFiles')) {
        const filesStore = db.createObjectStore('noteFiles', { keyPath: 'id' });
        filesStore.createIndex('by-noteId', 'noteId');
      }

      // Shared notes store
      if (!db.objectStoreNames.contains('sharedNotes')) {
        const sharedStore = db.createObjectStore('sharedNotes', { keyPath: 'id' });
        sharedStore.createIndex('by-shareCode', 'shareCode', { unique: true });
        sharedStore.createIndex('by-noteId', 'noteId');
      }
    },
  });

  return db;
}

export async function getDB(): Promise<IDBPDatabase<NotesDB>> {
  if (!db) {
    return initDB();
  }
  return db;
}

// User operations
export async function createUser(user: User): Promise<void> {
  const database = await getDB();
  await database.add('users', user);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const database = await getDB();
  return database.getFromIndex('users', 'by-email', email);
}

export async function getUser(userId: string): Promise<User | undefined> {
  const database = await getDB();
  return database.get('users', userId);
}

// Note operations
export async function createNote(note: Note): Promise<void> {
  const database = await getDB();
  await database.add('notes', note);
}

export async function updateNote(note: Note): Promise<void> {
  const database = await getDB();
  await database.put('notes', note);
}

export async function deleteNote(noteId: string): Promise<void> {
  const database = await getDB();
  
  // Delete all files associated with this note
  const files = await database.getAllFromIndex('noteFiles', 'by-noteId', noteId);
  for (const file of files) {
    await database.delete('noteFiles', file.id);
  }
  
  // Delete the note
  await database.delete('notes', noteId);
}

export async function getNote(noteId: string): Promise<Note | undefined> {
  const database = await getDB();
  return database.get('notes', noteId);
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const database = await getDB();
  return database.getAllFromIndex('notes', 'by-userId', userId);
}

export async function searchNotes(userId: string, query: string): Promise<Note[]> {
  const database = await getDB();
  const allNotes = await database.getAllFromIndex('notes', 'by-userId', userId);
  
  const lowerQuery = query.toLowerCase();
  return allNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.description?.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// File operations
export async function addNoteFile(file: NoteFile): Promise<void> {
  const database = await getDB();
  await database.add('noteFiles', file);
}

export async function getNoteFiles(noteId: string): Promise<NoteFile[]> {
  const database = await getDB();
  return database.getAllFromIndex('noteFiles', 'by-noteId', noteId);
}

export async function deleteNoteFile(fileId: string): Promise<void> {
  const database = await getDB();
  await database.delete('noteFiles', fileId);
}

export async function getNoteFile(fileId: string): Promise<NoteFile | undefined> {
  const database = await getDB();
  return database.get('noteFiles', fileId);
}

// Sharing operations
export async function shareNote(noteId: string, userId: string, shareCode: string): Promise<SharedNote> {
  const database = await getDB();
  const note = await getNote(noteId);
  
  if (!note) {
    throw new Error('Note not found');
  }

  if (note.userId !== userId) {
    throw new Error('Unauthorized to share this note');
  }

  const sharedNote: SharedNote = {
    id: `${noteId}-shared`,
    noteId,
    shareCode,
    sharedBy: userId,
    sharedAt: Date.now(),
    viewCount: 0,
  };

  // Update note with sharing info
  note.isShared = true;
  note.shareCode = shareCode;
  note.sharedAt = Date.now();
  await updateNote(note);

  // Add to shared notes
  await database.put('sharedNotes', sharedNote);
  return sharedNote;
}

export async function getSharedNoteByCode(shareCode: string): Promise<Note | undefined> {
  const database = await getDB();
  try {
    const sharedNote = await database.getFromIndex('sharedNotes', 'by-shareCode', shareCode);
    if (!sharedNote) return undefined;

    // Increment view count
    sharedNote.viewCount += 1;
    await database.put('sharedNotes', sharedNote);

    // Get the actual note
    return database.get('notes', sharedNote.noteId);
  } catch {
    return undefined;
  }
}

export async function unshareNote(noteId: string, userId: string): Promise<void> {
  const database = await getDB();
  const note = await getNote(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  if (note.userId !== userId) {
    throw new Error('Unauthorized to modify this note');
  }

  // Update note
  note.isShared = false;
  note.shareCode = undefined;
  note.sharedAt = undefined;
  await updateNote(note);

  // Delete shared note
  try {
    const sharedNote = await database.getFromIndex('sharedNotes', 'by-noteId', noteId);
    if (sharedNote) {
      await database.delete('sharedNotes', sharedNote.id);
    }
  } catch {
    // Ignore if not found
  }
}

export async function getSharedNoteStats(noteId: string): Promise<SharedNote | undefined> {
  const database = await getDB();
  try {
    return await database.getFromIndex('sharedNotes', 'by-noteId', noteId);
  } catch {
    return undefined;
  }
}
