import React from 'react';
import Link from 'next/link';
import { Note } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2 } from 'lucide-react';
import { deleteNote } from '@/lib/db';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  note: Note;
  onNoteDeleted: () => void;
}

export default function NoteCard({ note, onNoteDeleted }: NoteCardProps) {
  const handleDelete = async () => {
    try {
      await deleteNote(note.id);
      toast.success('Note deleted');
      onNoteDeleted();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const preview = note.description || note.content.substring(0, 100);

  return (
    <Link href={`/dashboard/notes/${note.id}`}>
      <div className="group relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <Card className="h-full cursor-pointer relative border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent">
                  {note.title}
                </CardTitle>
                <CardDescription className="text-xs mt-2">
                  {formatDate(note.updatedAt)}
                  {note.isShared && <span className="ml-2 text-primary font-semibold">🔗 Shared</span>}
                </CardDescription>
              </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{preview}</p>
          {note.tags.length > 0 && (
            <div className="flex gap-1 mt-3 flex-wrap">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-2 py-1 rounded border border-primary/20"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{note.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </Link>
  );
}
