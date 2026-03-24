'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/app/providers';
import { getNotesByUser, searchNotes } from '@/lib/db';
import { Note } from '@/lib/db';
import NoteCard from '@/components/notes/note-card';
import FeatureShowcase from '@/components/dashboard/feature-showcase';
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
      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Stats Section */}
      {notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Total Notes</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{notes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Shared Notes</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{sharedNotes}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-6 border border-green-500/20 hover:border-green-500/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <p className="text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Offline Ready</p>
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
