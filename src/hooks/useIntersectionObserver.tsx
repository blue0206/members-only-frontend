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
  const [node, setNode] = useState<HTMLElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    const { current: currentObserver } = observer;

    if (node) {
      currentObserver.observe(node);
    }

    return () => {
      currentObserver.disconnect();
    };
  }, [node, options]);

  return { ref: setNode, entry };
}
