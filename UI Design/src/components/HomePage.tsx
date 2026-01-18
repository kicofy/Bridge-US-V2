import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FilterBar } from './FilterBar';
import { PostCard, Post } from './PostCard';
import { mockPosts, generateMorePosts } from '../lib/mockData';
import { MobileCategorySelector } from './MobileCategorySelector';
import { Loader2 } from 'lucide-react';

interface HomePageProps {
  selectedCategory: string;
  onSelectCategory?: (category: string) => void;
  onPostClick?: (post: Post) => void;
  onAuthorClick?: (authorName: string) => void;
  language?: string;
}

const POSTS_PER_PAGE = 8;

export function HomePage({ selectedCategory, onSelectCategory, onPostClick, onAuthorClick, language = 'en' }: HomePageProps) {
  const [selectedFilter, setSelectedFilter] = useState('newest');
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // All available posts (initial + generated)
  const [allPosts, setAllPosts] = useState<Post[]>(mockPosts);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let posts = [...allPosts];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      posts = posts.filter(post => 
        post.tags.some(tag => 
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    // Sort by selected filter
    switch (selectedFilter) {
      case 'helpful':
        posts.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'accuracy':
        posts.sort((a, b) => b.accuracyScore - a.accuracyScore);
        break;
      case 'newest':
      default:
        // Already in newest order
        break;
    }

    return posts;
  }, [allPosts, selectedCategory, selectedFilter]);

  // Reset when category or filter changes
  useEffect(() => {
    setDisplayedPosts(filteredPosts.slice(0, POSTS_PER_PAGE));
    setPage(1);
    setHasMore(filteredPosts.length > POSTS_PER_PAGE);
  }, [filteredPosts]);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);

    // Simulate loading delay for smoother UX
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = nextPage * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;

      // If we've displayed all filtered posts, generate more
      if (displayedPosts.length >= filteredPosts.length) {
        const newPosts = generateMorePosts(allPosts.length, POSTS_PER_PAGE);
        setAllPosts(prev => [...prev, ...newPosts]);
      } else {
        // Still have filtered posts to show
        const newDisplayedPosts = filteredPosts.slice(0, endIndex);
        setDisplayedPosts(newDisplayedPosts);
        setPage(nextPage);
        
        // Check if we've reached the end
        if (newDisplayedPosts.length >= filteredPosts.length && filteredPosts.length < allPosts.length) {
          setHasMore(true);
        }
      }

      setLoading(false);
    }, 500);
  }, [loading, hasMore, page, displayedPosts.length, filteredPosts, allPosts.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMorePosts]);

  return (
    <div className="flex-1">
      {/* Mobile category selector */}
      {onSelectCategory && (
        <div className="mb-4 lg:hidden">
          <MobileCategorySelector 
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <h1 className="mb-2 text-2xl sm:text-3xl">
          {selectedCategory === 'all' ? 'All Posts' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Posts`}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          A trust-focused community for international students
        </p>
      </div>

      <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

      <div className="space-y-3 sm:space-y-4">
        {displayedPosts.length > 0 ? (
          <>
            {displayedPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                language={language}
                onClick={() => onPostClick?.(post)}
                onAuthorClick={onAuthorClick}
              />
            ))}
            
            {/* Loading indicator */}
            {hasMore && (
              <div 
                ref={observerTarget}
                className="flex items-center justify-center py-6 sm:py-8"
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Loading more posts...</span>
                  </div>
                ) : (
                  <div className="h-4" /> // Invisible trigger element
                )}
              </div>
            )}
            
            {!hasMore && displayedPosts.length > POSTS_PER_PAGE && (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm sm:text-base text-muted-foreground">You've reached the end of the posts</p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl glass p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">No posts found in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}