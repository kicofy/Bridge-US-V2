import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { SearchFilters } from "./SearchFilters";
import { PostCard, Post } from "./PostCard";
import { searchPosts, fetchTrending } from "../api/search";
import { listCategories } from "../api/categories";
import { ApiError } from "../api/client";
import type { PostResponse } from "../api/posts";
import { useTranslation } from "react-i18next";
import { previewText } from "../utils/text";
import { Button } from "./ui/button";

interface SearchPageProps {
  onPostClick?: (post: Post) => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
  language?: string;
}

export function SearchPage({
  onPostClick,
  onAuthorClick,
  language = "en",
}: SearchPageProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [filters, setFilters] = useState({ categoryId: "all" });
  const [results, setResults] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trending, setTrending] = useState<Post[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const mapPostResponse = (item: PostResponse): Post => {
    const displayName = item.author_name || `User ${item.author_id.slice(0, 6)}`;
    const timestamp = item.published_at || item.created_at || "";
    const dateText = timestamp ? new Date(timestamp).toLocaleString() : "Just now";
    const clipped = previewText(item.content);
    return {
      id: item.id,
      title: item.title,
      preview: clipped,
      content: item.content,
      createdAt: timestamp || undefined,
      notHelpfulCount: 0,
      status: item.status,
      translationStatus: item.translation_status ?? undefined,
      tags: item.tags,
      author: {
        id: item.author_id,
        name: displayName,
        verified: false,
        credibilityScore: 70,
        helpfulnessScore: 60,
      },
      accuracyScore: item.accuracy_count > 0 ? Math.round(item.accuracy_avg) : 0,
      helpfulCount: item.helpful_count,
      replyCount: 0,
      timestamp: dateText,
    };
  };

  useEffect(() => {
    listCategories()
      .then((items) => {
        const active = items.filter((item) => item.status === "active");
        setCategories(active.map((item) => ({ id: item.id, name: item.name })));
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  const displayCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return [
      { id: 'visa', name: t('categories.visa') },
      { id: 'housing', name: t('categories.housing') },
      { id: 'health', name: t('categories.health') },
      { id: 'campus', name: t('categories.campus') },
      { id: 'work', name: t('categories.work') },
    ];
  }, [categories, t]);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    setAppliedQuery(query);
    if (!query) {
      setResults([]);
      setTotal(0);
      return;
    }
    const serverCategoryIds = new Set(categories.map((item) => item.id));
    const categoryId =
      filters.categoryId !== 'all' && serverCategoryIds.has(filters.categoryId)
        ? filters.categoryId
        : undefined;
    setLoading(true);
    setError(null);
    try {
      const data = await searchPosts({
        q: query,
        language,
        categoryId,
        sort: "newest",
      });
      setResults(data.items.map(mapPostResponse));
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Search failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(language, 6)
      .then((data) => setTrending(data.items.map(mapPostResponse)))
      .catch(() => setTrending([]));
  }, [language]);

  return (
    <div className="flex-1">
      <div className="mb-5 sm:mb-8">
        <div className="rounded-3xl border border-white/70 glass-subtle px-4 py-4 sm:px-6 sm:py-5">
          <div className="mb-3 h-1 w-12 rounded-full bg-[var(--bridge-blue)]/30" />
          <h1 className="section-title">
            {t("search.title")}
          </h1>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="h-12 sm:h-14 rounded-2xl border border-white/70 bg-white/70 pl-10 sm:pl-12 pr-4 shadow-sm focus:border-[var(--bridge-blue)] text-sm sm:text-base"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-12 sm:h-14 rounded-full px-6 bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 shadow-lg"
          >
            {t("actions.search")}
          </Button>
        </div>
        {appliedQuery && (
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground px-1">
            {t("search.found", { count: total })} "{appliedQuery}"
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <SearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={displayCategories}
        />
      </div>

      {/* Results - only show when there's a search query */}
      {appliedQuery && (
        <div className="space-y-3 sm:space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="rounded-2xl border bg-white p-4 text-sm text-muted-foreground">
              {t("status.searching")}
            </div>
          )}
          {results.length > 0 ? (
            results.map((post) => (
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
              <h3 className="mb-2 text-base sm:text-lg">
                {t("status.noResults")}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("routes:search.emptyDesc")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state - show when no search query */}
      {!searchQuery.trim() && (
        <div className="space-y-6">
          {trending.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">{t("search.trending")}</h3>
              {trending.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => onPostClick?.(post)}
                  onAuthorClick={onAuthorClick}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-8 sm:p-12 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-base sm:text-lg text-muted-foreground">
                {t("routes:search.emptyTitle")}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("routes:search.emptyDesc")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}