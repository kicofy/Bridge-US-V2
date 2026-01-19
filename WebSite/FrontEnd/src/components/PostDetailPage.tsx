import { useEffect, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Shield, CheckCircle2, Info, Send, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RichTextDisplay } from './RichTextDisplay';
import { ReportDialog } from './ReportDialog';
import { Post } from './PostCard';
import { use3DHover } from '../hooks/use3DHover';
import { ApiError } from '../api/client';
import { createReply, listReplies } from '../api/replies';
import { deletePost, hidePost, restorePost } from '../api/posts';
import { createReport } from '../api/reports';
import {
  markPostHelpful,
  markReplyHelpful,
  unmarkPostHelpful,
  unmarkReplyHelpful,
} from '../api/interactions';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuthStore } from '../store/auth';

interface Reply {
  id: string;
  author: {
    id: string;
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
  onAuthorClick?: (authorId: string, authorName: string) => void;
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

export function PostDetailPage({ post, onBack, onAuthorClick }: PostDetailPageProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [activePost, setActivePost] = useState(post);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [postHelpful, setPostHelpful] = useState(false);
  const [postHelpfulCount, setPostHelpfulCount] = useState(post.helpfulCount);
  const [replyHelpfulState, setReplyHelpfulState] = useState<Record<string, boolean>>({});
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    setActivePost(post);
    setPostHelpfulCount(post.helpfulCount);
  }, [post]);

  const isOwner = Boolean(currentUser?.userId && activePost.author.id === currentUser.userId);

  const mapReply = (item: {
    id: string;
    author_id: string;
    content: string;
    helpful_count: number;
    created_at?: string | null;
  }): Reply => {
    const name = `User ${item.author_id.slice(0, 6)}`;
    const timestamp = item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now';
    return {
      id: item.id,
      author: {
        id: item.author_id,
        name,
        verified: false,
        credibilityScore: 70,
      },
      content: item.content,
      timestamp,
      helpfulCount: item.helpful_count,
    };
  };

