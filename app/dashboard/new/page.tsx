'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import NoteEditor from '@/components/notes/note-editor';

export default function NewNotePage() {
  const router = useRouter();
  const { session } = useAuth();

  if (!session) return null;

  const handleSave = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Note</h1>
        <p className="text-muted-foreground">Start writing your note</p>
      </div>
      <NoteEditor userId={session.userId} onSave={handleSave} />
    </div>
  );
}
