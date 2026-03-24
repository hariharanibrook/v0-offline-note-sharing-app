'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/app/providers';
import { getNotesByUser, searchNotes } from '@/lib/db';
import { Note } from '@/lib/db';
import NoteCard from '@/components/notes/note-card';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function DashboardPage() {
  const { session } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      if (!session) return;

      try {
        const userNotes = await getNotesByUser(session.userId);
        // Sort by most recent first
        setNotes(userNotes.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [session]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.description?.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }, [notes, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-secondary rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate stats
  const sharedNotes = notes.filter(n => n.isShared).length;

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      {notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Total Notes</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{notes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg p-6 border border-secondary/20 hover:border-secondary/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Shared Notes</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">{sharedNotes}</p>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-lg p-6 border border-accent/20 hover:border-accent/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Responsive</p>
            <p className="text-lg font-semibold text-accent">📱 Mobile Ready</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold mb-2">Your Notes</h1>
        <p className="text-muted-foreground">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved locally
        </p>
      </div>

      {notes.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {notes.length === 0 ? (
        <Empty
          title="No notes yet"
          description="Create your first note to get started"
          icon="FileText"
        />
      ) : filteredNotes.length === 0 ? (
        <Empty
          title="No matching notes"
          description="Try a different search term"
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onNoteDeleted={() => setNotes(notes.filter(n => n.id !== note.id))} />
          ))}
        </div>
      )}
    </div>
  );
}
