import { Home, FileText, Building2, Heart, GraduationCap, Briefcase, TrendingUp } from 'lucide-react';
import { cn } from './ui/utils';
import { Card3D } from './Card3D';
import { useTranslation } from 'react-i18next';

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  const { t } = useTranslation();
  const categories = [
    { id: 'all', label: t('categories.all'), icon: Home },
    { id: 'visa', label: t('categories.visa'), icon: FileText },
    { id: 'housing', label: t('categories.housing'), icon: Building2 },
    { id: 'health', label: t('categories.health'), icon: Heart },
    { id: 'campus', label: t('categories.campus'), icon: GraduationCap },
    { id: 'work', label: t('categories.work'), icon: Briefcase },
    { id: 'trending', label: t('categories.trending'), icon: TrendingUp },
  ];
  return (
    <aside className="sticky top-20 hidden w-64 shrink-0 lg:block">
      <Card3D 
        className="rounded-3xl border border-white/70 glass-subtle p-4 shadow-sm"
        maxRotation={5}
        scale={1.01}
      >
        <h3 className="mb-4 px-3 text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Categories</h3>
        <nav className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 transition-all",
                  isSelected
                    ? "bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] shadow-sm"
                    : "text-foreground hover:bg-white/70"
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm text-left">{category.label}</span>
              </button>
            );
          })}
        </nav>
      </Card3D>
    </aside>
  );
}