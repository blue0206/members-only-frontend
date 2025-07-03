import { useEffect, useRef, useState } from "react";

interface ObserverOptionsType {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export default function useIntersectionObserver(
  options: ObserverOptionsType = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    const { current: currentObserver } = observer;
    const { current: currentElement } = ref;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.disconnect();
      }
    };
  }, [ref, options]);

  return { ref, entry };
}
