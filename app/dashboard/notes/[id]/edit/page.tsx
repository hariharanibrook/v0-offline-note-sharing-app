'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNote, getNoteFiles } from '@/lib/db';
import { Note, NoteFile } from '@/lib/db';
import NoteEditor from '@/components/notes/note-editor';

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const loadedNote = await getNote(noteId);
        if (!loadedNote) {
          router.push('/dashboard');
          return;
        }
        setNote(loadedNote);

        // Load files if any
        if (loadedNote.fileIds.length > 0) {
          const noteFiles = await getNoteFiles(noteId);
          setFiles(noteFiles);
        }
      } catch (error) {
        console.error('Failed to load note:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [noteId, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-secondary rounded-lg animate-pulse" />
        <div className="h-96 bg-secondary rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!note) {
    return null;
  }

  const handleSave = (savedNoteId: string) => {
    router.push(`/dashboard/notes/${savedNoteId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Note</h1>
        <p className="text-muted-foreground">Update your note details</p>
      </div>
      <NoteEditor
        userId={note.userId}
        existingNote={note}
        onSave={handleSave}
      />
    </div>
  );
}
