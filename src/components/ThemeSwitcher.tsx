import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Palette, Gamepad2, FileText } from 'lucide-react';
import { themes, setTheme, themeState } from '@/three/themeState';
import { cameraMode } from '@/three/CameraRig';
import { usePortfolio } from '@/hooks/usePortfolio';

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(themeState.currentId);
  const [droneActive, setDroneActive] = useState(false);
  const data = usePortfolio();

  const handleSelect = (id: string) => {
    setTheme(id);
    setActiveId(id);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: id }));
  };

  const toggleDrone = () => {
    const next = !cameraMode.free;
    cameraMode.free = next;
    setDroneActive(next);
    window.dispatchEvent(new CustomEvent('drone-toggle'));
    window.dispatchEvent(new CustomEvent('drone-mode-changed', { detail: next }));

    if (next) {
      setOpen(false); // close theme panel
    }
  };

  // Sync state if ESC exits drone mode from inside the HUD
  useEffect(() => {
    const handler = (e: CustomEvent) => setDroneActive(e.detail);
    window.addEventListener('drone-mode-changed', handler as EventListener);
    return () => window.removeEventListener('drone-mode-changed', handler as EventListener);
  }, []);

  // Hide the entire panel during drone mode
  if (droneActive) return null;

  return (
    <div className="fixed bottom-10 right-6 z-50 hidden md:flex flex-col items-center gap-3">
      
      {/* Resume Document Button */}
      {data?.social?.resumeUrl && (
        <motion.a
          href={data.social.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all duration-300"
          style={{
            borderColor: 'rgba(255,255,255,0.15)',
            background: 'rgba(10,5,20,0.9)',
            backdropFilter: 'blur(24px)',
          }}
          whileHover={{ scale: 1.1, borderColor: 'rgba(5,217,232,0.5)', y: -2 }}
          whileTap={{ scale: 0.95 }}
          title="View Resume"
        >
          <FileText size={18} style={{ color: 'rgba(5,217,232,0.8)' }} />
        </motion.a>
      )}

      {/* Drone Mode Button */}
      <motion.button
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all duration-300"
        style={{
          borderColor: 'rgba(255,255,255,0.15)',
          background: 'rgba(10,5,20,0.9)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={toggleDrone}
        whileHover={{ scale: 1.1, borderColor: 'rgba(34,197,94,0.5)' }}
        whileTap={{ scale: 0.95 }}
        title="Explore City (RC Drone Mode)"
      >
        <Gamepad2 size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
      </motion.button>

      {/* Theme Palette Toggle */}
      <motion.button
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border-2 border-white/15 transition-all duration-300 hover:border-white/30"
        style={{ background: 'rgba(10,5,20,0.9)', backdropFilter: 'blur(24px)' }}
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Switch Theme"
      >
        <Palette size={18} className="text-white/60" />
      </motion.button>

      {/* Theme Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-28 right-0 rounded-2xl border-2 border-white/10 p-4 min-w-[200px]"
            style={{ background: 'rgba(10,5,20,0.95)', backdropFilter: 'blur(32px)' }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mb-3 px-1">Theme</p>
            <div className="space-y-1.5">
              {themes.map((theme) => {
                const isActive = activeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelect(theme.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
                    style={{
                      borderColor: isActive ? `${theme.colors.primary}40` : 'transparent',
                      background: isActive ? `${theme.colors.primary}10` : 'transparent',
                    }}
                  >
                    <div className="flex gap-1 flex-shrink-0">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                    </div>
                    <span className={`font-mono text-xs tracking-wider ${isActive ? 'text-white' : 'text-white/50'}`}>
                      {theme.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary, boxShadow: `0 0 8px ${theme.colors.primary}` }} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
