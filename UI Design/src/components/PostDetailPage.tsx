import { useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Shield, CheckCircle2, Info, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TranslationToggle } from './TranslationToggle';
import { Post } from './PostCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Reply {
  id: string;
  author: {
    name: string;
    verified: boolean;
    credibilityScore: number;
  };
  content: string;
  timestamp: string;
  helpfulCount: number;
}

interface PostDetailPageProps {
  post: Post;
  onBack: () => void;
  onAuthorClick?: (authorName: string) => void;
  language?: string;
}

const mockReplies: Reply[] = [
  {
    id: '1',
    author: {
      name: 'Maria Garcia',
      verified: true,
      credibilityScore: 92,
    },
    content: 'I had a similar experience! Make sure to check the university\'s international student office - they usually have step-by-step guides and can review your documents before submission.',
    timestamp: '2 hours ago',
    helpfulCount: 45,
  },
  {
    id: '2',
    author: {
      name: 'Ahmed Hassan',
      verified: true,
      credibilityScore: 88,
    },
    content: 'Also, keep in mind that processing times can vary significantly. I recommend applying at least 3 months before your intended start date. The USCIS website has a processing time calculator that can help.',
    timestamp: '5 hours ago',
    helpfulCount: 38,
  },
  {
    id: '3',
    author: {
      name: 'Li Wei',
      verified: false,
      credibilityScore: 65,
    },
    content: 'Don\'t forget to make copies of everything! I learned this the hard way when one of my documents got lost in the mail.',
    timestamp: '1 day ago',
    helpfulCount: 22,
  },
];

export function PostDetailPage({ post, onBack, onAuthorClick, language = 'en' }: PostDetailPageProps) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<Reply[]>(mockReplies);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        verified: true,
        credibilityScore: 75,
      },
      content: replyText,
      timestamp: 'Just now',
      helpfulCount: 0,
    };

    setReplies([newReply, ...replies]);
    setReplyText('');
  };

  const handleAuthorClick = (e: React.MouseEvent, authorName: string) => {
    e.stopPropagation();
    onAuthorClick?.(authorName);
  };

  const fullContent = `${post.preview}\n\nThis is where the full detailed content of the post would be displayed. The author can provide comprehensive information, share their experiences, and ask detailed questions to the community.\n\nInternational students can benefit from reading complete posts as they often contain nuanced details that might be crucial for making informed decisions about visa applications, housing choices, healthcare options, and campus life.\n\nThe BridgeUS platform encourages detailed, well-researched posts that help build a trustworthy knowledge base for the entire international student community.`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2 rounded-xl -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to posts</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Post content */}
      <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={(e) => handleAuthorClick(e, post.author.name)}
              className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue-light)] to-[var(--bridge-green-light)] text-[var(--bridge-blue)] text-base sm:text-lg font-semibold hover:opacity-80 transition-opacity"
            >
              {post.author.name.charAt(0)}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={(e) => handleAuthorClick(e, post.author.name)}
                  className="text-sm sm:text-base font-medium truncate hover:text-[var(--bridge-blue)] transition-colors"
                >
                  {post.author.name}
                </button>
                {post.author.verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[var(--trust-verified)]" />
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
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[var(--trust-gold)]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Trusted Contributor (Credibility: {post.author.credibilityScore}%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <span>{post.timestamp}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--bridge-green)]" />
                        <span className="text-[var(--bridge-green)]">{post.accuracyScore}% Accurate</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Community-verified accuracy rating</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        {/* Title and translation toggle */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="flex-1 text-xl sm:text-2xl leading-snug">{post.title}</h1>
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

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="rounded-lg bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] hover:bg-[var(--bridge-blue-light)] text-xs sm:text-sm"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Full content */}
        <div className="mb-6 prose prose-sm sm:prose max-w-none">
          <p className="text-sm sm:text-base text-foreground whitespace-pre-line leading-relaxed">
            {fullContent}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-4 border-t pt-4 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 rounded-lg text-muted-foreground hover:text-[var(--bridge-green)] px-3 sm:px-4 h-9 sm:h-10"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">Helpful ({post.helpfulCount})</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 rounded-lg text-muted-foreground hover:text-destructive px-3 sm:px-4 h-9 sm:h-10"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Not Helpful</span>
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground px-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{replies.length} Replies</span>
          </div>
        </div>
      </div>

      {/* Reply input */}
      <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="mb-4 text-base sm:text-lg font-semibold">Add a Reply</h3>
        <div className="space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Share your thoughts, experiences, or helpful advice..."
            className="w-full min-h-[100px] sm:min-h-[120px] rounded-xl border bg-background p-3 sm:p-4 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
              className="gap-2 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
            >
              <Send className="h-4 w-4" />
              Post Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold px-1">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>
        {replies.map((reply) => (
          <div key={reply.id} className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-3 flex items-start gap-3">
              <button
                onClick={(e) => handleAuthorClick(e, reply.author.name)}
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue-light)] to-[var(--bridge-green-light)] text-[var(--bridge-blue)] text-sm sm:text-base hover:opacity-80 transition-opacity"
              >
                {reply.author.name.charAt(0)}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={(e) => handleAuthorClick(e, reply.author.name)}
                    className="text-sm font-medium hover:text-[var(--bridge-blue)] transition-colors"
                  >
                    {reply.author.name}
                  </button>
                  {reply.author.verified && (
                    <CheckCircle2 className="h-4 w-4 text-[var(--trust-verified)]" />
                  )}
                  {reply.author.credibilityScore >= 80 && (
                    <Shield className="h-4 w-4 text-[var(--trust-gold)]" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
              </div>
            </div>
            <p className="mb-3 text-sm sm:text-base text-foreground leading-relaxed">
              {reply.content}
            </p>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 rounded-lg text-muted-foreground hover:text-[var(--bridge-green)] h-8 px-2 sm:px-3"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="text-xs">Helpful ({reply.helpfulCount})</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 rounded-lg text-muted-foreground hover:text-destructive h-8 px-2 sm:px-3"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span className="text-xs hidden sm:inline">Not Helpful</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}