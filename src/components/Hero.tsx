import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Hero = () => {
  const [subtitle, setSubtitle] = useState('');
  const fullSubtitle = 'AI/ML · Full-Stack · CSE Undergrad';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullSubtitle.length) {
        setSubtitle(fullSubtitle.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      {/* Soft black radial vignette behind text ensures absolute readability against bright 3D scenes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(4,0,10,0.6)_0%,_rgba(0,0,0,0)_50%)] pointer-events-none z-0" />
      
      <div className="text-center z-10 max-w-4xl mx-auto drop-shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <motion.p
            className="text-sm md:text-base font-mono tracking-[0.4em] uppercase text-white/90 drop-shadow-[0_0_8px_rgba(5,217,232,0.8)] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to my world
          </motion.p>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4 leading-[1.1] tracking-tight">
            {/* White text core, massive Pink neon shadow */}
            <span className="block text-white glow-text">TEJAS</span>
            {/* White text core, massive Purple neon shadow */}
            <span className="block text-white glow-secondary mt-2">KUMAR</span>
          </h1>

          <motion.div
            className="h-[2px] w-48 mx-auto mb-8"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)', boxShadow: '0 0 10px hsl(var(--gold))' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          />

          <p className="font-mono text-base md:text-lg text-white/80 tracking-wide drop-shadow-md mb-12 h-6">
            {subtitle}
            <motion.span
              className="inline-block w-1.5 h-5 bg-white drop-shadow-[0_0_8px_rgba(255,255,255,1)] ml-1 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          </p>

          <motion.a
            href="#about"
            className="inline-flex items-center gap-3 px-10 py-5 glass-card-strong text-white font-mono text-sm tracking-[0.2em] uppercase group cursor-pointer gradient-border"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Enter My World
            <motion.span
              className="text-accent"
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ↓
            </motion.span>
          </motion.a>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-2 h-2 rounded-full bg-primary"
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-3 h-3 rounded-full bg-accent"
          animate={{ y: [10, -10, 10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
        <motion.div
          className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full bg-secondary"
          animate={{ y: [-5, 15, -5], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
        />
      </div>
    </section>
  );
};

export default Hero;
