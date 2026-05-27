import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { BottomNav } from './components/BottomNav';
import { CategorySidebar } from './components/CategorySidebar';
import { HomePage } from './components/HomePage';
import { CreatePostButton } from './components/CreatePostButton';
import { previewText } from './utils/text';
import { Post } from './components/PostCard';
import { Notification } from './components/NotificationDropdown';
import { ApiError } from './api/client';
import { getPost, PostResponse } from './api/posts';
import { getMyProfile, updateMyProfile } from './api/profile';
import { useAuthStore } from './store/auth';
import { setLanguage, LanguageCode, supportedLanguages } from './i18n';
import { useTranslation } from 'react-i18next';

const AuthPage = lazy(() => import('./components/AuthPage').then((module) => ({ default: module.AuthPage })));
const SearchPage = lazy(() => import('./components/SearchPage').then((module) => ({ default: module.SearchPage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AIQAPage = lazy(() => import('./components/AIQAPage').then((module) => ({ default: module.AIQAPage })));
const PostDetailPage = lazy(() => import('./components/PostDetailPage').then((module) => ({ default: module.PostDetailPage })));
const NotificationsPage = lazy(() => import('./components/NotificationsPage').then((module) => ({ default: module.NotificationsPage })));
const CreatePostPage = lazy(() => import('./components/CreatePostPage').then((module) => ({ default: module.CreatePostPage })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const SettingsPage = lazy(() => import('./components/SettingsPage').then((module) => ({ default: module.SettingsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const { i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const language: LanguageCode = supportedLanguages.includes(i18n.language as LanguageCode)
    ? (i18n.language as LanguageCode)
    : 'en';
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const profileLoadedRef = useRef(false);

  const currentPage = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password')) {
      return 'auth';
    }
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/ai')) return 'ai-qa';
    if (path.startsWith('/users') || path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/posts/new')) return 'create-post';
    if (path.startsWith('/posts/')) return 'post-detail';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/settings')) return 'settings';
    return 'home';
  }, [location.pathname]);

  const backgroundClass = useMemo(() => 'aurora-bg', []);

  useEffect(() => {
    document.title = getRouteTitle({
      currentPage,
      pathname: location.pathname,
      currentUserName: currentUser?.displayName,
      language,
    });
  }, [currentPage, currentUser?.displayName, language, location.pathname]);

  const handleLanguageChange = (next: LanguageCode) => {
    setLanguage(next);
    if (isAuthenticated) {
      updateMyProfile({ language_preference: next }).catch(() => {
        // Ignore update errors for now
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated || profileLoadedRef.current) {
      return;
    }
    profileLoadedRef.current = true;
    getMyProfile()
      .then((profile) => {
        if (profile.language_preference === 'en' || profile.language_preference === 'zh') {
          setLanguage(profile.language_preference);
        }
        if (currentUser?.email) {
          const displayName = profile.display_name || currentUser.displayName;
          setUser({
            email: currentUser.email,
            userId: profile.user_id,
            role: currentUser.role,
            isRoot: currentUser.isRoot,
            displayName: displayName,
            languagePreference: profile.language_preference,
          });
        }
      })
      .catch(() => {
        profileLoadedRef.current = false;
      });
  }, [isAuthenticated, currentUser?.email, currentUser?.displayName, setUser]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    navigate(`/posts/${post.id}`);
  };

  const handleAuthorClick = (authorId: string, _authorName: string) => {
    setSelectedUserId(authorId);
    navigate(`/users/${encodeURIComponent(authorId)}`);
  };

  const handleBackToPosts = () => {
    setSelectedPost(null);
    navigate('/');
  };

  const handleNavigate = (page: string) => {
    const pageRoutes: Record<string, string> = {
      home: '/',
      search: '/search',
      'ai-qa': '/ai',
      profile: '/profile',
      notifications: '/notifications',
      'create-post': '/posts/new',
      'admin-secret-access': '/admin',
      settings: '/settings',
      login: '/login',
    };
    const target = pageRoutes[page] ?? '/';
    navigate(target);
    if (page === 'profile') {
      setSelectedUserId(null);
    }
  };

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;
    const isAuthRoute =
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register') ||
      location.pathname.startsWith('/forgot-password');
    const isProtectedRoute = isProtectedPath(location.pathname);
    if (!isAuthRoute && !(isProtectedRoute && !isAuthenticated)) {
      sessionStorage.setItem('lastNonAuthPath', path);
    }
  }, [isAuthenticated, location.pathname, location.search, location.hash]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate('/notifications');
    }
  };

  const handlePublishPost = (newPost: PostResponse) => {
    const mapped = mapPostResponse(newPost);
    setSelectedPost(mapped);
    navigate(`/posts/${newPost.id}?created=1`);
  };

  return (
    <div className={`min-h-screen bg-background pb-16 md:pb-0 ${backgroundClass}`}>
      {currentPage === 'auth' ? (
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/login" element={<GuestOnly><AuthPage initialView="login" /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><AuthPage initialView="register" /></GuestOnly>} />
            <Route path="/forgot-password" element={<GuestOnly><AuthPage initialView="forgot-password" /></GuestOnly>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      ) : (
        <>
          <Navigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            language={language}
            onLanguageChange={handleLanguageChange}
            onNotificationClick={handleNotificationClick}
          />

          <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
            <div className="flex gap-4 lg:gap-6">
              {currentPage === 'home' && (
                <CategorySidebar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              <main className="flex-1 min-w-0">
                <Suspense fallback={<RouteLoading />}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomePage
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        onPostClick={handlePostClick}
                        onAuthorClick={handleAuthorClick}
                        language={language}
                      />
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <SearchPage
                        onPostClick={handlePostClick}
                        onAuthorClick={handleAuthorClick}
                        language={language}
                      />
                    }
                  />
                  <Route
                    path="/ai"
                    element={
                      <RequireAuth isAuthenticated={isAuthenticated}>
                        <AIQAPage language={language} />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/posts/new"
                    element={
                      <RequireAuth isAuthenticated={isAuthenticated}>
                        <CreatePostPage
                          onBack={() => navigate('/')}
                          onPublish={handlePublishPost}
                          language={language}
                        />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/posts/:id"
                    element={
                      <PostDetailRoute
                        selectedPost={selectedPost}
                        onBack={handleBackToPosts}
                        onAuthorClick={handleAuthorClick}
                        language={language}
                            isAuthenticated={isAuthenticated}
                      />
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth isAuthenticated={isAuthenticated}>
                        <ProfilePage
                          userId={selectedUserId || undefined}
                          onPostClick={handlePostClick}
                          onAuthorClick={handleAuthorClick}
                          onAdminAccess={() => navigate('/admin')}
                        />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/users/:username"
                    element={
                      <ProfileRoute
                        selectedUserId={selectedUserId}
                        onPostClick={handlePostClick}
                        onAuthorClick={handleAuthorClick}
                        onAdminAccess={() => navigate('/admin')}
                      />
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <RequireAuth isAuthenticated={isAuthenticated}>
                        <NotificationsPage onNotificationClick={handleNotificationClick} />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <RequireAuth isAuthenticated={isAuthenticated}>
                        <AdminDashboard onExit={() => navigate('/')} />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <RequireAuth isAuthenticated={isAuthenticated}>
                        <SettingsPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
                  <Route path="/forgot-password" element={<Navigate to="/" replace />} />
                </Routes>
                </Suspense>
              </main>
            </div>
          </div>

          {/* Floating Create Post Button - hidden on create post page */}
          {currentPage !== 'create-post' && (
            <CreatePostButton onClick={() => navigate('/posts/new')} />
          )}

          {/* Mobile bottom navigation */}
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
}

function RouteLoading() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-2xl border bg-white/70" />
      <div className="h-40 animate-pulse rounded-2xl border bg-white/70" />
    </div>
  );
}

function PostDetailRoute({ selectedPost, onBack, onAuthorClick, language, isAuthenticated }: {
  selectedPost: Post | null;
  onBack: () => void;
  onAuthorClick: (authorId: string, authorName: string) => void;
  language: string;
  isAuthenticated: boolean;
}) {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(selectedPost ?? null);
  const [error, setError] = useState<string | null>(null);

  const requestPost = async (targetLanguage: string) => {
    if (!id) {
      throw new Error('Post not found');
    }
    const data = await getPost(id, targetLanguage, isAuthenticated);
    const mapped = mapPostResponse(data);
    setPost(mapped);
    return mapped;
  };

  useEffect(() => {
    if (!id) {
      setError('Post not found');
      return;
    }
    if (selectedPost) {
      setPost(selectedPost);
    }
    requestPost(language).catch((err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to load post';
      setPost(null);
      setError(message);
    });
  }, [id, language, selectedPost, isAuthenticated]);

  useEffect(() => {
    if (post?.title) {
      document.title = formatDocumentTitle(post.title);
    }
  }, [post?.title]);

  if (!post) {
    return error ? (
      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    ) : null;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <PostDetailPage
        post={post}
        onBack={onBack}
        onAuthorClick={onAuthorClick}
      />
    </>
  );
}

function ProfileRoute({ selectedUserId, onPostClick, onAuthorClick, onAdminAccess }: {
  selectedUserId: string | null;
  onPostClick: (post: Post) => void;
  onAuthorClick: (authorId: string, authorName: string) => void;
  onAdminAccess: () => void;
}) {
  const { username } = useParams();
  const resolvedId = username ? decodeURIComponent(username) : selectedUserId || undefined;

  return (
    <ProfilePage
      userId={resolvedId}
      onPostClick={onPostClick}
      onAuthorClick={onAuthorClick}
      onAdminAccess={onAdminAccess}
    />
  );
}

function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthenticated) {
    const target = location.pathname + location.search + location.hash;
    try {
      sessionStorage.setItem('authRedirectPath', target);
    } catch {
      // Ignore storage failures and still show login.
    }
    return <Navigate to="/login" replace />;
  }
  return children;
}

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith('/ai') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/posts/new') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/settings')
  );
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function mapPostResponse(item: PostResponse): Post {
  const displayName = item.author_name || `User ${item.author_id.slice(0, 6)}`;
  const timestamp = item.published_at || item.created_at || '';
  const dateText = timestamp ? new Date(timestamp).toLocaleString() : 'Just now';
  const accuracyScore = item.accuracy_count > 0 ? Math.round(item.accuracy_avg) : 0;
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
    accuracyScore,
    helpfulCount: item.helpful_count,
    replyCount: 0,
    timestamp: dateText,
  };
}

function getRouteTitle({
  currentPage,
  pathname,
  currentUserName,
  language,
}: {
  currentPage: string;
  pathname: string;
  currentUserName?: string | null;
  language: string;
}) {
  const isZh = language === 'zh';
  const appName = 'BridgeUS';
  const titles: Record<string, string> = isZh
    ? {
        home: '首页',
        search: '搜索',
        'ai-qa': 'AI 问答',
        profile: pathname.startsWith('/users/')
          ? '用户资料'
          : currentUserName
            ? `${currentUserName} 的资料`
            : '我的资料',
        notifications: '通知',
        'create-post': '发布新帖子',
        'post-detail': '帖子详情',
        admin: '管理后台',
        settings: '设置',
      }
    : {
        home: 'Home',
        search: 'Search',
        'ai-qa': 'AI Q&A',
        profile: pathname.startsWith('/users/')
          ? 'User Profile'
          : currentUserName
            ? `${currentUserName}'s Profile`
            : 'My Profile',
        notifications: 'Notifications',
        'create-post': 'New Post',
        'post-detail': 'Post',
        admin: 'Admin',
        settings: 'Settings',
      };

  if (pathname.startsWith('/login')) {
    return `${isZh ? '登录' : 'Log In'} | ${appName}`;
  }
  if (pathname.startsWith('/register')) {
    return `${isZh ? '注册' : 'Sign Up'} | ${appName}`;
  }
  if (pathname.startsWith('/forgot-password')) {
    return `${isZh ? '找回密码' : 'Reset Password'} | ${appName}`;
  }
  const title = titles[currentPage] ?? titles.home;
  return currentPage === 'home' ? appName : `${title} | ${appName}`;
}

function formatDocumentTitle(title: string) {
  const cleanTitle = title.trim().replace(/\s+/g, ' ');
  const maxLength = 70;
  return cleanTitle.length > maxLength ? `${cleanTitle.slice(0, maxLength - 1)}… | BridgeUS` : `${cleanTitle} | BridgeUS`;
}
