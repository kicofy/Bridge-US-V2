import { Shield, CheckCircle2, Award, MessageCircle, ThumbsUp, Calendar, MapPin, Settings } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { PostCard, Post } from './PostCard';
import { mockPosts } from '../lib/mockData';
import { Button } from './ui/button';

interface ProfilePageProps {
  userName?: string;
  onPostClick?: (post: Post) => void;
  onAuthorClick?: (authorName: string) => void;
  onAdminAccess?: () => void;
}

// Mock user database
const mockUsers: Record<string, any> = {
  'Sarah Chen': {
    name: 'Sarah Chen',
    avatar: 'SC',
    verified: true,
    joinDate: 'January 2024',
    location: 'Los Angeles, CA',
    school: 'UCLA',
    visaStatus: 'F-1 Student',
    credibilityScore: 92,
    helpfulnessScore: 88,
    accuracyHistory: 95,
    postsCount: 12,
    helpfulAnswers: 147,
    commentsCount: 89,
    badges: [
      { name: 'Verified Student', icon: CheckCircle2, color: 'text-[var(--trust-verified)]' },
      { name: 'Trusted Contributor', icon: Shield, color: 'text-[var(--trust-gold)]' },
      { name: 'Top Helper', icon: Award, color: 'text-[var(--bridge-blue)]' },
    ],
  },
  'John Smith': {
    name: 'John Smith',
    avatar: 'JS',
    verified: true,
    joinDate: 'March 2024',
    location: 'New York, NY',
    school: 'NYU',
    visaStatus: 'F-1 Student',
    credibilityScore: 85,
    helpfulnessScore: 82,
    accuracyHistory: 88,
    postsCount: 8,
    helpfulAnswers: 95,
    commentsCount: 64,
    badges: [
      { name: 'Verified Student', icon: CheckCircle2, color: 'text-[var(--trust-verified)]' },
      { name: 'Trusted Contributor', icon: Shield, color: 'text-[var(--trust-gold)]' },
    ],
  },
  'Maria Garcia': {
    name: 'Maria Garcia',
    avatar: 'MG',
    verified: true,
    joinDate: 'February 2024',
    location: 'Boston, MA',
    school: 'MIT',
    visaStatus: 'F-1 Student',
    credibilityScore: 92,
    helpfulnessScore: 90,
    accuracyHistory: 93,
    postsCount: 15,
    helpfulAnswers: 180,
    commentsCount: 102,
    badges: [
      { name: 'Verified Student', icon: CheckCircle2, color: 'text-[var(--trust-verified)]' },
      { name: 'Trusted Contributor', icon: Shield, color: 'text-[var(--trust-gold)]' },
      { name: 'Top Helper', icon: Award, color: 'text-[var(--bridge-blue)]' },
    ],
  },
  'Ahmed Hassan': {
    name: 'Ahmed Hassan',
    avatar: 'AH',
    verified: true,
    joinDate: 'April 2024',
    location: 'Chicago, IL',
    school: 'Northwestern',
    visaStatus: 'F-1 Student',
    credibilityScore: 88,
    helpfulnessScore: 86,
    accuracyHistory: 90,
    postsCount: 10,
    helpfulAnswers: 120,
    commentsCount: 78,
    badges: [
      { name: 'Verified Student', icon: CheckCircle2, color: 'text-[var(--trust-verified)]' },
      { name: 'Trusted Contributor', icon: Shield, color: 'text-[var(--trust-gold)]' },
    ],
  },
  'Li Wei': {
    name: 'Li Wei',
    avatar: 'LW',
    verified: false,
    joinDate: 'May 2024',
    location: 'San Francisco, CA',
    school: 'Stanford',
    visaStatus: 'F-1 Student',
    credibilityScore: 65,
    helpfulnessScore: 70,
    accuracyHistory: 72,
    postsCount: 5,
    helpfulAnswers: 42,
    commentsCount: 35,
    badges: [
      { name: 'Verified Student', icon: CheckCircle2, color: 'text-[var(--trust-verified)]' },
    ],
  },
};

