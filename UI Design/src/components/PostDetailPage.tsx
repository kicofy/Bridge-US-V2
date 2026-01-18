import { useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Shield, CheckCircle2, Info, Send, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TranslationToggle } from './TranslationToggle';
import { RichTextDisplay } from './RichTextDisplay';
import { ReportDialog } from './ReportDialog';
import { Post } from './PostCard';
import { use3DHover } from '../hooks/use3DHover';
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
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

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

  const handleReport = (reason: string, details: string) => {
    // In a real app, this would send the report to the backend
    console.log('Report submitted:', { postId: post.id, reason, details });
    
    // Show success message (could use toast notification)
    alert('Thank you for your report. Our moderation team will review it shortly.');
  };

  // Example rich text content with markdown formatting
  const fullContent = `${post.preview}

## My Experience with the F-1 Visa Process

I recently completed my F-1 visa application and wanted to share some **important details** that might help others going through the same process.

### Required Documents

The process requires several key documents:

- Valid passport (must be valid for at least 6 months beyond your stay)
- Form I-20 from your university
- SEVIS payment receipt
- Visa application confirmation page
- Financial documents proving you can support yourself

### Timeline and Processing

*Processing times can vary significantly* depending on your location. I recommend applying at least **3 months** before your intended start date.

For the most current processing times, check the [USCIS Processing Times](https://egov.uscis.gov/processing-times/) website.

### Helpful Tips

1. Make copies of **everything** - I learned this the hard way
2. Arrive at the embassy at least 30 minutes early
3. Be prepared to explain your study plans in detail

## Visual Aid

Here's a helpful flowchart I found during my research:

![F-1 Visa Process Flowchart](https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop)

## Final Thoughts

The key to success is **thorough preparation** and having all documents organized. Don't hesitate to reach out to your university's international student office - they're there to help!

Feel free to ask any questions below, and I'll do my best to help based on my experience.`;

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

        {/* Full content with rich text formatting */}
        <div className="mb-6">
          <RichTextDisplay content={fullContent} className="text-sm sm:text-base" />
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
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReportDialogOpen(true)}
              className="gap-2 rounded-lg text-muted-foreground hover:text-red-600 px-3 sm:px-4 h-9 sm:h-10"
            >
              <Flag className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Report</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        onSubmit={handleReport}
        contentType="post"
      />

      {/* Reply input - simple textarea */}
      <ReplyInputCard
        replyText={replyText}
        onReplyTextChange={setReplyText}
        onSubmit={handleSubmitReply}
      />

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold px-1">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>
        {replies.map((reply) => (
          <ReplyCard
            key={reply.id}
            reply={reply}
            onAuthorClick={handleAuthorClick}
          />
        ))}
      </div>
    </div>
  );
}

function ReplyInputCard({ replyText, onReplyTextChange, onSubmit }: {
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmit: () => void;
}) {
  const card3D = use3DHover({ maxRotation: 5, scale: 1.01 });
  const submitBtn3D = use3DHover({ maxRotation: 6, scale: 1.05 });

  return (
    <div
      ref={card3D.ref}
      style={card3D.style}
      onMouseMove={card3D.onMouseMove}
      onMouseEnter={card3D.onMouseEnter}
      onMouseLeave={card3D.onMouseLeave}
      className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm"
    >
      <h3 className="mb-4 text-base sm:text-lg font-semibold">Add a Reply</h3>
      <div className="space-y-3">
        <textarea
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          placeholder="Share your thoughts, experiences, or helpful advice..."
          className="w-full min-h-[100px] sm:min-h-[120px] rounded-xl border bg-background p-3 sm:p-4 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
        />
        <div className="flex justify-end">
          <div
            ref={submitBtn3D.ref}
            style={submitBtn3D.style}
            onMouseMove={submitBtn3D.onMouseMove}
            onMouseEnter={submitBtn3D.onMouseEnter}
            onMouseLeave={submitBtn3D.onMouseLeave}
          >
            <Button
              onClick={onSubmit}
              disabled={!replyText.trim()}
              className="gap-2 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
            >
              <Send className="h-4 w-4" />
              Post Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyCard({ reply, onAuthorClick }: {
  reply: Reply;
  onAuthorClick: (e: React.MouseEvent, authorName: string) => void;
}) {
  const card3D = use3DHover({ maxRotation: 6, scale: 1.02 });
  const helpful3D = use3DHover({ maxRotation: 6, scale: 1.05 });
  const notHelpful3D = use3DHover({ maxRotation: 6, scale: 1.05 });

  return (
    <div
      ref={card3D.ref}
      style={card3D.style}
      onMouseMove={card3D.onMouseMove}
      onMouseEnter={card3D.onMouseEnter}
      onMouseLeave={card3D.onMouseLeave}
      className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start gap-3">
        <button
          onClick={(e) => onAuthorClick(e, reply.author.name)}
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue-light)] to-[var(--bridge-green-light)] text-[var(--bridge-blue)] text-sm sm:text-base hover:opacity-80 transition-opacity"
        >
          {reply.author.name.charAt(0)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={(e) => onAuthorClick(e, reply.author.name)}
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
      <div className="mb-3">
        <p className="mb-3 text-sm sm:text-base text-foreground leading-relaxed">
          {reply.content}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div
          ref={helpful3D.ref}
          style={helpful3D.style}
          onMouseMove={helpful3D.onMouseMove}
          onMouseEnter={helpful3D.onMouseEnter}
          onMouseLeave={helpful3D.onMouseLeave}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5 rounded-lg text-muted-foreground hover:text-[var(--bridge-green)] h-8 px-2 sm:px-3"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs">Helpful ({reply.helpfulCount})</span>
          </Button>
        </div>
        <div
          ref={notHelpful3D.ref}
          style={notHelpful3D.style}
          onMouseMove={notHelpful3D.onMouseMove}
          onMouseEnter={notHelpful3D.onMouseEnter}
          onMouseLeave={notHelpful3D.onMouseLeave}
        >
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
    </div>
  );
}