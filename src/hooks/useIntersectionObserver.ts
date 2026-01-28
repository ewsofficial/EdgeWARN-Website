import { useEffect, useRef, useState, type RefObject } from 'react';
import { observerManager } from '@/utils/observer';

export interface IntersectionObserverOptions {
    root?: null;
    rootMargin?: string;
    threshold?: number | number[];
}

export function useIntersectionObserver<T extends HTMLElement>(
    options: IntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] {
    const ref = useRef<T | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef) return;

        const config = {
            rootMargin: options.rootMargin || '0px',
            threshold: options.threshold || 0
        };

        observerManager.observe(currentRef, config, (isIntersecting) => {
            if (isIntersecting) {
                setIsVisible(true);
                // For trigger-once behavior, we can unobserve immediately if needed
                // But the hook signature allows for continuous monitoring if we don't unobserve here.
                // The original code unobserved immediately.
                observerManager.unobserve(currentRef, config);
            }
        });

        return () => {
            observerManager.unobserve(currentRef, config);
        };
    }, [options.rootMargin, options.threshold]);

    return [ref, isVisible];
}