  useEffect(() => {
    if (!activePost.id) return;
    setReplyLoading(true);
    setReplyError(null);
    listReplies({ postId: activePost.id, limit: 50, offset: 0, auth: isAuthenticated })
      .then((items) => {
        setReplies(items.map(mapReply));
      })
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : 'Failed to load replies';
        setReplyError(message);
      })
      .finally(() => setReplyLoading(false));
  }, [activePost.id, isAuthenticated]);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      const created = await createReply(activePost.id, replyText.trim());
      const newReply = mapReply(created);
      setReplies((prev) => [newReply, ...prev]);
      setReplyText('');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to post reply';
      setReplyError(message);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent, authorId: string, authorName: string) => {
    e.stopPropagation();
    if (!authorId) return;
    onAuthorClick?.(authorId, authorName);
  };

  const handleReport = async (reason: string, details: string) => {
    // In a real app, this would send the report to the backend
    try {
      await createReport({
        target_type: 'post',
        target_id: activePost.id,
        reason,
        evidence: details || undefined,
      });
      alert('Thank you for your report. Our moderation team will review it shortly.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to submit report';
      alert(message);
    }
  };

  const handleToggleVisibility = async () => {
    if (!isOwner || statusUpdating) return;
    setStatusUpdating(true);
    try {
      if (activePost.status === 'hidden') {
        const updated = await restorePost(activePost.id);
        setActivePost((prev) => ({ ...prev, status: updated.status }));
      } else {
        const updated = await hidePost(activePost.id);
        setActivePost((prev) => ({ ...prev, status: updated.status }));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('status.updateError');
      setReplyError(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeletePost = async () => {
    if (!isOwner || statusUpdating) return;
    if (!window.confirm(t('posts.deleteConfirm'))) {
      return;
    }
    setStatusUpdating(true);
    try {
      await deletePost(activePost.id);
      onBack();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('status.updateError');
      setReplyError(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePostHelpfulToggle = async () => {
    try {
      if (postHelpful) {
        await unmarkPostHelpful(activePost.id);
        setPostHelpful(false);
        setPostHelpfulCount((prev) => Math.max(0, prev - 1));
      } else {
        await markPostHelpful(activePost.id);
        setPostHelpful(true);
        setPostHelpfulCount((prev) => prev + 1);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update helpfulness';
      setReplyError(message);
    }
  };

  const handleReplyHelpfulToggle = async (replyId: string) => {
    const current = replyHelpfulState[replyId] ?? false;
    try {
      if (current) {
        await unmarkReplyHelpful(replyId);
      } else {
        await markReplyHelpful(replyId);
      }
      setReplyHelpfulState((prev) => ({ ...prev, [replyId]: !current }));
      setReplies((prev) =>
        prev.map((reply) =>
          reply.id === replyId
            ? {
                ...reply,
                helpfulCount: Math.max(0, reply.helpfulCount + (current ? -1 : 1)),
              }
            : reply
        )
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update reply helpfulness';
      setReplyError(message);
    }
  };


  const fullContent = activePost.content || activePost.preview;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2 rounded-xl -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{t('actions.backToPosts')}</span>
        <span className="sm:hidden">{t('actions.back')}</span>
      </Button>

      {/* Post content */}
      <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={(e) => handleAuthorClick(e, activePost.author.id || '', activePost.author.name)}
              className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue-light)] to-[var(--bridge-green-light)] text-[var(--bridge-blue)] text-base sm:text-lg font-semibold hover:opacity-80 transition-opacity"
            >
              {activePost.author.name.charAt(0)}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={(e) => handleAuthorClick(e, activePost.author.id || '', activePost.author.name)}
                  className="text-sm sm:text-base font-medium truncate hover:text-[var(--bridge-blue)] transition-colors"
                >
                  {activePost.author.name}
                </button>
                {activePost.author.verified && (
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
                {activePost.author.credibilityScore >= 80 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[var(--trust-gold)]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Trusted Contributor (Credibility: {activePost.author.credibilityScore}%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <span>{activePost.timestamp}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--bridge-green)]" />
                        <span className="text-[var(--bridge-green)]">{activePost.accuracyScore}% Accurate</span>
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

        {/* Title and author controls */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl leading-snug">{activePost.title}</h1>
            {activePost.status === 'hidden' && (
              <div className="mt-2">
                <Badge className="rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                  {t('posts.hidden')}
                </Badge>
              </div>
            )}
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleVisibility}
                disabled={statusUpdating}
                className="rounded-xl"
              >
                {activePost.status === 'hidden' ? t('posts.show') : t('posts.hide')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeletePost}
                disabled={statusUpdating}
                className="rounded-xl text-destructive hover:text-destructive"
              >
                {t('posts.delete')}
              </Button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {activePost.tags.map((tag) => (
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
            onClick={handlePostHelpfulToggle}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">{t('posts.helpful')} ({postHelpfulCount})</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 rounded-lg text-muted-foreground hover:text-destructive px-3 sm:px-4 h-9 sm:h-10"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">{t('posts.notHelpful')}</span>
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground px-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{replies.length} {t('posts.replies')}</span>
          </div>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReportDialogOpen(true)}
              className="gap-2 rounded-lg text-muted-foreground hover:text-red-600 px-3 sm:px-4 h-9 sm:h-10"
            >
              <Flag className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">{t('posts.report')}</span>
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
        title={t('posts.addReply')}
        submitLabel={t('posts.postReply')}
        placeholder={t('posts.replyPlaceholder')}
      />

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold px-1">
          {replies.length} {t('posts.replies')}
        </h3>
        {replyError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {replyError}
          </div>
        )}
        {replyLoading && (
          <div className="text-sm text-muted-foreground">{t('status.loading')}</div>
        )}
        {replies.map((reply) => (
          <ReplyCard
            key={reply.id}
            reply={reply}
            onAuthorClick={handleAuthorClick}
            onHelpfulToggle={handleReplyHelpfulToggle}
            isHelpful={replyHelpfulState[reply.id] ?? false}
          />
        ))}
      </div>
    </div>
  );
}

function ReplyInputCard({ replyText, onReplyTextChange, onSubmit, submitLabel, title, placeholder }: {
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmit: () => void;
  title: string;
  placeholder: string;
  submitLabel: string;
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
      <h3 className="mb-4 text-base sm:text-lg font-semibold">{title}</h3>
      <div className="space-y-3">
        <textarea
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          placeholder={placeholder}
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
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyCard({ reply, onAuthorClick, onHelpfulToggle, isHelpful }: {
  reply: Reply;
  onAuthorClick: (e: React.MouseEvent, authorId: string, authorName: string) => void;
  onHelpfulToggle: (replyId: string) => void;
  isHelpful: boolean;
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
          onClick={(e) => onAuthorClick(e, reply.author.id, reply.author.name)}
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue-light)] to-[var(--bridge-green-light)] text-[var(--bridge-blue)] text-sm sm:text-base hover:opacity-80 transition-opacity"
        >
          {reply.author.name.charAt(0)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={(e) => onAuthorClick(e, reply.author.id, reply.author.name)}
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
            onClick={() => onHelpfulToggle(reply.id)}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs">
              {isHelpful ? 'Helpful' : 'Helpful'} ({reply.helpfulCount})
            </span>
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