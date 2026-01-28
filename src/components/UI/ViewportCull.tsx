import { useEffect, useRef, useState } from 'react';
import { observerManager } from '@/utils/observer';

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

    observerManager.observe(container, { rootMargin, threshold }, (isIntersecting) => {
      setIsVisible(isIntersecting);
    });

    return () => {
      observerManager.unobserve(container, { rootMargin, threshold });
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={containerRef} style={{ minHeight: isVisible ? 'auto' : '0px' }}>
      {isVisible ? children : null}
    </div>
  );
}
