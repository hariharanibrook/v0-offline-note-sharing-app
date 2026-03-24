'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/app/providers';
import { getNotesByUser } from '@/lib/db';
import { Note } from '@/lib/db';
import NoteCard from '@/components/notes/note-card';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Search, Share2, Lock, Zap } from 'lucide-react';

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
      {/* Welcome Section with Feature Highlights */}
      {notes.length === 0 ? (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-8 border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-4">Welcome to SmartFlow</h2>
          <p className="text-muted-foreground mb-6">Create and share notes securely. Your data stays offline and completely private.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3 items-start">
              <Lock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Fully Offline</p>
                <p className="text-xs text-muted-foreground">No internet required</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Share2 className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Easy Sharing</p>
                <p className="text-xs text-muted-foreground">Share with anyone</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Zap className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Lightning Fast</p>
                <p className="text-xs text-muted-foreground">Instant access</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Total Notes</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{notes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Shared Notes</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{sharedNotes}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-6 border border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <p className="text-sm text-muted-foreground mb-2">Private</p>
            <p className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">100% Encrypted</p>
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

      {/* Info Cards Section */}
      {notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-border/50">
          <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl p-6 border border-indigo-500/20">
            <h3 className="font-semibold mb-2 text-indigo-700">Organize Better</h3>
            <p className="text-sm text-muted-foreground">Use tags and descriptions to keep your notes organized and easily searchable</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500/10 to-green-500/10 rounded-xl p-6 border border-teal-500/20">
            <h3 className="font-semibold mb-2 text-teal-700">Share Easily</h3>
            <p className="text-sm text-muted-foreground">Generate unique share codes or add specific people to share your notes securely</p>
          </div>
          <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-xl p-6 border border-rose-500/20">
            <h3 className="font-semibold mb-2 text-rose-700">Stay Private</h3>
            <p className="text-sm text-muted-foreground">Everything stays offline on your device with zero cloud uploads</p>
          </div>
        </div>
      )}
    </div>
  );
}