export function ProfilePage({ userName, onPostClick, onAuthorClick, onAdminAccess }: ProfilePageProps) {
  // Get user data - either the specified user or the default current user
  const user = userName && mockUsers[userName] ? mockUsers[userName] : mockUsers['Sarah Chen'];

  // Get user's posts
  const userPosts = mockPosts.filter(post => post.author.name === user.name).slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile: Profile card at top */}
      <Card className="rounded-2xl border p-4 sm:p-6 shadow-sm lg:hidden">
        {/* Avatar and basic info */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)] text-2xl sm:text-3xl text-white">
            {user.avatar}
          </div>
          <div className="mb-2 flex items-center justify-center gap-2">
            <h2 className="text-lg sm:text-xl">{user.name}</h2>
            {user.verified && (
              <CheckCircle2 className="h-5 w-5 text-[var(--trust-verified)]" />
            )}
          </div>
          <Badge variant="secondary" className="rounded-lg text-xs sm:text-sm">
            {user.visaStatus}
          </Badge>
        </div>

        {/* Location and join date */}
        <div className="mb-4 space-y-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{user.location}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Joined {user.joinDate}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Activity stats - mobile grid */}
        <div className="mb-4">
          <h4 className="text-xs sm:text-sm text-muted-foreground mb-3 text-center">Contribution Stats</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="mb-1 text-lg sm:text-xl text-[var(--bridge-blue)]">{user.postsCount}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-lg sm:text-xl text-[var(--bridge-green)]">{user.helpfulAnswers}</div>
              <div className="text-xs text-muted-foreground">Helpful</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-lg sm:text-xl text-muted-foreground">{user.commentsCount}</div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Trust scores - mobile */}
        <div className="mb-4">
          <h4 className="text-xs sm:text-sm text-muted-foreground mb-3">Trust & Credibility</h4>
          
          <div className="space-y-3">
            {/* Credibility score */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs sm:text-sm">Credibility</span>
                <span className="text-xs sm:text-sm font-medium">{user.credibilityScore}%</span>
              </div>
              <Progress value={user.credibilityScore} className="h-2" />
            </div>

            {/* Helpfulness score */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs sm:text-sm">Helpfulness</span>
                <span className="text-xs sm:text-sm font-medium">{user.helpfulnessScore}%</span>
              </div>
              <Progress value={user.helpfulnessScore} className="h-2" />
            </div>

            {/* Accuracy history */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs sm:text-sm">Accuracy</span>
                <span className="text-xs sm:text-sm font-medium">{user.accuracyHistory}%</span>
              </div>
              <Progress value={user.accuracyHistory} className="h-2" />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Badges - mobile */}
        <div>
          <h4 className="text-xs sm:text-sm text-muted-foreground mb-3">Earned Badges</h4>
          <div className="space-y-2">
            {user.badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-center gap-3 rounded-lg bg-secondary p-2">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${badge.color}`} />
                  <span className="text-xs sm:text-sm">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Desktop layout */}
      <div className="hidden lg:flex gap-6">
        {/* Profile sidebar - desktop only */}
        <aside className="w-80 shrink-0">
          <Card className="sticky top-20 rounded-2xl border p-6 shadow-sm">
            {/* Avatar and basic info */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)] text-3xl text-white">
                {user.avatar}
              </div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <h2>{user.name}</h2>
                {user.verified && (
                  <CheckCircle2 className="h-5 w-5 text-[var(--trust-verified)]" />
                )}
              </div>
              <Badge variant="secondary" className="rounded-lg">
                {user.visaStatus}
              </Badge>
            </div>

            {/* Location and join date */}
            <div className="mb-6 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {user.joinDate}</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Trust scores */}
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground">Trust & Credibility</h4>
              
              {/* Credibility score */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Credibility Score</span>
                  <span className="text-sm">{user.credibilityScore}%</span>
                </div>
                <Progress value={user.credibilityScore} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on verification and community feedback
                </p>
              </div>

              {/* Helpfulness score */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Helpfulness Score</span>
                  <span className="text-sm">{user.helpfulnessScore}%</span>
                </div>
                <Progress value={user.helpfulnessScore} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on community ratings
                </p>
              </div>

              {/* Accuracy history */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Accuracy History</span>
                  <span className="text-sm">{user.accuracyHistory}%</span>
                </div>
                <Progress value={user.accuracyHistory} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Information accuracy verified by community
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Activity stats */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Contribution Stats</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="mb-1 text-xl text-[var(--bridge-blue)]">{user.postsCount}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-xl text-[var(--bridge-green)]">{user.helpfulAnswers}</div>
                  <div className="text-xs text-muted-foreground">Helpful</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-xl text-muted-foreground">{user.commentsCount}</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Badges */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Earned Badges</h4>
              <div className="space-y-2">
                {user.badges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 rounded-lg bg-secondary p-2">
                      <Icon className={`h-5 w-5 ${badge.color}`} />
                      <span className="text-sm">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Access Button */}
            {onAdminAccess && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onAdminAccess}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Access
                </Button>
              </div>
            )}
          </Card>
        </aside>

        {/* Main content - user's posts */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="mb-2">Contributions</h1>
            <p className="text-muted-foreground">
              Posts and answers by {user.name}
            </p>
          </div>

          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onClick={() => onPostClick?.(post)}
                />
              ))
            ) : (
              <Card className="rounded-2xl p-12 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  Start contributing to build your credibility
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: User posts below profile */}
      <div className="lg:hidden">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl mb-1">Contributions</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Posts and answers by {user.name}
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onClick={() => onPostClick?.(post)}
              />
            ))
          ) : (
            <Card className="rounded-2xl p-8 sm:p-12 text-center">
              <MessageCircle className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <h3 className="mb-2 text-base sm:text-lg">No posts yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Start contributing to build your credibility
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}