import { Filter } from 'lucide-react';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SearchFiltersProps {
  filters: {
    language: string;
    topic: string;
    visaType: string;
    schoolLevel: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-[var(--bridge-blue)]" />
        <h4>Filters</h4>
      </div>

      <div className="space-y-4">
        {/* Language Filter */}
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={filters.language} onValueChange={(value) => onFilterChange('language', value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Any language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any language</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh">中文 (Chinese)</SelectItem>
              <SelectItem value="es">Español (Spanish)</SelectItem>
              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="ar">العربية (Arabic)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic Filter */}
        <div className="space-y-2">
          <Label>Topic</Label>
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

        {/* Visa Type Filter */}
        <div className="space-y-2">
          <Label>Visa Type</Label>
          <Select value={filters.visaType} onValueChange={(value) => onFilterChange('visaType', value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All visa types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All visa types</SelectItem>
              <SelectItem value="f1">F-1 Student</SelectItem>
              <SelectItem value="opt">OPT</SelectItem>
              <SelectItem value="cpt">CPT</SelectItem>
              <SelectItem value="h1b">H-1B</SelectItem>
              <SelectItem value="j1">J-1 Exchange</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* School Level Filter */}
        <div className="space-y-2">
          <Label>School Level</Label>
          <Select value={filters.schoolLevel} onValueChange={(value) => onFilterChange('schoolLevel', value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="undergrad">Undergraduate</SelectItem>
              <SelectItem value="masters">Master's</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="postdoc">Post-Doc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
