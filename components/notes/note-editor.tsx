'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createNote, updateNote, addNoteFile, Note, NoteFile } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  description: z.string().optional(),
  tags: z.string().default(''),
});

type NoteForm = z.infer<typeof noteSchema>;

interface NoteEditorProps {
  userId: string;
  existingNote?: Note;
  onSave: (noteId: string) => void;
}

export default function NoteEditor({ userId, existingNote, onSave }: NoteEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<Array<{ id: string; name: string; type: string; size: number; blob?: Blob }>>(
    existingNote?.fileIds.map(id => ({ id, name: '', type: '', size: 0 })) || []
  );
  const [fileBlobs, setFileBlobs] = useState<Map<string, Blob>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: existingNote?.title || '',
      content: existingNote?.content || '',
      description: existingNote?.description || '',
      tags: existingNote?.tags.join(', ') || '',
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.currentTarget.files;
    if (!uploadedFiles) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} - Invalid file type (PDF or images only)`);
        continue;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} - File too large (max 10MB)`);
        continue;
      }

      const fileId = uuidv4();
      setFiles((prev) => [...prev, { id: fileId, name: file.name, type: file.type, size: file.size }]);
      setFileBlobs((prev) => new Map(prev).set(fileId, file));
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setFileBlobs((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  const onSubmit = async (data: NoteForm) => {
    setIsLoading(true);
    try {
      const noteId = existingNote?.id || uuidv4();
      const now = Date.now();
      const tags = data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const note: Note = {
        id: noteId,
        userId,
        title: data.title,
        content: data.content,
        description: data.description,
        tags,
        fileIds: files.map((f) => f.id),
        createdAt: existingNote?.createdAt || now,
        updatedAt: now,
      };

      if (existingNote) {
        await updateNote(note);
        toast.success('Note updated');
      } else {
        await createNote(note);
        toast.success('Note created');
      }

      // Save file blobs
      for (const [fileId, blob] of fileBlobs.entries()) {
        const file = files.find(f => f.id === fileId);
        if (file) {
          const noteFile: NoteFile = {
            id: fileId,
            noteId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            blob,
            uploadedAt: now,
          };
          await addNoteFile(noteFile);
        }
      }

      onSave(noteId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save note';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{existingNote ? 'Edit Note' : 'Create New Note'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Note title"
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              placeholder="Brief description (optional)"
              {...register('description')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              placeholder="Write your note here..."
              className="min-h-64"
              {...register('content')}
              disabled={isLoading}
            />
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
              {...register('tags')}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors text-muted-foreground hover:text-primary"
          >
            <Upload className="w-5 h-5" />
            <span>Click to upload or drag files here</span>
          </button>

          <p className="text-xs text-muted-foreground">PDF and images (JPG, PNG, GIF, WebP) up to 10MB each</p>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{files.length} file(s) attached</p>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : existingNote ? 'Update Note' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
}
