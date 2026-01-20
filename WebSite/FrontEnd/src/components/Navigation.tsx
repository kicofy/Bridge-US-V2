import { Globe, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { NotificationDropdown, Notification } from './NotificationDropdown';
import { use3DHover } from '../hooks/use3DHover';
import { useAuthStore } from '../store/auth';
import { logoutUser } from '../api/auth';
import { useRef, useState } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  language: string;
  onLanguageToggle: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export function Navigation({
  currentPage,
  onNavigate,
  language,
  onLanguageToggle,
  onNotificationClick,
}: NavigationProps) {
  const { t, i18n } = useTranslation();
  const { refreshToken, clear, accessToken } = useAuthStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileCloseTimer = useRef<number | null>(null);
  const logo3D = use3DHover({ maxRotation: 8, scale: 1.05 });
  const homeBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const searchBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const aiBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const profileBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const langBtn3D = use3DHover({ maxRotation: 6, scale: 1.05 });
  const isAuthenticated = Boolean(accessToken);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
  };

  const handleViewAllNotifications = () => {
    onNavigate('notifications');
  };

  const handleLanguageChange = () => {
    onLanguageToggle();
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } finally {
      clear();
      onNavigate('login');
    }
  };

  const clearProfileCloseTimer = () => {
    if (profileCloseTimer.current !== null) {
      window.clearTimeout(profileCloseTimer.current);
      profileCloseTimer.current = null;
    }
  };

  const scheduleProfileClose = () => {
    clearProfileCloseTimer();
    profileCloseTimer.current = window.setTimeout(() => setProfileMenuOpen(false), 200);
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 p-1 shadow-sm">
              <img src="/Logo.png" alt="BridgeUS Logo" className="h-full w-full object-contain" />
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
              {t('nav.home')}
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
              {t('nav.search')}
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
              {t('nav.ai')}
            </button>
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={() => {
                  clearProfileCloseTimer();
                  setProfileMenuOpen(true);
                }}
                onMouseLeave={scheduleProfileClose}
              >
                <button
                  ref={profileBtn3D.ref}
                  style={profileBtn3D.style}
                  onMouseMove={profileBtn3D.onMouseMove}
                  onMouseEnter={profileBtn3D.onMouseEnter}
                  onMouseLeave={profileBtn3D.onMouseLeave}
                  onClick={() => onNavigate('profile')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    currentPage === 'profile'
                      ? 'bg-[var(--bridge-blue)] text-white font-medium'
                      : 'text-foreground hover:bg-secondary border'
                  }`}
                >
                  {t('nav.profile')}
                </button>
                {profileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 rounded-xl border bg-white shadow-lg z-50"
                    onMouseEnter={clearProfileCloseTimer}
                    onMouseLeave={scheduleProfileClose}
                  >
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted whitespace-nowrap"
                    >
                      <Settings className="h-4 w-4" />
                      {t('actions.settings')}
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 whitespace-nowrap"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('actions.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                ref={profileBtn3D.ref}
                style={profileBtn3D.style}
                onMouseMove={profileBtn3D.onMouseMove}
                onMouseEnter={profileBtn3D.onMouseEnter}
                onMouseLeave={profileBtn3D.onMouseLeave}
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-xl transition-all text-foreground hover:bg-secondary border"
              >
                {t('actions.login')}
              </button>
            )}
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
                onClick={handleLanguageChange}
                className="rounded-xl gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">
                  {language === 'en' ? 'EN' : language === 'zh' ? '中文' : 'KO'}
                </span>
              </Button>
            </div>
            {isAuthenticated && (
              <NotificationDropdown
                onNotificationClick={handleNotificationClick}
                onViewAll={handleViewAllNotifications}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}