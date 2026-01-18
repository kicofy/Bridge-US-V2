import { ReactNode, MouseEvent } from 'react';
import { use3DHover } from '../hooks/use3DHover';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  maxRotation?: number;
  perspective?: number;
  scale?: number;
  transitionSpeed?: number;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function Card3D({
  children,
  className = '',
  maxRotation = 8,
  perspective = 1000,
  scale = 1.02,
  transitionSpeed = 300,
  onClick,
}: Card3DProps) {
  const { ref, style, onMouseMove, onMouseEnter, onMouseLeave } = use3DHover({
    maxRotation,
    perspective,
    scale,
    transitionSpeed,
  });

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      className={className}
    >
      {children}
    </div>
  );
}