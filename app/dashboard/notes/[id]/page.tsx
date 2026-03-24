'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNote, getNoteFiles } from '@/lib/db';
import { Note, NoteFile } from '@/lib/db';
import NoteDetail from '@/components/notes/note-detail';

export default function NoteDetailPage() {
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

  return <NoteDetail note={note} files={files} />;
}
