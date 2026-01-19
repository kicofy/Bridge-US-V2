import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationDropdown, Notification } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { use3DHover } from '../hooks/use3DHover';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  language: string;
  onLanguageToggle: () => void;
  currentUser: { email: string; username: string } | null;
  onLogout: () => void;
}

export function Navigation({ currentPage, onNavigate, language, onLanguageToggle, currentUser, onLogout }: NavigationProps) {
  const logo3D = use3DHover({ maxRotation: 8, scale: 1.05 });
  const homeBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const searchBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const aiBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const langBtn3D = use3DHover({ maxRotation: 6, scale: 1.05 });

  const handleNotificationClick = (notification: Notification) => {
    // Handle notification click - could navigate to related post/page
    console.log('Notification clicked:', notification);
    // Example: if notification has a link, navigate there
    // if (notification.link) {
    //   onNavigate(notification.link);
    // }
  };

  const handleViewAllNotifications = () => {
    onNavigate('notifications');
  };

  return (
    <nav className="sticky top-0 z-50 border-b glass-strong">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button 
            ref={logo3D.ref}
            style={logo3D.style}
            onMouseMove={logo3D.onMouseMove}
            onMouseEnter={logo3D.onMouseEnter}
            onMouseLeave={logo3D.onMouseLeave}
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)]">
              <span className="text-xl text-white">🌉</span>
            </div>
            <span className="text-lg sm:text-xl text-[var(--bridge-blue)]">BridgeUS</span>
          </button>

          {/* Desktop nav links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <button
              ref={homeBtn3D.ref}
              style={homeBtn3D.style}
              onMouseMove={homeBtn3D.onMouseMove}
              onMouseEnter={homeBtn3D.onMouseEnter}
              onMouseLeave={homeBtn3D.onMouseLeave}
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === 'home' 
                  ? 'bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] font-medium' 
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              Home
            </button>
            <button
              ref={searchBtn3D.ref}
              style={searchBtn3D.style}
              onMouseMove={searchBtn3D.onMouseMove}
              onMouseEnter={searchBtn3D.onMouseEnter}
              onMouseLeave={searchBtn3D.onMouseLeave}
              onClick={() => onNavigate('search')}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === 'search' 
                  ? 'bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] font-medium' 
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              Search
            </button>
            <button
              ref={aiBtn3D.ref}
              style={aiBtn3D.style}
              onMouseMove={aiBtn3D.onMouseMove}
              onMouseEnter={aiBtn3D.onMouseEnter}
              onMouseLeave={aiBtn3D.onMouseLeave}
              onClick={() => onNavigate('ai-qa')}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === 'ai-qa' 
                  ? 'bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] font-medium' 
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              AI Q&A
            </button>
            <ProfileDropdown
              userName={currentUser?.username || 'User'}
              isActive={currentPage === 'profile'}
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <div
              ref={langBtn3D.ref}
              style={langBtn3D.style}
              onMouseMove={langBtn3D.onMouseMove}
              onMouseEnter={langBtn3D.onMouseEnter}
              onMouseLeave={langBtn3D.onMouseLeave}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onLanguageToggle}
                className="rounded-xl gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{language === 'en' ? 'EN' : '中文'}</span>
              </Button>
            </div>
            <NotificationDropdown
              onNotificationClick={handleNotificationClick}
              onViewAll={handleViewAllNotifications}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}