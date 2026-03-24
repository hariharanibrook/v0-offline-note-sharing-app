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
    indexes: { 'by-userId': string; 'by-createdAt': number };
  };
  noteFiles: {
    key: string;
    value: NoteFile;
    indexes: { 'by-noteId': string };
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
      }

      // Note files store
      if (!db.objectStoreNames.contains('noteFiles')) {
        const filesStore = db.createObjectStore('noteFiles', { keyPath: 'id' });
        filesStore.createIndex('by-noteId', 'noteId');
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
