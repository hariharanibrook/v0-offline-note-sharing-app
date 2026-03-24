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

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalNotes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalNotes === 1 ? '1 note' : `${totalNotes} notes`} created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Total Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allTags.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {allTags.length === 1 ? '1 unique tag' : `${allTags.length} unique tags`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">across all notes</p>
          </CardContent>
        </Card>
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
