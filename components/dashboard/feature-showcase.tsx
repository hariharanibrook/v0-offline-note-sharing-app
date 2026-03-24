'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Share2,
  Search,
  Download,
  Zap,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Sparkles,
    title: 'AI Summaries',
    description: 'Auto-generate summaries of your notes with AI',
    color: 'from-blue-500 to-cyan-500',
    action: 'Learn More',
    href: '#',
  },
  {
    icon: Share2,
    title: 'Share Notes',
    description: 'Generate secure share codes and share with others',
    color: 'from-purple-500 to-pink-500',
    action: 'Share a Note',
    href: '#',
  },
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Filter by tags, dates, and shared status',
    color: 'from-green-500 to-emerald-500',
    action: 'Search',
    href: '#',
  },
  {
    icon: Download,
    title: 'Export & Backup',
    description: 'Download your notes as JSON, Markdown, or CSV',
    color: 'from-orange-500 to-red-500',
    action: 'Export',
    href: '#',
  },
  {
    icon: Zap,
    title: 'Templates',
    description: 'Start with pre-made templates for common tasks',
    color: 'from-yellow-500 to-amber-500',
    action: 'Browse',
    href: '/dashboard/new',
  },
  {
    icon: Lock,
    title: 'Fully Offline',
    description: 'All data stays on your device, no tracking',
    color: 'from-indigo-500 to-blue-500',
    action: 'Learn',
    href: '#',
  },
];

export default function FeatureShowcase() {
  return (
    <div className="space-y-6 mb-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Powerful Features
        </h2>
        <p className="text-muted-foreground">
          Everything you need to capture, organize, and share your thoughts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="p-5 border-transparent bg-gradient-to-br from-card via-card to-card/50 hover:border-primary/30 transition-all group overflow-hidden relative"
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />
              
              <div className="relative space-y-3">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                {/* Button */}
                <Link href={feature.href} className="block pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full text-xs bg-gradient-to-r ${feature.color} text-white hover:opacity-90`}
                  >
                    {feature.action}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
