import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    title: 'AI Multi-Agent Recruitment SaaS',
    subtitle: 'MAHAYUDH',
    description:
      'Architected a Jarvis-like system of 8 specialised AI agents handling the full recruitment pipeline — JD parsing, resume scoring, candidate matching, automated screening calls, ranking, and skill assessment — cutting simulated recruiter effort by ~60%.',
    tech: ['Python', 'TensorFlow', 'React.js', 'Node.js', 'LangChain', 'AWS'],
    stats: [
      { label: 'Effort Reduced', value: '60%' },
      { label: 'AI Agents', value: '8' },
    ],
    color: '#05d9e8',
  },
  {
    title: 'AI Traffic Optimizer',
    subtitle: 'Computer Vision',
    description:
      'Designed a real-time multi-lane traffic monitoring system using OpenCV and a custom-trained deep learning model to detect congestion patterns and rule violations with ~89% accuracy. Built an automated signal control engine that dynamically recalculates timings.',
    tech: ['Python', 'OpenCV', 'TensorFlow', 'Deep Learning'],
    stats: [
      { label: 'Accuracy', value: '89%' },
      { label: 'Wait Time', value: '-30%' },
    ],
    color: '#ff2a6d',
  },
];

const Projects = () => {
  return (
    <section id="projects" className="relative min-h-screen flex items-center justify-center px-4 py-32">
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
            <p className="text-white/50 font-mono text-xs tracking-[0.3em] uppercase">District 03</p>
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3"
            style={{ textShadow: '0 0 40px rgba(5,217,232,0.3)' }}>
            The Project Hub
          </h2>
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Featured Works</p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={project.title}
              className="group relative rounded-2xl border-2 overflow-hidden"
              style={{
                borderColor: `${project.color}20`,
                background: 'rgba(10,5,20,0.85)',
                backdropFilter: 'blur(32px)',
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              whileHover={{ y: -4, borderColor: `${project.color}40` }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }} />

              <div className="p-8 md:p-10">
                {/* Badge + Title */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: project.color }}>
                      {project.subtitle}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl text-white leading-tight">{project.title}</h3>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors cursor-pointer">
                      <Github size={16} />
                    </div>
                    <div className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors cursor-pointer">
                      <ExternalLink size={16} />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/60 font-body text-sm leading-relaxed mb-8">{project.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tech.map((t) => (
                    <span key={t} className="px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-wider border border-white/10 text-white/50 bg-white/[0.03]">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Stats Bar */}
                <div className="flex gap-8 pt-6 border-t border-white/5">
                  {project.stats.map((stat) => (
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
    </section>
  );
};

export default Projects;
