import { Shield, CheckCircle2, Award, MessageCircle, ThumbsUp, Calendar, MapPin, Settings, Pencil } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { PostCard, Post } from './PostCard';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuthStore } from '../store/auth';
import { getMyProfile, getProfileById, ProfileResponse, updateMyProfile } from '../api/profile';
import { listMyPosts, listPosts, PostResponse } from '../api/posts';
import { listMyReplies, ReplyResponse } from '../api/replies';
import { previewText } from '../utils/text';
import { listMyReports, ReportResponse } from '../api/reports';

interface ProfilePageProps {
  userId?: string;
  onPostClick?: (post: Post) => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
  onAdminAccess?: () => void;
}
export function ProfilePage({ userId, onPostClick, onAuthorClick, onAdminAccess }: ProfilePageProps) {
  const { t, i18n } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const language = i18n.language === 'zh' ? 'zh' : 'en';
  const isSelfView = !userId;
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    location: '',
    bio: '',
  });
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myReplies, setMyReplies] = useState<ReplyResponse[]>([]);
  const [myReports, setMyReports] = useState<ReportResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');

  const displayUser = useMemo(() => {
    const displayName = profile?.display_name || currentUser?.displayName || t('profile.anonymous');
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return {
      name: displayName,
      avatar: initials || 'U',
      verified: false,
      joinDate: t('profile.joinedUnknown'),
      location: profile?.location || t('profile.locationUnknown'),
      school: profile?.school_level || t('profile.schoolUnknown'),
      visaStatus: t('profile.visaStatus'),
      credibilityScore: profile?.credibility_score ?? 0,
      helpfulnessScore: profile?.helpfulness_score ?? 0,
      accuracyHistory: profile?.accuracy_score ?? 0,
      postsCount: myPosts.length,
      helpfulAnswers: 0,
      commentsCount: myReplies.length,
      badges: [],
    };
  }, [currentUser?.displayName, isSelfView, myPosts.length, myReplies.length, profile, t]);
  const user = displayUser;

  const mapPostResponse = (item: PostResponse): Post => {
    const displayName = item.author_name || `User ${item.author_id.slice(0, 6)}`;
    const timestamp = item.published_at || item.created_at || '';
    const dateText = timestamp ? new Date(timestamp).toLocaleString() : t('status.loading');
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

  const userPosts = myPosts;

  const fetchSelfPosts = async () => {
    try {
      const items = await listMyPosts({ language, limit: 20, offset: 0 });
      setMyPosts(items.map(mapPostResponse));
    } catch {
      setMyPosts([]);
    }
  };

  useEffect(() => {
    setProfileError(null);
    if (isSelfView) {
      getMyProfile()
        .then((data) => {
          setProfile(data);
          setProfileForm({
            display_name: data.display_name ?? '',
            location: data.location ?? '',
            bio: data.bio ?? '',
          });
        })
        .catch((err) => setProfileError(err instanceof Error ? err.message : 'Failed to load profile'));
      fetchSelfPosts();
      listMyReplies({ limit: 20, offset: 0 })
        .then((items) => setMyReplies(items))
        .catch(() => setMyReplies([]));
      listMyReports(20, 0)
        .then((items) => setMyReports(items))
        .catch(() => setMyReports([]));
    } else if (userId) {
      getProfileById(userId)
        .then((data) => {
          setProfile(data);
        })
        .catch((err) => setProfileError(err instanceof Error ? err.message : 'Failed to load profile'));
      listPosts({ language, limit: 20, offset: 0, authorId: userId })
        .then((items) => setMyPosts(items.map(mapPostResponse)))
        .catch(() => setMyPosts([]));
      setMyReplies([]);
      setMyReports([]);
    }
  }, [isSelfView, language, userId]);

  useEffect(() => {
    if (!isSelfView) {
      return;
    }
    const interval = window.setInterval(() => {
      fetchSelfPosts();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [isSelfView, language]);

  const handleProfileSave = async () => {
    const updated = await updateMyProfile({
      display_name: profileForm.display_name.trim(),
      location: profileForm.location.trim() || null,
      bio: profileForm.bio.trim() || null,
    });
    setProfile(updated);
    if (currentUser?.email) {
      setUser({
        email: currentUser.email,
        userId: currentUser.userId,
        role: currentUser.role,
        isRoot: currentUser.isRoot,
        displayName: updated.display_name || currentUser.displayName,
        languagePreference: currentUser.languagePreference,
      });
    }
    setIsEditing(false);
  };


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
            <span>{t('profile.joined', { date: user.joinDate })}</span>
          </div>
        </div>

        {profileError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {profileError}
          </div>
        )}

        {isSelfView && (
          <div className="mb-4">
            {!isEditing ? (
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t('profile.editProfile')}
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, display_name: e.target.value }))}
                  placeholder={t('profile.displayName')}
                  className="rounded-xl"
                />
                <Input
                  value={profileForm.location}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder={t('profile.location')}
                  className="rounded-xl"
                />
                <Textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder={t('profile.bio')}
                  className="rounded-xl"
                />
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-xl" onClick={handleProfileSave}>
                    {t('profile.save')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-xl"
                    onClick={() => setIsEditing(false)}
                  >
                    {t('profile.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator className="my-4" />

        {/* Activity stats - mobile grid */}
        <div className="mb-4">
          <h4 className="text-xs sm:text-sm text-muted-foreground mb-3 text-center">{t('profile.stats')}</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="mb-1 text-lg sm:text-xl text-[var(--bridge-blue)]">{user.postsCount}</div>
              <div className="text-xs text-muted-foreground">{t('profile.posts')}</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-lg sm:text-xl text-[var(--bridge-green)]">{user.helpfulAnswers}</div>
              <div className="text-xs text-muted-foreground">{t('profile.helpful')}</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-lg sm:text-xl text-muted-foreground">{user.commentsCount}</div>
              <div className="text-xs text-muted-foreground">{t('profile.comments')}</div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Trust scores - mobile */}
        <div className="mb-4">
          <h4 className="text-xs sm:text-sm text-muted-foreground mb-3">{t('profile.trust')}</h4>
          
          <div className="space-y-3">
            {/* Helpfulness score */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs sm:text-sm">Helpfulness</span>
                <span className="text-xs sm:text-sm font-medium">{user.helpfulnessScore}%</span>
              </div>
              <Progress value={user.helpfulnessScore} className="h-2" />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Badges - mobile */}
        <div>
          <h4 className="text-xs sm:text-sm text-muted-foreground mb-3">{t('profile.badges')}</h4>
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
            <span>{t('profile.joined', { date: user.joinDate })}</span>
              </div>
            </div>

            {profileError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {profileError}
              </div>
            )}

            {isSelfView && (
              <div className="mb-6">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('profile.editProfile')}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Input
                      value={profileForm.display_name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, display_name: e.target.value }))}
                      placeholder={t('profile.displayName')}
                      className="rounded-xl"
                    />
                    <Input
                      value={profileForm.location}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder={t('profile.location')}
                      className="rounded-xl"
                    />
                    <Textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder={t('profile.bio')}
                      className="rounded-xl"
                    />
                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-xl" onClick={handleProfileSave}>
                        {t('profile.save')}
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-xl"
                        onClick={() => setIsEditing(false)}
                      >
                        {t('profile.cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator className="my-6" />

            {/* Trust scores */}
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground">{t('profile.trust')}</h4>
              
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
            </div>

            <Separator className="my-6" />

            {/* Activity stats */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">{t('profile.stats')}</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="mb-1 text-xl text-[var(--bridge-blue)]">{user.postsCount}</div>
                  <div className="text-xs text-muted-foreground">{t('profile.posts')}</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-xl text-[var(--bridge-green)]">{user.helpfulAnswers}</div>
                  <div className="text-xs text-muted-foreground">{t('profile.helpful')}</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-xl text-muted-foreground">{user.commentsCount}</div>
                  <div className="text-xs text-muted-foreground">{t('profile.comments')}</div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Badges */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">{t('profile.badges')}</h4>
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
            {onAdminAccess && currentUser?.role === 'admin' && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onAdminAccess}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t('profile.adminAccess')}
                </Button>
              </div>
            )}
          </Card>
        </aside>

        {/* Main content - user's activity */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="mb-2">{t('profile.contributions')}</h1>
            <p className="text-muted-foreground">
              {t('profile.contributionsSubtitle', { name: user.name })}
            </p>
          </div>

          {isSelfView && (
            <div className="mb-4 flex gap-2 border-b">
              {['posts', 'replies'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-[var(--bridge-blue)] text-[var(--bridge-blue)]'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`profile.tabs.${tab}`)}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {activeTab === 'posts' && (
              <>
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => onPostClick?.(post)}
                      showStatus={isSelfView}
                    />
                  ))
                ) : (
                  <Card className="rounded-2xl p-12 text-center">
                    <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2">{t('profile.noPosts')}</h3>
                    <p className="text-muted-foreground">{t('profile.noPostsDesc')}</p>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'replies' && (
              <>
                {myReplies.length > 0 ? (
                  myReplies.map((reply) => (
                    <Card key={reply.id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.replyTo', { id: reply.post_id.slice(0, 6) })}
                          </p>
                          <p className="mt-2 text-sm">{reply.content}</p>
                        </div>
                        <Badge variant="secondary" className="rounded-lg text-xs">
                          {reply.status}
                        </Badge>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="rounded-2xl p-12 text-center">
                    <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2">{t('profile.noReplies')}</h3>
                    <p className="text-muted-foreground">{t('profile.noRepliesDesc')}</p>
                  </Card>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* Mobile: User posts below profile */}
      <div className="lg:hidden">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl mb-1">{t('profile.contributions')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('profile.contributionsSubtitle', { name: user.name })}
          </p>
        </div>

        {isSelfView && (
          <div className="mb-4 flex gap-2 border-b">
            {['posts', 'replies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-3 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-[var(--bridge-blue)] text-[var(--bridge-blue)]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`profile.tabs.${tab}`)}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {activeTab === 'posts' && (
            <>
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
                  <h3 className="mb-2 text-base sm:text-lg">{t('profile.noPosts')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {t('profile.noPostsDesc')}
                  </p>
                </Card>
              )}
            </>
          )}

          {activeTab === 'replies' && (
            <>
              {myReplies.length > 0 ? (
                myReplies.map((reply) => (
                  <Card key={reply.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t('profile.replyTo', { id: reply.post_id.slice(0, 6) })}
                        </p>
                        <p className="mt-2 text-sm">{reply.content}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        {reply.status}
                      </Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="rounded-2xl p-8 sm:p-12 text-center">
                  <MessageCircle className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-base sm:text-lg">{t('profile.noReplies')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {t('profile.noRepliesDesc')}
                  </p>
                </Card>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}