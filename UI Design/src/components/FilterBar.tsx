import { SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

const filterOptions = [
  { id: 'newest', label: 'Newest', shortLabel: 'New' },
  { id: 'helpful', label: 'Most Helpful', shortLabel: 'Helpful' },
  { id: 'accuracy', label: 'Highest Accuracy', shortLabel: 'Accuracy' },
];

interface FilterBarProps {
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
}

export function FilterBar({ selectedFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="mb-4 sm:mb-6 flex items-center justify-between rounded-2xl border bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <span className="text-xs sm:text-sm text-muted-foreground">Sort:</span>
      </div>
      
      <div className="flex gap-1.5 sm:gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.id}
            variant={selectedFilter === option.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(option.id)}
            className={cn(
              "rounded-xl text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3",
              selectedFilter === option.id && "bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
            )}
          >
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}