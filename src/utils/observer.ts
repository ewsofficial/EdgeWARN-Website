/**
 * Shared IntersectionObserver Manager
 * Reduces memory usage and CPU overhead by reusing observer instances
 * with the same configuration.
 */

interface ObserverConfig {
  rootMargin: string;
  threshold: number | number[];
}

type Callback = (isIntersecting: boolean) => void;

class ObserverManager {
  private observers: Map<string, IntersectionObserver> = new Map();
  private callbacks: Map<Element, Callback> = new Map();

  private getConfigKey(config: ObserverConfig): string {
    return `${config.rootMargin}-${JSON.stringify(config.threshold)}`;
  }

  private getObserver(config: ObserverConfig): IntersectionObserver {
    const key = this.getConfigKey(config);
    if (!this.observers.has(key)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        });
      }, config);
      this.observers.set(key, observer);
    }
    return this.observers.get(key)!;
  }

  public observe(el: Element, config: ObserverConfig, callback: Callback) {
    const observer = this.getObserver(config);
    this.callbacks.set(el, callback);
    observer.observe(el);
  }

  public unobserve(el: Element, config: ObserverConfig) {
    const key = this.getConfigKey(config);
    const observer = this.observers.get(key);
    if (observer) {
      observer.unobserve(el);
    }
    this.callbacks.delete(el);

    // Optional: cleanup observer if no elements are left
    // (Omitted for performance unless many unique configs exist)
  }
}

export const observerManager = new ObserverManager();
