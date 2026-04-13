import { useState, lazy, Suspense, useEffect, useCallback } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Certifications from '@/components/Certifications';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';
import SocialSidebar from '@/components/SocialSidebar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import DroneHUD from '@/components/DroneHUD';
import CombatHUD from '@/components/CombatHUD';
import { useScrollProgress, scrollProgressRef } from '@/hooks/useScrollProgress';

import { powerState } from '@/three/powerState';

const Scene = lazy(() => import('@/three/Scene'));

const Index = () => {
  const [loading, setLoading] = useState(true);
  const { ref } = useScrollProgress();
  const [isMobile] = useState(() => window.innerWidth < 768);
  const [droneMode, setDroneMode] = useState(false);

  useEffect(() => {
    powerState.active = true;
    const timer = setTimeout(() => setLoading(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for drone mode toggle
  useEffect(() => {
    const handler = (e: CustomEvent) => setDroneMode(e.detail);
    window.addEventListener('drone-mode-changed', handler as EventListener);
    return () => window.removeEventListener('drone-mode-changed', handler as EventListener);
  }, []);

  // Scroll progress bar — driven by rAF reading the ref, not by React state
  const progressBarRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    let rafId: number;
    const update = () => {
      node.style.width = `${scrollProgressRef.current * 100}%`;
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    // Cleanup via a MutationObserver isn't needed — the bar lives for entire page life
  }, []);

  return (
    <>
      {/* Invisible scroll blocker during power sequence */}
      {loading && <div className="fixed inset-0 z-50 pointer-events-auto" />}

      {/* 3D Background - desktop only */}
      {!isMobile && (
        <Suspense fallback={null}>
          <Scene droneMode={droneMode} />
        </Suspense>
      )}

      {/* Drone & Combat HUDs — rendered ABOVE everything */}
      <DroneHUD />
      <CombatHUD />

      {/* Navigation, Sidebar, Theme switcher — HIDDEN in drone mode */}
      <div
        className={`transition-all duration-500 ${loading ? 'opacity-0 pointer-events-none' : ''} ${droneMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Navigation />
        <SocialSidebar />
        <ThemeSwitcher />
      </div>

      {/* Scroll progress indicator — HIDDEN in drone mode */}
      {!loading && !droneMode && (
        <div className="fixed top-0 left-0 right-0 z-40 h-0.5">
          <div
            ref={progressBarRef}
            className="h-full"
            style={{
              willChange: 'width',
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))',
            }}
          />
        </div>
      )}

      {/* Content sections — HIDDEN in drone mode */}
      <div
        ref={ref}
        className={`relative z-10 transition-all duration-500 ${loading ? 'opacity-0 pointer-events-none delay-500' : ''} ${droneMode ? 'opacity-0 pointer-events-none !fixed' : 'opacity-100'}`}
        style={droneMode ? { visibility: 'hidden' } : {}}
      >
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certifications />
        <Contact />
      </div>
    </>
  );
};

export default Index;
