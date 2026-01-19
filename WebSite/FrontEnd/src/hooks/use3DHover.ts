import { useState, useRef, useCallback, MouseEvent } from 'react';

interface Use3DHoverOptions {
  maxRotation?: number; // Maximum rotation angle in degrees
  perspective?: number; // Perspective value in pixels
  scale?: number; // Scale on hover
  transitionSpeed?: number; // Transition speed in milliseconds
}

interface Use3DHoverReturn {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function use3DHover(options: Use3DHoverOptions = {}): Use3DHoverReturn {
  const {
    maxRotation = 10,
    perspective = 1000,
    scale = 1.02,
    transitionSpeed = 300,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;

      // Cancel previous animation frame if exists
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Use requestAnimationFrame for smooth updates
      rafIdRef.current = requestAnimationFrame(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation based on mouse position
        const rotateY = ((x - centerX) / centerX) * maxRotation;
        const rotateX = -((y - centerY) / centerY) * maxRotation;

        // Directly update DOM to avoid React re-renders
        ref.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      });
    },
    [maxRotation, perspective, scale]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (ref.current) {
      ref.current.style.transition = `transform ${transitionSpeed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
    }
  }, [transitionSpeed]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    
    // Cancel any pending animation frame
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (ref.current) {
      ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  }, []);

  const style: React.CSSProperties = {
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: `transform ${transitionSpeed}ms cubic-bezier(0.23, 1, 0.32, 1)`,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  };

  return {
    ref,
    style,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}