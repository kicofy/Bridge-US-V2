import { Home, FileText, Building2, Heart, GraduationCap, Briefcase, TrendingUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from './ui/sheet';
import { cn } from './ui/utils';
import { useState } from 'react';

const categories = [
  { id: 'all', label: 'All Posts', icon: Home },
  { id: 'visa', label: 'Visa & Immigration', icon: FileText },
  { id: 'housing', label: 'Housing', icon: Building2 },
  { id: 'health', label: 'Health & Wellness', icon: Heart },
  { id: 'campus', label: 'Campus Life', icon: GraduationCap },
  { id: 'work', label: 'Work & Internships', icon: Briefcase },
  { id: 'trending', label: 'Trending Topics', icon: TrendingUp },
];

interface MobileCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function MobileCategorySelector({ selectedCategory, onSelectCategory }: MobileCategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const SelectedIcon = selectedCategoryData?.icon || Home;

  const handleSelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between rounded-xl border-2 h-12 px-4"
        >
          <div className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4 text-[var(--bridge-blue)]" />
            <span className="font-medium">{selectedCategoryData?.label}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-6">
        <SheetTitle className="mb-6 text-center">Select Category</SheetTitle>
        <nav className="space-y-2 overflow-y-auto max-h-[calc(85vh-100px)]">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleSelect(category.id)}
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
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}