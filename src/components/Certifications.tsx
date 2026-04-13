import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Trophy, Building2, Laptop, Award } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

const iconMap = {
  Trophy,
  Building2,
  Laptop,
  Award,
};

const Certifications = () => {
  const data = usePortfolio();
  const items = data?.certifications || [];
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section id="certifications" className="relative min-h-screen flex items-center justify-center px-4 py-32">
      <div className="max-w-5xl mx-auto w-full z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
            <p className="text-white/50 font-mono text-xs tracking-[0.3em] uppercase">District 04</p>
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3"
            style={{ textShadow: '0 0 40px rgba(183,67,232,0.3)' }}>
            The Timeline
          </h2>
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Hackathons, Certifications & Leadership</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto mt-20">
          {/* Central line / glowing track */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px md:-translate-x-1/2 bg-gradient-to-b from-primary/50 via-secondary/30 to-transparent shadow-[0_0_15px_rgba(5,217,232,0.3)]" />

          <div className="space-y-12 md:space-y-20 relative">
            {items.map((item: any, i: number) => {
              const isOpen = expanded === i;
              const ItemIcon = iconMap[item.icon as keyof typeof iconMap] || Award;
              // Alternate left/right for desktop
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={item.title}
                  className={`relative flex flex-col md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} gap-8 md:gap-16 items-start md:items-center pl-20 md:pl-0 group`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  {/* Central Node */}
                  <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-12 md:w-16 flex justify-center z-10 transition-transform duration-500 ${isOpen ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: 'rgba(10,5,20,0.95)',
                        borderColor: isOpen ? item.color : 'rgba(255,255,255,0.1)',
                        boxShadow: isOpen || true ? `0 0 20px ${item.color}20` : 'none',
                      }}>
                      {/* Pulse Background */}
                      <div className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-40" style={{ background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)` }} />
                      <ItemIcon size={20} strokeWidth={1.5} style={{ color: item.color }} className="relative z-10" />
                    </div>
                  </div>

                  {/* Spacer for alternating side */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Card Content */}
                  <motion.div
                    className={`w-full md:w-1/2 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden relative`}
                    style={{
                      borderColor: isOpen ? `${item.color}50` : 'rgba(255,255,255,0.08)',
                      background: 'rgba(20,10,30,0.4)',
                      backdropFilter: 'blur(24px)',
                    }}
                    onClick={() => setExpanded(isOpen ? null : i)}
                    whileHover={{ borderColor: `${item.color}40`, y: -2 }}
                  >
                    {/* Glowing highlight strip */}
                    <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }} />
                    
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                        <div>
                          <h3 className="font-display text-xl md:text-2xl text-white group-hover:text-white transition-colors"
                            style={{ textShadow: isOpen ? `0 0 20px ${item.color}40` : 'none' }}>
                            {item.title}
                          </h3>
                          <p className="text-white/50 font-mono text-xs mt-1 tracking-wide">{item.subtitle}</p>
                        </div>
                        <span className="font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 rounded-lg border border-white/10 text-white/40 flex-shrink-0 w-fit"
                          style={isOpen ? { borderColor: `${item.color}30`, color: item.color, background: `${item.color}10` } : {}}>
                          {item.date}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 mt-5 border-t border-white/5">
                              <p className="text-white/70 font-body text-sm leading-relaxed tracking-wide">{item.description}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
