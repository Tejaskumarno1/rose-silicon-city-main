import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Trophy, Building2, Laptop, Award } from 'lucide-react';

const items = [
  {
    title: 'AVISHKAAR Season 3',
    subtitle: 'Phase 2 — National Level Hackathon',
    date: '2024',
    description: 'Selected among top national teams for building a multi-agent AI SaaS recruitment platform at AITAM Tekkali.',
    color: '#ff2a6d',
    Icon: Trophy,
  },
  {
    title: 'Smart India Hackathon',
    subtitle: 'Level 1 — National Level',
    date: '2024',
    description: 'Cleared internal rounds to represent SR University nationally in the Govt. of India initiative.',
    color: '#05d9e8',
    Icon: Building2,
  },
  {
    title: 'SRU Startup Club',
    subtitle: 'Web Developer & Designer',
    date: 'Aug 2024 – Present',
    description: 'Led end-to-end development of the club website (React.js, Node.js, AWS), increasing online event registrations by ~40%. Mentored 3 junior members.',
    color: '#b743e8',
    Icon: Laptop,
  },
  {
    title: 'AWS Academy & Google',
    subtitle: 'Professional Certifications',
    date: '2024',
    description: 'AWS Cloud Foundations, AWS Cloud Developing, and Google Data Analytics Professional Certificate.',
    color: '#ffb800',
    Icon: Award,
  },
];

const Certifications = () => {
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
        <div className="relative">
          {/* Central line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

          <div className="space-y-6">
            {items.map((item, i) => {
              const isOpen = expanded === i;
              const ItemIcon = item.Icon;
              return (
                <motion.div
                  key={item.title}
                  className="relative pl-16 md:pl-20"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  {/* Node on the timeline */}
                  <div className="absolute left-0 top-5 w-12 md:w-16 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300"
                      style={{
                        borderColor: isOpen ? item.color : 'rgba(255,255,255,0.15)',
                        background: isOpen ? `${item.color}15` : 'rgba(10,5,20,0.9)',
                        boxShadow: isOpen ? `0 0 20px ${item.color}25` : 'none',
                      }}>
                      <ItemIcon size={20} strokeWidth={1.5} style={{ color: isOpen ? item.color : 'rgba(255,255,255,0.4)' }} />
                    </div>
                  </div>

                  {/* Card */}
                  <motion.div
                    className="rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden"
                    style={{
                      borderColor: isOpen ? `${item.color}35` : 'rgba(255,255,255,0.08)',
                      background: 'rgba(10,5,20,0.85)',
                      backdropFilter: 'blur(24px)',
                    }}
                    onClick={() => setExpanded(isOpen ? null : i)}
                    whileHover={{ borderColor: `${item.color}30` }}
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-display text-xl md:text-2xl text-white">{item.title}</h3>
                          <p className="text-white/40 font-mono text-xs mt-1">{item.subtitle}</p>
                        </div>
                        <span className="font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 rounded-lg border border-white/10 text-white/30 flex-shrink-0 ml-4"
                          style={isOpen ? { borderColor: `${item.color}30`, color: item.color } : {}}>
                          {item.date}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t" style={{ borderColor: `${item.color}15` }}>
                              <p className="text-white/60 font-body text-sm leading-relaxed">{item.description}</p>
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
