import { Plus, PenSquare } from 'lucide-react';
import { Button } from './ui/button';
import { use3DHover } from '../hooks/use3DHover';

interface CreatePostButtonProps {
  onClick: () => void;
}

export function CreatePostButton({ onClick }: CreatePostButtonProps) {
  const desktop3D = use3DHover({ maxRotation: 8, scale: 1.08 });
  const mobile3D = use3DHover({ maxRotation: 10, scale: 1.1 });

  return (
    <>
      {/* Desktop version - shown on larger screens */}
      <div
        ref={desktop3D.ref}
        style={desktop3D.style}
        onMouseMove={desktop3D.onMouseMove}
        onMouseEnter={desktop3D.onMouseEnter}
        onMouseLeave={desktop3D.onMouseLeave}
        className="hidden md:block fixed bottom-8 right-8 z-40"
      >
        <Button
          onClick={onClick}
          className="flex h-14 gap-3 rounded-full bg-gradient-to-r from-[var(--bridge-blue)] to-[var(--bridge-green)] hover:shadow-2xl transition-all duration-300 px-6 text-white shadow-lg"
        >
          <PenSquare className="h-5 w-5" />
          <span className="font-medium">Create Post</span>
        </Button>
      </div>

      {/* Mobile version - compact circular button */}
      <button
        ref={mobile3D.ref}
        style={mobile3D.style}
        onMouseMove={mobile3D.onMouseMove}
        onMouseEnter={mobile3D.onMouseEnter}
        onMouseLeave={mobile3D.onMouseLeave}
        onClick={onClick}
        className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--bridge-blue)] to-[var(--bridge-green)] text-white shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  );
}