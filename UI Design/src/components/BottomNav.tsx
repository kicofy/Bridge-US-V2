import { Home, Search, MessageCircle, User } from 'lucide-react';
import { cn } from './ui/utils';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'ai-qa', label: 'AI Q&A', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[70px]",
                isActive
                  ? "text-[var(--bridge-blue)]"
                  : "text-muted-foreground active:bg-secondary"
              )}
            >
              <div className={cn(
                "flex items-center justify-center transition-all",
                isActive && "scale-110"
              )}>
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-all",
                    isActive && "stroke-[2.5]"
                  )} 
                />
              </div>
              <span className={cn(
                "text-xs transition-all",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
