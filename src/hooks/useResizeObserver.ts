import { useCallback, useRef, useState } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Custom hook for observing element resize events
 * Returns dimensions and a callback ref to attach to the element
 */
export function useResizeObserver() {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const callbackRef = useCallback((node: HTMLElement | null) => {
    // Cleanup previous observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    // Setup new observer if node exists
    if (node) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });

      resizeObserverRef.current.observe(node);
    }
  }, []);

  return { dimensions, callbackRef };
}
