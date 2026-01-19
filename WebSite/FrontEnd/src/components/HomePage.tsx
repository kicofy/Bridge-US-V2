import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FilterBar } from './FilterBar';
import { PostCard, Post } from './PostCard';
import { MobileCategorySelector } from './MobileCategorySelector';
import { Loader2 } from 'lucide-react';
import { listPosts, PostResponse } from '../api/posts';
import { ApiError } from '../api/client';
import { useTranslation } from 'react-i18next';

interface HomePageProps {
  selectedCategory: string;
  onSelectCategory?: (category: string) => void;
  onPostClick?: (post: Post) => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
  language?: string;
}

const POSTS_PER_PAGE = 8;
const FALLBACK_AUTHOR = {
  verified: false,
  credibilityScore: 70,
  helpfulnessScore: 60,
};

export function HomePage({ selectedCategory, onSelectCategory, onPostClick, onAuthorClick, language = 'en' }: HomePageProps) {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('newest');
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // All available posts loaded from backend
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const buildPreview = (content: string) => {
    const plain = content.replace(/\s+/g, ' ').trim();
    return plain.length > 160 ? `${plain.slice(0, 160)}...` : plain;
  };

  const toPostCard = (item: PostResponse): Post => {
    const displayName = item.author_name || `User ${item.author_id.slice(0, 6)}`;
    const rawTimestamp = item.published_at || item.created_at || '';
    const dateText = rawTimestamp ? new Date(rawTimestamp).toLocaleString() : 'Just now';
    const accuracyScore = item.accuracy_count > 0 ? Math.round(item.accuracy_avg) : 0;
    return {
      id: item.id,
      title: item.title,
      preview: buildPreview(item.content),
      content: item.content,
      createdAt: rawTimestamp || undefined,
      notHelpfulCount: 0,
      tags: item.tags,
      author: {
        id: item.author_id,
        name: displayName,
        ...FALLBACK_AUTHOR,
      },
      accuracyScore,
      helpfulCount: item.helpful_count,
      replyCount: 0,
      timestamp: dateText,
    };
  };

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
      case 'newest':
      default:
        posts.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
    }

    return posts;
  }, [allPosts, selectedCategory, selectedFilter]);

  const fetchPosts = useCallback(async (offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const items = await listPosts({ language, limit: POSTS_PER_PAGE, offset });
      const mapped = items.map(toPostCard);
      if (offset === 0) {
        setAllPosts(mapped);
      } else {
        setAllPosts((prev) => [...prev, ...mapped]);
      }
      setHasMore(items.length >= POSTS_PER_PAGE);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [language]);

  // Reset when category, filter, or language changes
  useEffect(() => {
    setPage(1);
    fetchPosts(0);
  }, [fetchPosts, selectedCategory, selectedFilter, language]);

  useEffect(() => {
    setDisplayedPosts(filteredPosts.slice(0, POSTS_PER_PAGE));
    setPage(1);
    setHasMore(filteredPosts.length > POSTS_PER_PAGE);
  }, [filteredPosts]);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    const nextOffset = (nextPage - 1) * POSTS_PER_PAGE;
    fetchPosts(nextOffset);
    setPage(nextPage);
  }, [loading, hasMore, page, fetchPosts]);

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
        <div>
          <h1 className="mb-2 text-2xl sm:text-3xl">
            {selectedCategory === 'all' ? t('routes:home.title') : t('routes:home.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('routes:home.subtitle')}
          </p>
        </div>
      </div>

      <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

      <div className="space-y-3 sm:space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
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
                    <span className="text-sm sm:text-base">{t('status.loading')}</span>
                  </div>
                ) : (
                  <div className="h-4" /> // Invisible trigger element
                )}
              </div>
            )}
            
            {!hasMore && displayedPosts.length > POSTS_PER_PAGE && (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm sm:text-base text-muted-foreground">{t('status.noResults')}</p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl glass p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">{t('status.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}