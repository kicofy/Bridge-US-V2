import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { SearchFilters } from './SearchFilters';
import { PostCard, Post } from './PostCard';
import { mockPosts } from '../lib/mockData';

interface SearchPageProps {
  onPostClick?: (post: Post) => void;
  onAuthorClick?: (authorName: string) => void;
}

export function SearchPage({ onPostClick, onAuthorClick }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    language: 'all',
    topic: 'all',
    visaType: 'all',
    schoolLevel: 'all',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter posts based on search and filters
  const searchResults = useMemo(() => {
    // If no search query, return empty array
    if (!searchQuery.trim()) {
      return [];
    }

    let results = [...mockPosts];

    // Filter by search query
    const query = searchQuery.toLowerCase();
    results = results.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.preview.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );

    // Filter by topic
    if (filters.topic !== 'all') {
      results = results.filter(post =>
        post.tags.some(tag => tag.toLowerCase().includes(filters.topic.toLowerCase()))
      );
    }

    // Filter by visa type
    if (filters.visaType !== 'all') {
      results = results.filter(post =>
        post.tags.some(tag => tag.toLowerCase().includes(filters.visaType.toLowerCase()))
      );
    }

    return results;
  }, [searchQuery, filters]);

  return (
    <div className="flex-1">
      <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl">Search & Discover</h1>

      {/* Search bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for visa info, housing tips, health resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 sm:h-14 rounded-2xl border-2 bg-white pl-10 sm:pl-12 pr-4 shadow-sm focus:border-[var(--bridge-blue)] text-sm sm:text-base"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground px-1">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Results - only show when there's a search query */}
      {searchQuery.trim() && (
        <div className="space-y-3 sm:space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onClick={() => onPostClick?.(post)}
                onAuthorClick={onAuthorClick}
              />
            ))
          ) : (
            <div className="rounded-2xl border bg-white p-8 sm:p-12 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <h3 className="mb-2 text-base sm:text-lg">No results found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state - show when no search query */}
      {!searchQuery.trim() && (
        <div className="rounded-2xl border bg-white p-8 sm:p-12 text-center">
          <Search className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground opacity-50" />
          <h3 className="mb-2 text-base sm:text-lg text-muted-foreground">Start your search</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter keywords to search for posts, topics, or information
          </p>
        </div>
      )}
    </div>
  );
}