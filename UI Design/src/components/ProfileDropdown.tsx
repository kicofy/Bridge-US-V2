import { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, User } from 'lucide-react';
import { use3DHover } from '../hooks/use3DHover';

interface ProfileDropdownProps {
  userName: string;
  isActive: boolean;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ProfileDropdown({ userName, isActive, onNavigate, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const profileBtn3D = use3DHover({ maxRotation: 6, scale: 1.03 });
  const dropdownItem1_3D = use3DHover({ maxRotation: 4, scale: 1.02 });
  const dropdownItem2_3D = use3DHover({ maxRotation: 4, scale: 1.02 });

  // Close dropdown when mouse leaves both button and dropdown
  useEffect(() => {
    if (!isHoveringButton && !isHoveringDropdown) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 150);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsOpen(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHoveringButton, isHoveringDropdown]);

  const handleProfileClick = () => {
    setIsOpen(false);
    setIsHoveringButton(false);
    setIsHoveringDropdown(false);
    onNavigate('profile');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    setIsHoveringButton(false);
    setIsHoveringDropdown(false);
    onNavigate('settings');
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    setIsHoveringButton(false);
    setIsHoveringDropdown(false);
    onLogout();
  };

  return (
    <div className="relative">
      <button
        ref={profileBtn3D.ref}
        style={profileBtn3D.style}
        onMouseMove={profileBtn3D.onMouseMove}
        onMouseEnter={(e) => {
          profileBtn3D.onMouseEnter(e);
          setIsHoveringButton(true);
        }}
        onMouseLeave={(e) => {
          profileBtn3D.onMouseLeave(e);
          setIsHoveringButton(false);
        }}
        onClick={handleProfileClick}
        className={`px-4 py-2 rounded-xl transition-all ${
          isActive
            ? 'bg-[var(--bridge-blue)] text-white font-medium'
            : 'text-foreground hover:bg-secondary border'
        }`}
      >
        Profile
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onMouseEnter={() => setIsHoveringDropdown(true)}
          onMouseLeave={() => setIsHoveringDropdown(false)}
          className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl overflow-hidden z-50"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 12px 40px 0 rgba(74, 144, 164, 0.2)',
            animation: 'fadeInSlide 0.2s ease-out forwards',
            transformOrigin: 'top center'
          }}
        >
          {/* User ID - Non-clickable */}
          <div className="px-4 py-3 border-b border-white/40" style={{ background: 'rgba(74, 144, 164, 0.08)' }}>
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-[var(--bridge-blue-light)]">
                <User className="h-3.5 w-3.5 text-[var(--bridge-blue)]" />
              </div>
              <span className="font-medium text-foreground">{userName}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Settings */}
            <button
              ref={dropdownItem1_3D.ref}
              style={dropdownItem1_3D.style}
              onMouseMove={dropdownItem1_3D.onMouseMove}
              onMouseEnter={dropdownItem1_3D.onMouseEnter}
              onMouseLeave={dropdownItem1_3D.onMouseLeave}
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-[var(--bridge-blue-light)]/60 transition-all"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>

            {/* Logout */}
            <button
              ref={dropdownItem2_3D.ref}
              style={dropdownItem2_3D.style}
              onMouseMove={dropdownItem2_3D.onMouseMove}
              onMouseEnter={dropdownItem2_3D.onMouseEnter}
              onMouseLeave={dropdownItem2_3D.onMouseLeave}
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-red-50/80 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}