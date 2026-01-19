import { ThumbsUp, ThumbsDown, MessageCircle, Shield, CheckCircle2, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card3D } from './Card3D';
import { useTranslation } from 'react-i18next';
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
  content?: string;
  createdAt?: string;
  notHelpfulCount?: number;
  tags: string[];
  author: {
    id?: string;
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
  onClick?: () => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
}

export function PostCard({ post, onClick, onAuthorClick }: PostCardProps) {
  const { t } = useTranslation();
  const helpfulRatioText = getHelpfulnessRatioText(post.helpfulCount, post.notHelpfulCount ?? 0);

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
    if (post.author.id) {
      onAuthorClick?.(post.author.id, post.author.name);
    }
  };

  return (
    <Card3D 
      onClick={handleCardClick}
      className="group rounded-2xl glass p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg cursor-pointer"
      maxRotation={6}
      scale={1.01}
    >
      {/* Header with author info */}
      <div className="mb-3 sm:mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={handleAuthorClick}
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue-light)] to-[var(--bridge-green-light)] text-[var(--bridge-blue)] text-sm sm:text-base hover:opacity-80 transition-opacity backdrop-blur-sm"
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

        {/* Helpfulness ratio */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 rounded-lg bg-[var(--bridge-green-light)] px-2 sm:px-3 py-1 sm:py-1.5 shrink-0">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--bridge-green)]" />
                <span className="text-xs text-[var(--bridge-green)] whitespace-nowrap">
                  {helpfulRatioText}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{t('posts.helpful')} / ({t('posts.helpful')} + {t('posts.notHelpful')})</p>
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
          {/* Translation toggle intentionally hidden per product requirement */}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{post.preview}</p>
      </div>

      {/* Tags */}
      <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
        {post.tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="rounded-lg glass-subtle text-[var(--bridge-blue)] hover:glass text-xs border-0"
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
            <span className="hidden xs:inline">{t('posts.helpful')} </span>({post.helpfulCount})
          </span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 sm:gap-2 rounded-lg text-muted-foreground hover:text-destructive px-2 sm:px-3 h-8 sm:h-9"
        >
          <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs hidden sm:inline">{t('posts.notHelpful')}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 sm:gap-2 rounded-lg text-muted-foreground hover:text-[var(--bridge-blue)] px-2 sm:px-3 h-8 sm:h-9"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs">{post.replyCount} <span className="hidden xs:inline">{t('posts.replies')}</span></span>
        </Button>
      </div>
    </Card3D>
  );
}

function getHelpfulnessRatioText(helpfulCount: number, notHelpfulCount: number) {
  const total = helpfulCount + notHelpfulCount;
  if (total === 0) {
    return '0%';
  }
  const ratio = Math.round((helpfulCount / total) * 100);
  return `${ratio}%`;
}