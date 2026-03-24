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
    <div className="min-h-screen bg-background">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SmartFlow
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="outline" className="border-primary/20">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-6xl sm:text-7xl font-bold text-balance leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Share Notes Like Never Before
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              SmartFlow is the ultimate offline-first note app. Create, organize, and share your ideas instantly with secure, unique share codes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-6 w-full sm:w-auto">
                Start Sharing Today
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-24">
          {/* Feature 1 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-card rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-left">100% Offline</h3>
              <p className="text-sm text-muted-foreground text-left">
                All data stays on your device. No servers, no tracking, pure privacy.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-card rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-left">Instant Sharing</h3>
              <p className="text-sm text-muted-foreground text-left">
                Generate unique share codes and send to anyone. View count included.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-card rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-left">Rich Content</h3>
              <p className="text-sm text-muted-foreground text-left">
                Add attachments, tags, and detailed descriptions to organize perfectly.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-card rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-left">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground text-left">
                Instant search, zero lag, no delays. Everything at your fingertips.
              </p>
            </div>
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
