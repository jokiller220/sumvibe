import { useState, useRef, ReactNode, TouchEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  
  const MAX_PULL = 100;
  const REFRESH_THRESHOLD = 60;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (refreshing) return;
    const { scrollTop } = containerRef.current || { scrollTop: 0 };
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    
    const { scrollTop } = containerRef.current || { scrollTop: 0 };
    if (scrollTop <= 0 && diff > 0) {
      setPullDistance(Math.min(diff * 0.4, MAX_PULL));
    } else {
      setPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling || refreshing) return;
    setPulling(false);
    if (pullDistance >= REFRESH_THRESHOLD) {
      setRefreshing(true);
      setPullDistance(REFRESH_THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full flex justify-center items-center overflow-hidden transition-all"
        style={{
          height: pullDistance,
          transitionDuration: pulling ? '0ms' : '300ms',
          opacity: Math.min(pullDistance / REFRESH_THRESHOLD, 1)
        }}
      >
        <div className="bg-[#13132A] rounded-full p-2 shadow-lg border border-white/10">
          <Loader2 
            className={`text-violet-400 ${refreshing ? 'animate-spin' : ''}`} 
            size={20} 
            style={{ transform: `rotate(${pullDistance * 2}deg)` }}
          />
        </div>
      </div>
      <div
        style={{
          transition: pulling ? 'none' : 'transform 300ms ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
