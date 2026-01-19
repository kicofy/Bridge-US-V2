import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthPage } from './components/AuthPage';
import { Navigation } from './components/Navigation';
import { BottomNav } from './components/BottomNav';
import { CategorySidebar } from './components/CategorySidebar';
import { HomePage } from './components/HomePage';
import { SearchPage } from './components/SearchPage';
import { ProfilePage } from './components/ProfilePage';
import { AIQAPage } from './components/AIQAPage';
import { PostDetailPage } from './components/PostDetailPage';
import { NotificationsPage } from './components/NotificationsPage';
import { CreatePostPage, NewPost } from './components/CreatePostPage';
import { CreatePostButton } from './components/CreatePostButton';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsPage } from './components/SettingsPage';
import { Post } from './components/PostCard';
import { Notification } from './components/NotificationDropdown';
import { mockPosts } from './lib/mockData';
import { ApiError } from './api/client';
import { getPost, PostResponse } from './api/posts';
import { getMyProfile, updateMyProfile } from './api/profile';
import { useAuthStore } from './store/auth';
import { setLanguage } from './i18n';
import { useTranslation } from 'react-i18next';

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
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const language = i18n.language === 'zh' ? 'zh' : 'en';
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

  const backgroundClass = useMemo(() => {
    if (currentPage === 'auth') return '';
    switch (currentPage) {
      case 'search':
        return 'grid-wave-bg';
      case 'ai-qa':
        return 'stars-bg';
      case 'profile':
      case 'notifications':
        return 'orbs-bg';
      case 'admin':
      case 'settings':
        return 'noise-bg';
      case 'create-post':
      case 'post-detail':
        return 'aurora-bg';
      case 'home':
      default:
        return 'aurora-bg';
    }
  }, [currentPage]);

  const handleLanguageToggle = () => {
    const next = language === 'en' ? 'zh' : 'en';
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

  const handleAuthorClick = (authorName: string) => {
    setSelectedUserName(authorName);
    navigate(`/users/${encodeURIComponent(authorName)}`);
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
      // Reset to show current user's profile
      setSelectedUserName(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Handle notification click - could navigate to related content
    console.log('Notification clicked:', notification);
    // Example: navigate to the related post
  };

  const handlePublishPost = (newPost: NewPost) => {
    // In a real app, this would send the post to the backend
    console.log('New post published:', newPost);
    
    // Show success message (could use toast notification)
    alert('Your post has been published successfully!');
    
    // Navigate to home to see the new post
    navigate('/');
  };

  return (
    <div className={`min-h-screen bg-background pb-16 md:pb-0 ${backgroundClass}`}>
      {currentPage === 'auth' ? (
        <Routes>
          <Route path="/login" element={<GuestOnly><AuthPage initialView="login" /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><AuthPage initialView="register" /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><AuthPage initialView="forgot-password" /></GuestOnly>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <Navigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            language={language}
            onLanguageToggle={handleLanguageToggle}
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
                      />
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth isAuthenticated={isAuthenticated}>
                        <ProfilePage
                          userName={currentUser?.displayName || selectedUserName || undefined}
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
                        selectedUserName={selectedUserName}
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

function PostDetailRoute({ selectedPost, onBack, onAuthorClick, language }: {
  selectedPost: Post | null;
  onBack: () => void;
  onAuthorClick: (authorName: string) => void;
  language: string;
}) {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(selectedPost ?? null);
  const [error, setError] = useState<string | null>(null);

  const requestPost = async (targetLanguage: string) => {
    if (!id) {
      throw new Error('Post not found');
    }
    const data = await getPost(id, targetLanguage);
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
      return;
    }
    requestPost(language).catch((err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to load post';
      setError(message);
    });
  }, [id, language, selectedPost]);

  const resolvedPost = post || mockPosts.find((item) => item.id === id) || mockPosts[0];

  return (
    <>
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <PostDetailPage
        post={resolvedPost}
        onBack={onBack}
        onAuthorClick={onAuthorClick}
      />
    </>
  );
}

function ProfileRoute({ selectedUserName, onPostClick, onAuthorClick, onAdminAccess }: {
  selectedUserName: string | null;
  onPostClick: (post: Post) => void;
  onAuthorClick: (authorName: string) => void;
  onAdminAccess: () => void;
}) {
  const { username } = useParams();
  const resolvedName = username ? decodeURIComponent(username) : selectedUserName || undefined;

  return (
    <ProfilePage
      userName={resolvedName}
      onPostClick={onPostClick}
      onAuthorClick={onAuthorClick}
      onAdminAccess={onAdminAccess}
    />
  );
}

function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: JSX.Element }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function mapPostResponse(item: PostResponse): Post {
  const displayName = `User ${item.author_id.slice(0, 6)}`;
  const timestamp = item.published_at || item.created_at || '';
  const dateText = timestamp ? new Date(timestamp).toLocaleString() : 'Just now';
  const accuracyScore = item.accuracy_count > 0 ? Math.round(item.accuracy_avg) : 0;
  const preview = item.content.replace(/\s+/g, ' ').trim();
  const clipped = preview.length > 160 ? `${preview.slice(0, 160)}...` : preview;
  return {
    id: item.id,
    title: item.title,
    preview: clipped,
    content: item.content,
    createdAt: timestamp || undefined,
    notHelpfulCount: 0,
    tags: item.tags,
    author: {
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