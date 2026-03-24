'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, X, Clock, Share2, Filter } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  availableTags: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface SearchFilters {
  query: string;
  selectedTags: string[];
  dateRange?: 'today' | 'week' | 'month' | 'all';
  sharedOnly?: boolean;
}

export default function AdvancedSearch({
  onSearch,
  availableTags,
  isOpen,
  onOpenChange,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sharedOnly, setSharedOnly] = useState(false);

  const handleSearch = () => {
    onSearch(query, {
      query,
      selectedTags,
      dateRange,
      sharedOnly,
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedTags([]);
    setDateRange('all');
    setSharedOnly(false);
    onSearch('', {
      query: '',
      selectedTags: [],
      dateRange: 'all',
      sharedOnly: false,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card className="p-6 mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Date Range
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['today', 'week', 'month', 'all'] as const).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                  className="capitalize"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex gap-2 flex-wrap">
              {availableTags.slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Shared Filter */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="shared-only"
              checked={sharedOnly}
              onChange={(e) => setSharedOnly(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="shared-only" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <Share2 className="w-4 h-4" />
              Shared Notes Only
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}
