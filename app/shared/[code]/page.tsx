'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSharedNoteByCode, getNoteFiles, NoteFile } from '@/lib/db';
import { Note } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, File } from 'lucide-react';
import Link from 'next/link';

export default function SharedNotePage() {
  const params = useParams();
  const code = params.code as string;
  const [note, setNote] = useState<Note | null>(null);
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const sharedNote = await getSharedNoteByCode(code);
        if (!sharedNote) {
          setNotFound(true);
          return;
        }
        setNote(sharedNote);

        // Load files if any
        if (sharedNote.fileIds.length > 0) {
          const noteFiles = await getNoteFiles(sharedNote.id);
          setFiles(noteFiles);
        }
      } catch (error) {
        console.error('Failed to load shared note:', error);
        setNotFound(true);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4 p-8">
          <div className="space-y-4">
            <div className="h-8 bg-secondary rounded-lg animate-pulse" />
            <div className="h-12 bg-secondary rounded-lg animate-pulse" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Empty
          title="Share Link Expired or Invalid"
          description="This note may no longer be shared or the link is incorrect"
          icon="Lock"
        />
      </div>
    );
  }

  const handleDownloadFile = async (file: NoteFile) => {
    try {
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        <Card className="p-6 sm:p-8 border-primary/20 bg-gradient-to-br from-card via-card to-card/50">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {note.title}
              </h1>
              {note.description && (
                <p className="text-lg text-muted-foreground">{note.description}</p>
              )}
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="bg-background/50 rounded-lg p-6 border border-border whitespace-pre-wrap text-base leading-relaxed">
                {note.content}
              </div>
            </div>

            {/* Files */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Attachments ({files.length})</h3>
                <div className="grid gap-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(file)}
                        className="gap-2 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
              <p>This note was shared with you. Create an account to share your own notes.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
