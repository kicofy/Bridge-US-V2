import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Shield, CheckCircle2, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TranslationToggle } from './TranslationToggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export interface Post {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  author: {
    name: string;
    verified: boolean;
    credibilityScore: number;
    helpfulnessScore: number;
  };
  accuracyScore: number;
  helpfulCount: number;
  replyCount: number;
  timestamp: string;
}

interface PostCardProps {
  post: Post;
  language?: string;
  onClick?: () => void;
  onAuthorClick?: (authorName: string) => void;
}

export function PostCard({ post, language = 'en', onClick, onAuthorClick }: PostCardProps) {
  const [isTranslated, setIsTranslated] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    onClick?.();
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAuthorClick?.(post.author.name);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group rounded-2xl border bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      {/* Header with author info */}
      <div className="mb-3 sm:mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={handleAuthorClick}
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue-light)] to-[var(--bridge-green-light)] text-[var(--bridge-blue)] text-sm sm:text-base hover:opacity-80 transition-opacity"
          >
            {post.author.name.charAt(0)}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleAuthorClick}
                className="text-xs sm:text-sm truncate hover:text-[var(--bridge-blue)] transition-colors"
              >
                {post.author.name}
              </button>
              {post.author.verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[var(--trust-verified)]" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Verified international student</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {post.author.credibilityScore >= 80 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[var(--trust-gold)]" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Trusted Contributor (Credibility: {post.author.credibilityScore}%)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{post.timestamp}</span>
          </div>
        </div>

        {/* Accuracy score */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 rounded-lg bg-[var(--bridge-green-light)] px-2 sm:px-3 py-1 sm:py-1.5 shrink-0">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--bridge-green)]" />
                <span className="text-xs text-[var(--bridge-green)] whitespace-nowrap">{post.accuracyScore}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Community-verified accuracy rating</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Post content */}
      <div className="mb-3 sm:mb-4">
        <div className="mb-2 flex items-start justify-between gap-2 sm:gap-4">
          <h3 className="flex-1 text-base sm:text-lg leading-snug group-hover:text-[var(--bridge-blue)] transition-colors">
            {post.title}
          </h3>
          {language !== 'en' && (
            <div className="shrink-0">
              <TranslationToggle
                isTranslated={isTranslated}
                originalLanguage="English"
                onToggle={() => setIsTranslated(!isTranslated)}
              />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{post.preview}</p>
      </div>

      {/* Tags */}
      <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
        {post.tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="rounded-lg bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] hover:bg-[var(--bridge-blue-light)] text-xs"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 border-t pt-3 sm:pt-4 flex-wrap">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 sm:gap-2 rounded-lg text-muted-foreground hover:text-[var(--bridge-green)] px-2 sm:px-3 h-8 sm:h-9"
        >
          <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs">
            <span className="hidden xs:inline">Helpful </span>({post.helpfulCount})
          </span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 sm:gap-2 rounded-lg text-muted-foreground hover:text-destructive px-2 sm:px-3 h-8 sm:h-9"
        >
          <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs hidden sm:inline">Not Helpful</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 sm:gap-2 rounded-lg text-muted-foreground hover:text-[var(--bridge-blue)] px-2 sm:px-3 h-8 sm:h-9"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs">{post.replyCount} <span className="hidden xs:inline">Replies</span></span>
        </Button>
      </div>
    </div>
  );
}