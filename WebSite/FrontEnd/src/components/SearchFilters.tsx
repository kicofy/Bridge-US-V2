import { Filter } from 'lucide-react';
import { Label } from './ui/label';
import { Card3D } from './Card3D';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTranslation } from 'react-i18next';

interface SearchFiltersProps {
  filters: {
    categoryId: string;
  };
  onFilterChange: (key: string, value: string) => void;
  categories: { id: string; name: string }[];
}

export function SearchFilters({ filters, onFilterChange, categories }: SearchFiltersProps) {
  const { t } = useTranslation();
  return (
    <Card3D 
      className="rounded-3xl border border-white/70 glass-subtle p-4 sm:p-6 shadow-sm"
      maxRotation={5}
      scale={1.01}
    >
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-[var(--bridge-blue)]" />
        <h4 className="text-sm sm:text-base font-semibold">{t('search.filters')}</h4>
      </div>

      <div className="space-y-2">
        {/* Topic Filter */}
        <div className="space-y-2">
          <Label className="text-sm">{t('search.topic')}</Label>
          <Select value={filters.categoryId} onValueChange={(value) => onFilterChange('categoryId', value)}>
            <SelectTrigger className="rounded-2xl border-white/80 bg-white/70">
              <SelectValue placeholder={t('search.allTopics')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('search.allTopics')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card3D>
  );
}