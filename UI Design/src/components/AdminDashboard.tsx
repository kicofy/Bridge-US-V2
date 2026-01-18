import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Flag, 
  Tag, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { Button } from './ui/button';
import { StatisticsPanel } from './admin/StatisticsPanel';
import { UserManagement } from './admin/UserManagement';
import { ContentManagement } from './admin/ContentManagement';
import { ReportManagement } from './admin/ReportManagement';
import { CategoryTagManagement } from './admin/CategoryTagManagement';
import { AuditLog } from './admin/AuditLog';

interface AdminDashboardProps {
  onExit: () => void;
}

type AdminSection = 'dashboard' | 'users' | 'content' | 'reports' | 'categories' | 'audit-log';

const menuItems = [
  {
    id: 'dashboard' as const,
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Statistics',
  },
  {
    id: 'users' as const,
    label: 'Users',
    icon: Users,
    description: 'User Management',
  },
  {
    id: 'content' as const,
    label: 'Content',
    icon: FileText,
    description: 'Posts & Replies',
  },
  {
    id: 'reports' as const,
    label: 'Reports',
    icon: Flag,
    description: 'Moderation Queue',
  },
  {
    id: 'categories' as const,
    label: 'Categories & Tags',
    icon: Tag,
    description: 'Organization',
  },
  {
    id: 'audit-log' as const,
    label: 'Audit Log',
    icon: Shield,
    description: 'System Events (Root)',
    rootOnly: true,
  },
];

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <StatisticsPanel />;
      case 'users':
        return <UserManagement />;
      case 'content':
        return <ContentManagement />;
      case 'reports':
        return <ReportManagement />;
      case 'categories':
        return <CategoryTagManagement />;
      case 'audit-log':
        return <AuditLog />;
      default:
        return <StatisticsPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden rounded-lg"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                <span className="text-xl text-white">⚙️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Panel</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">BridgeUS Management</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="rounded-xl gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Exit Admin</span>
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r z-40 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } w-64 flex flex-col`}
        >
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--bridge-blue)] to-[var(--bridge-green)] text-white shadow-lg'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Admin Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)] flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Admin User</p>
                <p className="text-xs text-muted-foreground">System Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}