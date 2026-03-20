import { useEffect, useRef, useState } from 'react';
import { useFocusStore } from '@/store/useFocusStore';

interface FogOfWarProps {
  isActive: boolean;
  children: React.ReactNode;
  blurIntensity?: number;
  transitionDuration?: number;
}

export function FogOfWar({ 
  isActive, 
  children, 
  blurIntensity = 8, 
  transitionDuration = 700 
}: FogOfWarProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(null);
  
  // State from store
  const { isFocused, faceDetected, gazeHeatmap, focusScore } = useFocusStore();

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const content = container.querySelector('.fog-content') as HTMLElement;
    const overlay = container.querySelector('.fog-overlay') as HTMLElement;

    if (!content || !overlay) return;

    setIsInitialized(true);

    // Performance-optimized blur animation using requestAnimationFrame
    const animateBlur = () => {
      const shouldBlur = !faceDetected || !isFocused;
      const currentBlur = parseFloat(getComputedStyle(overlay).filter.replace(/[^0-9.]/g, '') || '0');
      
      // Calculate target blur based on focus score and state
      let targetBlur = 0;
      if (shouldBlur) {
        if (focusScore < 30) {
          targetBlur = blurIntensity;
        } else if (focusScore < 60) {
          targetBlur = blurIntensity * 0.6;
        } else {
          targetBlur = blurIntensity * 0.3;
        }
      }

      // Smooth interpolation for performance
      const newBlur = currentBlur + (targetBlur - currentBlur) * 0.1;
      
      if (Math.abs(newBlur - targetBlur) > 0.1) {
        overlay.style.filter = `blur(${newBlur}px) grayscale(${newBlur * 0.1})`;
        rafRef.current = requestAnimationFrame(animateBlur);
      } else {
        overlay.style.filter = `blur(${targetBlur}px) grayscale(${targetBlur * 0.1})`;
      }
    };

    animateBlur();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, isFocused, faceDetected, focusScore, blurIntensity]);

  // Selective blur based on gaze heatmap - REMOVED for Simpler UI

  if (!isActive) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden transition-shadow duration-700 rounded-xl ${
        isFocused ? 'shadow-[0_0_50px_rgba(56,189,248,0.1)] ring-1 ring-sky-500/20' : ''
      }`}
      style={{ 
        minHeight: '400px',
        transition: `filter ${transitionDuration}ms ease-in-out`
      }}
    >
      {/* Content Layer */}
      <div 
        className="fog-content relative z-10"
        style={{
          filter: isFocused ? 'none' : 'brightness(0.9)',
          transition: `filter ${transitionDuration}ms ease-in-out`
        }}
      >
        {children}
      </div>

      {/* Overlay Layer */}
      <div 
        className="fog-overlay absolute inset-0 z-20 pointer-events-none"
        style={{
          backdropFilter: `blur(${blurIntensity}px)`,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          opacity: 0,
          transition: `all ${transitionDuration}ms ease-in-out`
        }}
      />

      {/* Gaze-aware Highlight Layer Removed */}

    </div>
  );
}

// Enhanced FogOfWar with adaptive blur based on content type
export function AdaptiveFogOfWar({ 
  isActive, 
  children, 
  contentType = 'text', // 'text' | 'video' | 'interactive'
  ...props 
}: FogOfWarProps & { contentType?: 'text' | 'video' | 'interactive' }) {
  
  const { isFocused, faceDetected } = useFocusStore();
  
  // Different blur strategies based on content type
  const getBlurStrategy = () => {
    switch (contentType) {
      case 'text':
        return {
          baseBlur: 6,
          adaptiveBlur: isFocused ? 0 : 8,
          grayscale: isFocused ? 0 : 0.5
        };
      case 'video':
        return {
          baseBlur: 4,
          adaptiveBlur: isFocused ? 0 : 6,
          grayscale: isFocused ? 0 : 0.3
        };
      case 'interactive':
        return {
          baseBlur: 2,
          adaptiveBlur: isFocused ? 0 : 4,
          grayscale: isFocused ? 0 : 0.2
        };
      default:
        return {
          baseBlur: 6,
          adaptiveBlur: isFocused ? 0 : 8,
          grayscale: isFocused ? 0 : 0.5
        };
    }
  };

  const strategy = getBlurStrategy();

  return (
    <FogOfWar 
      {...props}
      isActive={isActive}
      blurIntensity={strategy.baseBlur}
    >
      <div 
        className="relative"
        style={{
          filter: faceDetected && !isFocused 
            ? `blur(${strategy.adaptiveBlur}px) grayscale(${strategy.grayscale})`
            : 'none',
          transition: 'filter 0.5s ease-in-out'
        }}
      >
        {children}
      </div>
    </FogOfWar>
  );
}