'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPersonalShareByCode } from '@/lib/db';
import { Note } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function PersonalSharePage() {
  const params = useParams();
  const code = params.code as string;
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const sharedNote = await getPersonalShareByCode(code);
        if (!sharedNote) {
          setError('Note not found or sharing has been revoked');
          setNote(null);
        } else {
          setNote(sharedNote);
        }
      } catch (err) {
        setError('Failed to load shared note');
      } finally {
        setIsLoading(false);
      }
    };

    if (code) {
      loadNote();
    }
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="h-12 bg-secondary/20 rounded-lg animate-pulse" />
          <div className="h-64 bg-secondary/20 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error || 'This note is no longer available'}</p>
            <Link href="/">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {note.title}
            </CardTitle>
            {note.description && (
              <CardDescription className="text-base mt-2">
                {note.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="bg-secondary/10 rounded-lg p-6 border border-secondary/20 whitespace-pre-wrap text-foreground font-mono text-sm leading-relaxed">
                {note.content}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date(note.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
          <p className="text-sm text-foreground">
            This note has been shared with you. You can view it here, but cannot edit or download. 
            Contact the note owner if you have any questions.
          </p>
        </div>
      </div>
    </div>
  );
}
