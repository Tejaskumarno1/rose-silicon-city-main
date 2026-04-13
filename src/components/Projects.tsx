import { motion } from 'framer-motion';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useEffect, useRef, useState } from 'react';

const Projects = () => {
  const data = usePortfolio();
  const projects = data?.projects || [];
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scroll = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (!isHovered && !isDown.current && scrollRef.current) {
        // Scroll speed: ~60px per second -> 0.06px per ms
        scrollRef.current.scrollLeft += dt * 0.05;
        
        // Endless loop logic: if we scroll halfway through the duplicated content, jump back
        // We duplicated the array 4 times, so halfway is scrollWidth / 2
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  // Mouse Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    scrollRef.current.style.scrollSnapType = 'none'; // Disable snapping while dragging
    scrollRef.current.style.cursor = 'grabbing';
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x mandatory';
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const onMouseUp = () => {
    isDown.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x mandatory';
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scrollBy = (direction: number) => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth < 768 ? window.innerWidth * 0.85 : 600;
      scrollRef.current.scrollBy({ left: (cardWidth + 32) * direction, behavior: 'smooth' });
    }
  };

  return (
    <section id="projects" className="relative min-h-screen flex items-center justify-center px-4 py-32">
      <div className="max-w-6xl mx-auto w-full z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
              <p className="text-white/50 font-mono text-xs tracking-[0.3em] uppercase">District 03</p>
            </div>
            <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3"
              style={{ textShadow: '0 0 40px rgba(5,217,232,0.3)' }}>
              The Project Hub
            </h2>
            <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Featured Works</p>
          </motion.div>

          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <button onClick={() => scrollBy(-1)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#05d9e8] text-white/50 hover:text-white transition-all">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => scrollBy(1)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#05d9e8] text-white/50 hover:text-white transition-all">
              <ChevronRight size={24} />
            </button>
          </motion.div>
        </div>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>

        {/* Projects Slider */}
        <div className="relative w-[100vw] left-1/2 -translate-x-1/2 px-4 md:px-8 overflow-hidden mask-edges"
             style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto hide-scrollbar cursor-grab py-8 px-[10vw]"
            style={{ scrollSnapType: 'x mandatory' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); onMouseLeave(); }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
          >
            {[...projects, ...projects, ...projects, ...projects].map((project, idx) => (
              <motion.div
                key={`${project.title}-${idx}`}
                className="group relative rounded-2xl border-2 overflow-hidden shrink-0 w-[85vw] max-w-[500px] md:max-w-[600px]"
                style={{
                  borderColor: `${project.color}20`,
                  background: 'rgba(10,5,20,0.85)',
                  backdropFilter: 'blur(32px)',
                }}
                whileHover={{ y: -4, borderColor: `${project.color}40`, boxShadow: `0 10px 40px -10px ${project.color}30` }}
                transition={{ duration: 0.3 }}
              >
                {/* Top accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }} />

                <div className="p-8 md:p-10">
                  {/* Badge + Title */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="pr-4">
                      <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: project.color }}>
                        {project.subtitle}
                      </p>
                      <h3 className="font-display text-2xl md:text-3xl text-white leading-tight">{project.title}</h3>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" 
                           onClick={(e) => { e.stopPropagation(); }}
                           className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors">
                          <Github size={16} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                           onClick={(e) => { e.stopPropagation(); }}
                           className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/60 font-body text-sm leading-relaxed mb-8">{project.description}</p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tech.map((t: string) => (
                      <span key={t} className="px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-wider border border-white/10 text-white/50 bg-white/[0.03]">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Stats Bar */}
                  <div className="flex gap-8 pt-6 border-t border-white/5">
                    {project.stats.map((stat: { label: string, value: string }) => (
                      <div key={stat.label}>
                        <p className="font-display text-3xl font-bold mb-1" style={{ color: project.color }}>
                          {stat.value}
                        </p>
                        <p className="text-white/30 font-mono text-[10px] tracking-[0.2em] uppercase">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                  style={{ backgroundColor: project.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
