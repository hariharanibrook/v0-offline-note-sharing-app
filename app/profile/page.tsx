'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { getUser, getNotesByUser } from '@/lib/db';
import { User, Note } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, FileText, Tag } from 'lucide-react';

export default function ProfilePage() {
  const { session } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!session) return;

      try {
        const userData = await getUser(session.userId);
        setUser(userData || null);

        const userNotes = await getNotesByUser(session.userId);
        setNotes(userNotes);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [session]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-secondary rounded-lg animate-pulse" />
        <div className="grid gap-6">
          <div className="h-48 bg-secondary rounded-lg animate-pulse" />
          <div className="h-48 bg-secondary rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate stats
  const totalNotes = notes.length;
  const allTags = [...new Set(notes.flatMap((n) => n.tags))];
  const totalWords = notes.reduce((sum, note) => sum + note.content.split(/\s+/).length, 0);

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sharedNotes = notes.filter(n => n.isShared).length;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-card/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.name}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
                <p className="text-xs text-muted-foreground mt-2">Joined {joinDate}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Member Since</p>
              <p className="font-semibold">{joinDate}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Account Status</p>
              <Badge>Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total Notes</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{totalNotes}</p>
        </div>

        <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg p-6 border border-secondary/20 hover:border-secondary/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <Tag className="w-5 h-5 text-secondary" />
            <p className="text-sm text-muted-foreground">Unique Tags</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">{allTags.length}</p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-6 border border-accent/20 hover:border-accent/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-sm text-muted-foreground">Total Words</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{totalWords.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-sm text-muted-foreground">Shared Notes</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{sharedNotes}</p>
        </div>
      </div>

      {/* Top Tags */}
      {allTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Tags</CardTitle>
            <CardDescription>Most frequently used tags in your notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 20).map((tag) => {
                const tagCount = notes.filter((n) => n.tags.includes(tag)).length;
                return (
                  <Badge key={tag} variant="secondary" className="cursor-default">
                    {tag} <span className="ml-1 text-xs opacity-60">×{tagCount}</span>
                  </Badge>
                );
              })}
              {allTags.length > 20 && (
                <Badge variant="outline">+{allTags.length - 20} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
          <CardDescription>Your latest notes</CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No notes yet</p>
          ) : (
            <div className="space-y-2">
              {notes.slice(0, 5).map((note) => (
                <div key={note.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4">
                    {note.content.split(/\s+/).length} words
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
