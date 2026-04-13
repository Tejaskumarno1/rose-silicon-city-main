import { useEffect, useRef, useCallback } from 'react';

// Shared mutable ref — the 3D CameraRig reads this directly in useFrame,
// so we never need React re-renders for scroll-driven camera movement.
export const scrollProgressRef = { current: 0 };

export const useScrollProgress = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const scrollHeight = ref.current.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const p = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
    scrollProgressRef.current = p;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial value
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { ref };
};
