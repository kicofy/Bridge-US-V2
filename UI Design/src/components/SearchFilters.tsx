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

interface SearchFiltersProps {
  filters: {
    topic: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <Card3D 
      className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm"
      maxRotation={5}
      scale={1.01}
    >
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-[var(--bridge-blue)]" />
        <h4 className="text-sm sm:text-base font-medium">Filters</h4>
      </div>

      <div className="space-y-2">
        {/* Topic Filter */}
        <div className="space-y-2">
          <Label className="text-sm">Topic</Label>
          <Select value={filters.topic} onValueChange={(value) => onFilterChange('topic', value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              <SelectItem value="visa">Visa & Immigration</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="health">Health & Wellness</SelectItem>
              <SelectItem value="campus">Campus Life</SelectItem>
              <SelectItem value="work">Work & Internships</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card3D>
  );
}