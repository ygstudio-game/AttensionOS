import { useEffect, useRef, useState } from 'react';
import { useFocusStore } from '@/store/useFocusStore';
import { FogOfWar } from './FogOfWar';

interface AdaptiveReaderProps {
  content: string;
  enableGazeScroll?: boolean;
  enableSmartHighlighting?: boolean;
  enableReadingSpeedAdaptation?: boolean;
  enableBreakReminders?: boolean;
}

export function AdaptiveReader({
  content,
  enableGazeScroll = true,
  enableSmartHighlighting = true,
  enableReadingSpeedAdaptation = true,
  enableBreakReminders = true
}: AdaptiveReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [highlightedSections, setHighlightedSections] = useState<Set<number>>(new Set());

  // State from store
  const { isFocused, faceDetected, gazeHeatmap, focusScore, triggerAlert, isDrowsy } = useFocusStore();

  // Break reminder logic
  useEffect(() => {
    if (!enableBreakReminders || !faceDetected) return;

    const checkBreakTime = () => {
      if (isDrowsy) {
        triggerAlert('fatigue', 'Signs of eye strain detected. Look away for 20 seconds.');
      }
    };

    const interval = setInterval(checkBreakTime, 120000); // Check every 2 minutes
    return () => clearInterval(interval);
  }, [isDrowsy, enableBreakReminders, faceDetected, triggerAlert]);

  // // Gaze-aware scroll control
  // useEffect(() => {
  //   if (!enableGazeScroll || !faceDetected || !isFocused || !containerRef.current) return;

  //   const container = containerRef.current;
  //   const content = contentRef.current;

  //   if (!content) return;

  //   // Calculate scroll progress based on gaze position
  //   const handleGazeScroll = () => {
  //     if (gazeHeatmap.length === 0) return;

  //     // Get average gaze Y position from recent gaze points
  //     const recentGaze = gazeHeatmap.slice(-10);
  //     const avgY = recentGaze.reduce((sum, g) => sum + g.y, 0) / recentGaze.length;

  //     // If gaze is at bottom of screen (y > 0.8), scroll down
  //     if (avgY > 0.8) {
  //       const scrollAmount = Math.min(50, content.scrollHeight - container.scrollTop - container.clientHeight);
  //       container.scrollTop += scrollAmount;
  //     } 
  //     // If gaze is at top of screen (y < 0.2), scroll up
  //     else if (avgY < 0.2) {
  //       const scrollAmount = Math.min(50, container.scrollTop);
  //       container.scrollTop -= scrollAmount;
  //     }

  //     setScrollProgress(container.scrollTop / (content.scrollHeight - container.clientHeight) * 100);
  //   };

  //   // Throttle gaze scroll updates
  //   const throttledScroll = throttle(handleGazeScroll, 500);

  //   const interval = setInterval(throttledScroll, 1000);
  //   return () => clearInterval(interval);
  // }, [gazeHeatmap, enableGazeScroll, faceDetected, isFocused]);

  // // Smart text highlighting based on gaze
  // useEffect(() => {
  //   if (!enableSmartHighlighting || !faceDetected || gazeHeatmap.length === 0) return;

  //   const content = contentRef.current;
  //   if (!content) return;

  //   // Analyze gaze clusters to find areas of focus
  //   const clusters = clusterGazePoints(gazeHeatmap);
  //   const newHighlights = new Set<number>();

  //   clusters.forEach((cluster, index) => {
  //     if (cluster.size >= 5) { // Significant focus area
  //       newHighlights.add(index);
  //     }
  //   });

  //   setHighlightedSections(newHighlights);
  // }, [gazeHeatmap, enableSmartHighlighting, faceDetected]);

  // Cluster gaze points for highlighting
  const clusterGazePoints = (points: Array<{ x: number; y: number; weight: number; timestamp: number }>) => {
    const clusters: Array<{
      centerX: number;
      centerY: number;
      size: number;
      points: Array<{ x: number; y: number }>
    }> = [];

    points.forEach(point => {
      let assigned = false;

      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(point.x - cluster.centerX, 2) +
          Math.pow(point.y - cluster.centerY, 2)
        );

        if (distance < 0.1) {
          cluster.size++;
          cluster.points.push({ x: point.x, y: point.y });
          cluster.centerX = cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length;
          cluster.centerY = cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length;
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        clusters.push({
          centerX: point.x,
          centerY: point.y,
          size: 1,
          points: [{ x: point.x, y: point.y }]
        });
      }
    });

    return clusters;
  };

  // Utility function to throttle function calls
  const throttle = (func: Function, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  };

  // Process content for highlighting
  const processContent = (content: string) => {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n');

    return paragraphs.map((paragraph, index) => {
      const isHighlighted = highlightedSections.has(index);

      return (
        <p
          key={index}
          className={`mb-4 leading-relaxed transition-all duration-500 ${isHighlighted
              ? 'bg-gradient-to-r from-sky-500/10 to-transparent p-3 rounded-lg border border-sky-500/30 shadow-lg'
              : 'text-slate-300'
            }`}
          style={{
            filter: isHighlighted ? 'brightness(1.1)' : 'none'
          }}
        >
          {paragraph}
        </p>
      );
    });
  };

  return (
    <FogOfWar
      isActive={true}
      blurIntensity={6}
      transitionDuration={500}
    >
      <div
        ref={containerRef}
        className="relative max-w-2xl mx-auto h-[600px] overflow-y-auto scroll-smooth"
        style={{
          scrollBehavior: enableGazeScroll ? 'smooth' : 'auto'
        }}
      >
        {/* Reading Progress Bar */}
        <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/80 to-transparent p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
            <span>Reading Progress</span>
            <span>{Math.round(scrollProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-orange-500 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={contentRef}
          className="p-8 prose prose-invert prose-slate max-w-none"
          style={{
            filter: faceDetected && !isFocused ? 'blur(2px) grayscale(0.3)' : 'none',
            transition: 'filter 0.5s ease-in-out'
          }}
        >
          {processContent(content)}
        </div>

        {/* Gaze Heatmap Overlay Removed */}

        {/* Reading Tips Removed for Simpler UI */}

        {/* Break Reminder */}
      </div>
    </FogOfWar>
  );
}

// Enhanced reader for different content types
export function MultiFormatReader({
  content,
  contentType = 'text',
  ...props
}: AdaptiveReaderProps & { contentType?: 'text' | 'markdown' | 'pdf' | 'web' }) {

  const processedContent = processContentByType(content, contentType);

  return (
    <AdaptiveReader
      {...props}
      content={processedContent}
    />
  );
}

// Content processor for different formats
const processContentByType = (content: string, type: string) => {
  switch (type) {
    case 'markdown':
      // Simple markdown processing
      return content
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');

    case 'pdf':
      // PDF content processing (simplified)
      return content.replace(/\s+/g, ' ').trim();

    case 'web':
      // Web content processing
      return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    default:
      return content;
  }
};