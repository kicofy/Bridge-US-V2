import { useState } from 'react';
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
import { Post } from './components/PostCard';
import { Notification } from './components/NotificationDropdown';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; username: string } | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [language, setLanguage] = useState('en');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [unreadNotifications] = useState(2); // Mock unread count
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleAuthSuccess = (userData: { email: string; username: string }) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setCurrentPage('post-detail');
  };

  const handleAuthorClick = (authorName: string) => {
    setSelectedUserName(authorName);
    setCurrentPage('profile');
  };

  const handleBackToPosts = () => {
    setSelectedPost(null);
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'profile') {
      // Reset to show current user's profile
      setSelectedUserName(null);
    }
    // Secret admin access: triple click on AI Q&A
    if (page === 'admin-secret-access') {
      setIsAdminMode(true);
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
    setCurrentPage('home');
  };

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    setCurrentPage('home');
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Admin Mode View
  if (isAdminMode) {
    return <AdminDashboard onExit={handleExitAdmin} />;
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 aurora-bg">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        language={language}
        onLanguageToggle={handleLanguageToggle}
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
        <div className="flex gap-4 lg:gap-6">
          {currentPage === 'home' && !selectedPost && (
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}

          <main className="flex-1 min-w-0">
            {currentPage === 'home' && !selectedPost && (
              <HomePage 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory}
                onPostClick={handlePostClick}
                onAuthorClick={handleAuthorClick}
                language={language} 
              />
            )}
            {currentPage === 'post-detail' && selectedPost && (
              <PostDetailPage
                post={selectedPost}
                onBack={handleBackToPosts}
                onAuthorClick={handleAuthorClick}
                language={language}
              />
            )}
            {currentPage === 'search' && <SearchPage onPostClick={handlePostClick} onAuthorClick={handleAuthorClick} />}
            {currentPage === 'ai-qa' && <AIQAPage language={language} />}
            {currentPage === 'profile' && <ProfilePage userName={selectedUserName || undefined} onPostClick={handlePostClick} onAuthorClick={handleAuthorClick} onAdminAccess={() => setIsAdminMode(true)} />}
            {currentPage === 'notifications' && <NotificationsPage onNotificationClick={handleNotificationClick} />}
            {currentPage === 'create-post' && (
              <CreatePostPage 
                onBack={() => setCurrentPage('home')}
                onPublish={handlePublishPost}
              />
            )}
          </main>
        </div>
      </div>

      {/* Floating Create Post Button - hidden on create post page */}
      {currentPage !== 'create-post' && (
        <CreatePostButton onClick={() => setCurrentPage('create-post')} />
      )}

      {/* Mobile bottom navigation */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}