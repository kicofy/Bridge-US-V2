import { Globe, Menu } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  language: string;
  onLanguageToggle: () => void;
}

export function Navigation({ currentPage, onNavigate, language, onLanguageToggle }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button 
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
              onClick={() => onNavigate('ai-qa')}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === 'ai-qa' 
                  ? 'bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] font-medium' 
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              AI Q&A
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === 'profile' 
                  ? 'bg-[var(--bridge-blue)] text-white font-medium' 
                  : 'text-foreground hover:bg-secondary border'
              }`}
            >
              Profile
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>
    </nav>
  );
}