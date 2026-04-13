import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Code2, Globe, Brain, Wrench } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

const iconMap = {
  Code2,
  Globe,
  Brain,
  Wrench,
};

const Skills = () => {
  const data = usePortfolio();
  const skillCategories = data?.skills || [];
  const [activeIdx, setActiveIdx] = useState(0);
  
  // Safe access for active category
  const active = (skillCategories && skillCategories.length > 0) 
    ? skillCategories[activeIdx] || skillCategories[0] 
    : { id: 'fallback', title: 'Skills', label: 'SKILLS', color: '#05d9e8', icon: 'Code2', skills: [] };

  const ActiveIcon = iconMap[active.icon as keyof typeof iconMap] || Code2;

  return (
    <section id="skills" className="relative min-h-screen flex items-center justify-center px-4 py-32">
      <div className="max-w-6xl mx-auto w-full z-10">

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
            <p className="text-white/50 font-mono text-xs tracking-[0.3em] uppercase">District 02</p>
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3"
            style={{ textShadow: `0 0 40px ${active.color}4d` }}>
            The Skill Grid
          </h2>
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Technologies & Expertise</p>
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {skillCategories.map((cat: any, i: number) => {
            const isActive = activeIdx === i;
            const CatIcon = iconMap[cat.icon as keyof typeof iconMap] || Code2;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveIdx(i)}
                className="relative flex items-center gap-3 px-6 py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase transition-all duration-300 whitespace-nowrap border-2 cursor-pointer select-none"
                style={{
                  borderColor: isActive ? cat.color : 'rgba(255,255,255,0.12)',
                  background: isActive ? `${cat.color}15` : 'rgba(10,5,20,0.8)',
                  color: isActive ? cat.color : 'rgba(255,255,255,0.5)',
                  boxShadow: isActive ? `0 0 25px ${cat.color}30, inset 0 1px 0 ${cat.color}20` : 'none',
                }}
              >
                <CatIcon size={16} strokeWidth={2} />
                {cat.label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    layoutId="skillTab"
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl border-2 p-8 md:p-10 overflow-hidden"
            style={{
              borderColor: `${active.color}25`,
              background: 'rgba(10,5,20,0.85)',
              backdropFilter: 'blur(32px)',
            }}
          >
            {/* Ambient corner glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ backgroundColor: active.color }} />

            {/* Panel Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: active.color }}>
                  {active.label} _STACK
                </p>
                <h3 className="font-display text-3xl md:text-4xl text-white">{active.title}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2"
                style={{ borderColor: `${active.color}40`, background: `${active.color}10` }}>
                <ActiveIcon size={24} strokeWidth={1.5} style={{ color: active.color }} />
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {active.skills.map((skill: string, i: number) => (
                <motion.div
                  key={skill}
                  className="group relative flex items-center gap-3 px-5 py-4 rounded-xl border cursor-default transition-all duration-200"
                  style={{
                    borderColor: `${active.color}20`,
                    background: 'rgba(0,0,0,0.3)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{
                    y: -2,
                    borderColor: `${active.color}60`,
                    boxShadow: `0 4px 20px ${active.color}20`,
                  }}
                >
                  {/* Accent dot */}
                  <div className="w-2 h-2 rounded-full flex-shrink-0 transition-shadow duration-200 group-hover:shadow-lg"
                    style={{ backgroundColor: active.color, boxShadow: `0 0 8px ${active.color}50` }} />
                  <span className="font-mono text-sm text-white/80 group-hover:text-white transition-colors">{skill}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Skills;
