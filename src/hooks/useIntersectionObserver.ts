import { useEffect, useRef, useState, type RefObject } from 'react';

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
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [options]);

    return [ref, isVisible];
}
