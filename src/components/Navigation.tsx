import { motion } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certs', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <motion.nav
        className="fixed top-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2 px-3 py-2 glass-card-strong gradient-border rounded-full"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="relative px-5 py-2 rounded-full font-mono text-xs md:text-sm uppercase tracking-widest text-white/60 hover:text-white hover:glow-text hover:bg-white/5 transition-all duration-300"
          >
            {item.label}
          </a>
        ))}
      </motion.nav>

      {/* Mobile hamburger */}
      <motion.button
        className="fixed top-4 right-4 z-50 md:hidden w-12 h-12 glass-card-strong gradient-border rounded-full flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex flex-col gap-1.5">
          <motion.span className={`block w-5 h-[2px] ${isOpen ? 'bg-primary' : 'bg-white'} rounded-full`} animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }} />
          <motion.span className={`block w-5 h-[2px] ${isOpen ? 'bg-primary' : 'bg-white'} rounded-full`} animate={{ opacity: isOpen ? 0 : 1 }} />
          <motion.span className={`block w-5 h-[2px] ${isOpen ? 'bg-primary' : 'bg-white'} rounded-full`} animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }} />
        </div>
      </motion.button>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-[rgba(10,5,20,0.95)] backdrop-blur-3xl flex flex-col items-center justify-center gap-8 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {navItems.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="font-mono text-3xl uppercase tracking-widest text-white/50 hover:text-white hover:glow-text transition-all duration-300"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {item.label}
            </motion.a>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default Navigation;
