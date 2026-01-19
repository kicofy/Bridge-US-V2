import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { use3DHover } from '../hooks/use3DHover';

interface TranslationToggleProps {
  isTranslated: boolean;
  originalLanguage: string;
  onToggle: () => void;
}

export function TranslationToggle({ isTranslated, originalLanguage, onToggle }: TranslationToggleProps) {
  const toggle3D = use3DHover({ maxRotation: 8, scale: 1.05 });

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1 rounded-lg">
        <Languages className="h-3 w-3" />
        <span className="text-xs">
          {isTranslated ? `Translated from ${originalLanguage}` : `Original (${originalLanguage})`}
        </span>
      </Badge>
      <div
        ref={toggle3D.ref}
        style={toggle3D.style}
        onMouseMove={toggle3D.onMouseMove}
        onMouseEnter={toggle3D.onMouseEnter}
        onMouseLeave={toggle3D.onMouseLeave}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-7 rounded-lg px-2 text-xs"
        >
          {isTranslated ? 'Show Original' : 'Translate'}
        </Button>
      </div>
    </div>
  );
}