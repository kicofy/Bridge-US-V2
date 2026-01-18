import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface TranslationToggleProps {
  isTranslated: boolean;
  originalLanguage: string;
  onToggle: () => void;
}

export function TranslationToggle({ isTranslated, originalLanguage, onToggle }: TranslationToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1 rounded-lg">
        <Languages className="h-3 w-3" />
        <span className="text-xs">
          {isTranslated ? `Translated from ${originalLanguage}` : `Original (${originalLanguage})`}
        </span>
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="h-7 rounded-lg px-2 text-xs"
      >
        {isTranslated ? 'Show Original' : 'Translate'}
      </Button>
    </div>
  );
}
