'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Note, NoteFile } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit2, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface NoteDetailProps {
  note: Note;
  files: NoteFile[];
}

export default function NoteDetail({ note, files }: NoteDetailProps) {
  const router = useRouter();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopiedToClipboard(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadFile = (file: NoteFile) => {
    try {
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('File downloaded');
    } catch {
      toast.error('Failed to download file');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isImage = (fileType: string) => fileType.startsWith('image/');
  const isPDF = (fileType: string) => fileType === 'application/pdf';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{note.title}</h1>
          <p className="text-muted-foreground">
            Last updated {formatDate(note.updatedAt)}
          </p>
        </div>
        <Link href={`/dashboard/notes/${note.id}/edit`}>
          <Button>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Note Content</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={copiedToClipboard ? 'text-green-600' : ''}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copiedToClipboard ? 'Copied!' : 'Copy'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="bg-secondary p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
              {note.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachments ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isImage(file.fileType) && (
                      <button
                        onClick={() => window.open(URL.createObjectURL(file.blob))}
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
