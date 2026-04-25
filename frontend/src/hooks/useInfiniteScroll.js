import { useEffect, useRef } from 'react';

const useInfiniteScroll = (onIntersect, { enabled = true } = {}) => {
  const sentinelRef = useRef(null);
  const callbackRef = useRef(onIntersect);
  callbackRef.current = onIntersect;

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callbackRef.current?.(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return sentinelRef;
};

export default useInfiniteScroll;
