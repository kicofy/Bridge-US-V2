import { SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { use3DHover } from '../hooks/use3DHover';

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
  const filterBar3D = use3DHover({ maxRotation: 5, scale: 1.01 });
  const newest3D = use3DHover({ maxRotation: 6, scale: 1.05 });
  const helpful3D = use3DHover({ maxRotation: 6, scale: 1.05 });
  const accuracy3D = use3DHover({ maxRotation: 6, scale: 1.05 });

  const get3DHoverProps = (filterId: string) => {
    switch (filterId) {
      case 'newest':
        return newest3D;
      case 'helpful':
        return helpful3D;
      case 'accuracy':
        return accuracy3D;
      default:
        return newest3D;
    }
  };

  return (
    <div 
      ref={filterBar3D.ref}
      style={filterBar3D.style}
      onMouseMove={filterBar3D.onMouseMove}
      onMouseEnter={filterBar3D.onMouseEnter}
      onMouseLeave={filterBar3D.onMouseLeave}
      className="mb-4 sm:mb-6 flex items-center justify-between rounded-2xl glass p-3 sm:p-4 shadow-sm"
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <span className="text-xs sm:text-sm text-muted-foreground">Sort:</span>
      </div>
      
      <div className="flex gap-1.5 sm:gap-2">
        {filterOptions.map((option) => {
          const hover3D = get3DHoverProps(option.id);
          return (
            <div
              key={option.id}
              ref={hover3D.ref}
              style={hover3D.style}
              onMouseMove={hover3D.onMouseMove}
              onMouseEnter={hover3D.onMouseEnter}
              onMouseLeave={hover3D.onMouseLeave}
            >
              <Button
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
            </div>
          );
        })}
      </div>
    </div>
  );
}