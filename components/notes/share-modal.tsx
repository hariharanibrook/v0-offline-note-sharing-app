'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/providers';
import { shareNote, unshareNote, getSharedNoteStats, createPersonalShare, getPersonalSharesByNote, removePersonalShare } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Link2, Share2, Trash2, Users } from 'lucide-react';
import { Note, PersonalShare } from '@/lib/db';

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
  const [personalShares, setPersonalShares] = useState<PersonalShare[]>([]);
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('view');

  React.useEffect(() => {
    if (isOpen && session) {
      loadShareStats();
      loadPersonalShares();
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

  const loadPersonalShares = async () => {
    try {
      const shares = await getPersonalSharesByNote(note.id);
      setPersonalShares(shares);
    } catch (error) {
      console.error('Failed to load personal shares:', error);
    }
  };

  const generateShareCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleShareWithPerson = async () => {
    if (!newEmail.trim() || !session) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const personalShare = await createPersonalShare(
        note.id,
        session.email,
        newEmail,
        accessLevel
      );
      setPersonalShares([...personalShares, personalShare]);
      setNewEmail('');
      toast.success(`Shared with ${newEmail}!`);
    } catch (error) {
      toast.error('Failed to create personal share');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePersonalShare = async (shareId: string) => {
    try {
      await removePersonalShare(shareId);
      setPersonalShares(personalShares.filter(s => s.id !== shareId));
      toast.success('Share removed');
    } catch (error) {
      toast.error('Failed to remove share');
    }
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

              {/* Personal Share Section */}
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Share With Specific People
                </p>
                <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 p-4 rounded-lg border border-rose-500/20 space-y-3">
                  {personalShares.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-semibold">Shared with:</p>
                      {personalShares.map((share) => (
                        <div key={share.id} className="flex items-center justify-between bg-background/50 p-2 rounded border border-border/50">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{share.sharedWithEmail}</p>
                            <p className="text-xs text-muted-foreground">{share.accessLevel === 'view' ? 'View only' : 'Can edit'}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePersonalShare(share.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Person Form */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <label className="text-xs text-muted-foreground">Add email</label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="person@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleShareWithPerson()}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>
                    <select
                      value={accessLevel}
                      onChange={(e) => setAccessLevel(e.target.value as 'view' | 'edit')}
                      className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                    >
                      <option value="view">View Only</option>
                      <option value="edit">Can Edit</option>
                    </select>
                    <Button
                      onClick={handleShareWithPerson}
                      disabled={isLoading || !newEmail.trim()}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                    >
                      Share Link
                    </Button>
                  </div>
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
