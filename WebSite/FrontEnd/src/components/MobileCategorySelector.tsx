import { Home, FileText, Building2, Heart, GraduationCap, Briefcase, TrendingUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from './ui/sheet';
import { cn } from './ui/utils';
import { useState } from 'react';
import { use3DHover } from '../hooks/use3DHover';
import { useTranslation } from 'react-i18next';

interface MobileCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function MobileCategorySelector({ selectedCategory, onSelectCategory }: MobileCategorySelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const categories = [
    { id: 'all', label: t('categories.all'), icon: Home },
    { id: 'visa', label: t('categories.visa'), icon: FileText },
    { id: 'housing', label: t('categories.housing'), icon: Building2 },
    { id: 'health', label: t('categories.health'), icon: Heart },
    { id: 'campus', label: t('categories.campus'), icon: GraduationCap },
    { id: 'work', label: t('categories.work'), icon: Briefcase },
    { id: 'trending', label: t('categories.trending'), icon: TrendingUp },
  ];
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const SelectedIcon = selectedCategoryData?.icon || Home;
  const trigger3D = use3DHover({ maxRotation: 6, scale: 1.02 });

  const handleSelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div
          ref={trigger3D.ref}
          style={trigger3D.style}
          onMouseMove={trigger3D.onMouseMove}
          onMouseEnter={trigger3D.onMouseEnter}
          onMouseLeave={trigger3D.onMouseLeave}
        >
          <Button 
            variant="outline" 
            className="w-full justify-between rounded-xl glass-subtle border-2 h-12 px-4"
          >
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-4 w-4 text-[var(--bridge-blue)]" />
              <span className="font-medium">{selectedCategoryData?.label}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-6 glass-strong">
        <SheetTitle className="mb-6 text-center">Select Category</SheetTitle>
        <nav className="space-y-2 overflow-y-auto max-h-[calc(85vh-100px)]">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={isSelected}
                onSelect={handleSelect}
              />
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function CategoryButton({ category, isSelected, onSelect }: {
  category: typeof categories[0];
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const btn3D = use3DHover({ maxRotation: 8, scale: 1.03 });
  const Icon = category.icon;

  return (
    <button
      ref={btn3D.ref}
      style={btn3D.style}
      onMouseMove={btn3D.onMouseMove}
      onMouseEnter={btn3D.onMouseEnter}
      onMouseLeave={btn3D.onMouseLeave}
      onClick={() => onSelect(category.id)}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl px-4 py-4 transition-all",
        isSelected
          ? "bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)] shadow-sm"
          : "text-foreground hover:bg-secondary active:bg-secondary/80"
      )}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        isSelected 
          ? "bg-[var(--bridge-blue)] text-white" 
          : "bg-secondary"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-base font-medium text-left">{category.label}</span>
    </button>
  );
}