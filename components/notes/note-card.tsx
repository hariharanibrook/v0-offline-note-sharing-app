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

  // Generate a consistent color based on note ID for visual variety
  const colors = [
    { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', hover: 'hover:border-blue-500/40', text: 'from-blue-600 to-cyan-600' },
    { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', hover: 'hover:border-purple-500/40', text: 'from-purple-600 to-pink-600' },
    { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', hover: 'hover:border-green-500/40', text: 'from-green-600 to-emerald-600' },
    { bg: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/20', hover: 'hover:border-orange-500/40', text: 'from-orange-600 to-red-600' },
    { bg: 'from-yellow-500/10 to-amber-500/10', border: 'border-yellow-500/20', hover: 'hover:border-yellow-500/40', text: 'from-yellow-600 to-amber-600' },
  ];
  const colorIndex = note.id.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];

  return (
    <Link href={`/dashboard/notes/${note.id}`}>
      <div className="group relative h-full">
        <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity`} />
        <Card className={`h-full cursor-pointer relative ${color.border} ${color.hover} transition-all hover:shadow-xl bg-gradient-to-br ${color.bg}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className={`line-clamp-2 font-bold bg-gradient-to-r ${color.text} bg-clip-text text-transparent`}>
                  {note.title}
                </CardTitle>
                <CardDescription className="text-xs mt-2">
                  {formatDate(note.updatedAt)}
                  {note.isShared && <span className="ml-2 font-semibold inline-block px-2 py-1 rounded text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Shared</span>}
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
            <div className="flex gap-2 mt-3 flex-wrap">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${color.bg} border ${color.border}`}
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-xs text-muted-foreground px-2 py-1 font-medium">
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
