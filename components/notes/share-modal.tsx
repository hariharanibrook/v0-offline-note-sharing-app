'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/providers';
import { shareNote, unshareNote, getSharedNoteStats } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Link2, Share2, Trash2 } from 'lucide-react';
import { Note } from '@/lib/db';

interface ShareModalProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: (shareCode: string) => void;
  onUnshare?: () => void;
}

export default function ShareModal({ note, isOpen, onOpenChange, onShare, onUnshare }: ShareModalProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [shareCode, setShareCode] = useState(note.shareCode || '');
  const [viewCount, setViewCount] = useState(0);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  React.useEffect(() => {
    if (isOpen && note.isShared && session) {
      loadShareStats();
    }
  }, [isOpen, note.isShared, session]);

  const loadShareStats = async () => {
    if (!session) return;
    try {
      const stats = await getSharedNoteStats(note.id);
      if (stats) {
        setViewCount(stats.viewCount);
      }
    } catch (error) {
      console.error('Failed to load share stats:', error);
    }
  };

  const generateShareCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleShare = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const code = shareCode || generateShareCode();
      await shareNote(note.id, session.userId, code);
      setShareCode(code);
      toast.success('Note shared successfully!');
      onShare?.(code);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to share note';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshare = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      await unshareNote(note.id, session.userId);
      setShareCode('');
      setViewCount(0);
      toast.success('Note unshared');
      onUnshare?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unshare note';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!shareCode) return;
    const shareUrl = `${window.location.origin}/shared/${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleAddSharedContact = () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    if (sharedWith.includes(newEmail)) {
      toast.error('Already shared with this email');
      return;
    }
    setSharedWith([...sharedWith, newEmail]);
    setNewEmail('');
    toast.success(`Shared with ${newEmail}`);
  };

  const handleRemoveSharedContact = (email: string) => {
    setSharedWith(sharedWith.filter(e => e !== email));
    toast.success(`Removed ${email}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share This Note
          </DialogTitle>
          <DialogDescription>
            Share with anyone using a link or add specific people
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {note.isShared && shareCode ? (
            <div className="space-y-4">
              {/* Share Link Section */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Share Link</p>
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-muted-foreground mb-2">Share Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded font-mono text-sm font-semibold">
                      {shareCode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyShareLink}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                <p className="text-xs text-muted-foreground mb-2">Engagement</p>
                <p className="text-2xl font-bold text-purple-600">
                  {viewCount} {viewCount === 1 ? 'view' : 'views'}
                </p>
              </div>

              {/* Shared With Section */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Shared With People</p>
                <div className="space-y-2">
                  {sharedWith.length > 0 ? (
                    <div className="space-y-2">
                      {sharedWith.map((email) => (
                        <div key={email} className="flex items-center justify-between bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                          <p className="text-sm">{email}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSharedContact(email)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not shared with anyone yet</p>
                  )}
                </div>

                {/* Add Person */}
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="person@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSharedContact()}
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddSharedContact}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleUnshare}
                disabled={isLoading}
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Unshare Note
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create a shareable link for this note. Anyone with the link can view it.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Custom code (optional)"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleShare}
                disabled={isLoading}
                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Link2 className="w-4 h-4" />
                Generate Share Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
