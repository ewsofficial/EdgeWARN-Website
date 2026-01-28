'use client';

import { useEffect, useRef, useState } from 'react';

interface ViewportCullProps {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export default function ViewportCull({ children, rootMargin = '0px', threshold = 0.1 }: ViewportCullProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={containerRef} style={{ minHeight: isVisible ? 'auto' : '0px' }}>
      {isVisible ? children : null}
    </div>
  );
}
