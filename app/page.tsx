'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import { FileText, Lock, Share2, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      router.push('/dashboard');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">SmartFlow</h1>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-balance">
          Your Notes, Complete Offline Control
        </h2>
        <p className="text-xl text-muted-foreground mb-12 text-balance">
          SmartFlow is a secure, offline-first note-sharing app. No servers, no tracking,
          just your data on your device.
        </p>
        <div className="flex gap-4 justify-center mb-20">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Start for Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="bg-card rounded-lg p-6 text-left border border-border">
            <Lock className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">100% Offline</h3>
            <p className="text-sm text-muted-foreground">
              All data stored locally on your device. No cloud sync, no internet required.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 text-left border border-border">
            <FileText className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Rich Notes</h3>
            <p className="text-sm text-muted-foreground">
              Create detailed notes with attachments, tags, and full-text search.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 text-left border border-border">
            <Share2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Easy Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Share notes with others on your device using secure file exports.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 text-left border border-border">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Instant search, instant sync, instant results. Zero lag.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground">
        <p>Built with offline-first principles. Your privacy is paramount.</p>
      </footer>
    </div>
  );
}
