'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  CheckSquare,
  Brain,
  Calendar,
  ListTodo,
  Lightbulb,
} from 'lucide-react';

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  tags: string[];
}

export const templates: NoteTemplate[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Capture action items, decisions, and discussions',
    icon: <ListTodo className="w-5 h-5" />,
    content: `# Meeting Notes - [Date]

## Attendees
- 

## Agenda
1. 

## Key Decisions
- 

## Action Items
- [ ] 
- [ ] 

## Next Steps
- `,
    tags: ['meeting', 'work'],
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Reflect on your day and capture thoughts',
    icon: <Calendar className="w-5 h-5" />,
    content: `# Daily Journal - [Date]

## Highlights
- 

## Challenges
- 

## Lessons Learned
- 

## Tomorrow's Focus
- 

## Gratitude
- `,
    tags: ['journal', 'personal'],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Organize ideas and thoughts freely',
    icon: <Lightbulb className="w-5 h-5" />,
    content: `# Brainstorm Session

## Topic: [Your Topic]

## Ideas
1. 
2. 
3. 

## Pros & Cons
| Idea | Pros | Cons |
|------|------|------|
|      |      |      |

## Next Steps
- `,
    tags: ['brainstorm', 'ideas'],
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Plan and organize your project',
    icon: <CheckSquare className="w-5 h-5" />,
    content: `# Project Plan: [Project Name]

## Overview
[Project Description]

## Goals
- 
- 

## Timeline
- Start: [Date]
- End: [Date]

## Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Resources Needed
- 

## Success Criteria
- `,
    tags: ['project', 'planning'],
  },
  {
    id: 'learning-notes',
    name: 'Learning Notes',
    description: 'Document what you learned',
    icon: <Brain className="w-5 h-5" />,
    content: `# Learning Notes: [Topic]

## Key Concepts
1. 

## Important Details
- 

## Examples
- 

## Questions
- 

## Resources
- 

## Practice Ideas
- `,
    tags: ['learning', 'education'],
  },
  {
    id: 'book-review',
    name: 'Book Review',
    description: 'Document your thoughts on a book',
    icon: <BookOpen className="w-5 h-5" />,
    content: `# Book Review: [Book Title]

## Author
[Author Name]

## Summary
[Brief summary of the book]

## Key Takeaways
1. 
2. 
3. 

## Favorite Quotes
- "..."

## Rating
[Rate 1-5 stars]

## Would Recommend To
- `,
    tags: ['book', 'review'],
  },
];

interface NoteTemplatesProps {
  onSelectTemplate: (template: NoteTemplate) => void;
}

export default function NoteTemplates({ onSelectTemplate }: NoteTemplatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          Quick Start Templates
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a template to get started quickly with pre-formatted content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="p-4 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group bg-gradient-to-br from-card/50 to-card hover:from-card hover:to-card/70"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary group-hover:text-accent transition-colors">
                {template.icon}
              </div>
            </div>
            <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {template.name}
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              {template.description}
            </p>
            <div className="flex gap-1 flex-wrap">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button
              size="sm"
              className="w-full mt-3 bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent"
              onClick={(e) => {
                e.preventDefault();
                onSelectTemplate(template);
              }}
            >
              Use Template
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
