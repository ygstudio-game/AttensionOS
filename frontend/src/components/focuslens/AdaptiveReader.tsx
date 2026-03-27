import React, { useEffect, useRef, useState } from 'react';
import { useFocusStore } from '@/store/useFocusStore';
import { FogOfWar } from './FogOfWar';

interface AdaptiveReaderProps {
  content?: string;
  fileUrl?: string;
  fileType?: string;
  enableGazeScroll?: boolean;
  enableSmartHighlighting?: boolean;
  enableReadingSpeedAdaptation?: boolean;
  enableBreakReminders?: boolean;
}

export function AdaptiveReader({
  content = "",
  fileUrl,
  fileType,
  enableGazeScroll = false,
  enableSmartHighlighting = false,
  enableReadingSpeedAdaptation = false,
  enableBreakReminders = false,
}: AdaptiveReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [highlightedSections, setHighlightedSections] = useState<Set<number>>(new Set());

  const { isFocused, faceDetected, gazeHeatmap, focusScore, triggerAlert, isDrowsy } = useFocusStore();

  // Break reminder logic
  useEffect(() => {
    if (!enableBreakReminders || !faceDetected) return;

    const checkBreakTime = () => {
      if (isDrowsy) {
        triggerAlert('fatigue', 'Signs of eye strain detected. Look away for 20 seconds.');
      }
    };

    const interval = setInterval(checkBreakTime, 120000);
    return () => clearInterval(interval);
  }, [isDrowsy, enableBreakReminders, faceDetected, triggerAlert]);

  // Scroll progress tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = scrollHeight > clientHeight
        ? (scrollTop / (scrollHeight - clientHeight)) * 100
        : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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

  const processContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let listItems: string[] = [];
    let elementIndex = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ');
        const isHighlighted = highlightedSections.has(elementIndex);
        elements.push(
          <p
            key={elementIndex}
            className={`mb-4 leading-relaxed transition-all duration-500 ${isHighlighted
              ? 'border-l-2 border-[#00E5FF]/50 pl-4 text-white/80'
              : 'text-white/60'
            }`}
            dangerouslySetInnerHTML={{
              __html: text
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-[#00E5FF] text-sm">$1</code>')
            }}
          />
        );
        elementIndex++;
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={elementIndex} className="mb-4 space-y-2 pl-4">
            {listItems.map((item, i) => (
              <li key={i} className="text-white/60 flex items-start gap-2">
                <span className="text-[#00E5FF] mt-1.5 text-[6px]">●</span>
                <span dangerouslySetInnerHTML={{
                  __html: item
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90">$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                }} />
              </li>
            ))}
          </ul>
        );
        elementIndex++;
        listItems = [];
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        flushParagraph();
        flushList();
        elements.push(<h1 key={elementIndex} className="text-2xl font-black text-white mb-4 mt-6">{trimmed.slice(2)}</h1>);
        elementIndex++;
      } else if (trimmed.startsWith('## ')) {
        flushParagraph();
        flushList();
        elements.push(<h2 key={elementIndex} className="text-xl font-bold text-white/90 mb-3 mt-5">{trimmed.slice(3)}</h2>);
        elementIndex++;
      } else if (trimmed.startsWith('### ')) {
        flushParagraph();
        flushList();
        elements.push(<h3 key={elementIndex} className="text-lg font-semibold text-white/80 mb-2 mt-4">{trimmed.slice(4)}</h3>);
        elementIndex++;
      } else if (/^[-*] /.test(trimmed)) {
        flushParagraph();
        listItems.push(trimmed.slice(2));
      } else if (/^\d+\.\s/.test(trimmed)) {
        flushParagraph();
        listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      } else if (trimmed === '') {
        flushParagraph();
        flushList();
      } else {
        flushList();
        currentParagraph.push(trimmed);
      }
    });

    flushParagraph();
    flushList();
    return elements;
  };

  return (
    <FogOfWar
      isActive={true}
      blurIntensity={6}
      transitionDuration={500}
    >
      <div
        ref={containerRef}
        className="relative max-w-2xl mx-auto max-h-[calc(100vh-200px)] overflow-y-auto scroll-smooth glass-panel rounded-2xl"
        style={{
          scrollBehavior: enableGazeScroll ? 'smooth' : 'auto'
        }}
      >
        {/* Reading Progress Bar */}
        <div className="sticky top-0 z-50 p-4" style={{ background: 'linear-gradient(to bottom, rgba(10,12,16,0.9), transparent)' }}>
          <div className="flex justify-between items-center text-xs text-white/25 mb-2 font-medium">
            <span>Reading Progress</span>
            <span className="font-mono">{Math.round(scrollProgress)}%</span>
          </div>
          <div className="neon-progress-track h-1">
            <div
              className="neon-progress-fill-cyan"
              style={{ width: `${scrollProgress}%`, height: '100%' }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={contentRef}
          className={`${fileType === 'pdf' ? 'w-full h-full min-h-[600px]' : 'p-8 pt-2 prose prose-invert prose-slate max-w-none'}`}
          style={{
            filter: faceDetected && !isFocused ? 'blur(3px) grayscale(0.3)' : 'none',
            transition: 'filter 0.5s ease-in-out'
          }}
        >
          {fileType === 'pdf' && fileUrl ? (
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full min-h-[600px] rounded-b-xl border-none" 
              title="Document Viewer"
            />
          ) : (
            processContent(content || "")
          )}
        </div>
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
  const processedContent = processContentByType(content || "", contentType);
  return (
    <AdaptiveReader
      {...props}
      content={processedContent}
    />
  );
}

const processContentByType = (content: string, type: string) => {
  switch (type) {
    case 'markdown':
      return content
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    case 'pdf':
      return content.replace(/\s+/g, ' ').trim();
    case 'web':
      return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    default:
      return content;
  }
};