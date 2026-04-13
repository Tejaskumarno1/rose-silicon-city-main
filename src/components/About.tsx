import { motion } from 'framer-motion';
import { Target, GraduationCap, BookOpen } from 'lucide-react';

const About = () => {
  const coursework = ['DSA', 'Operating Systems', 'DBMS', 'Computer Networks'];

  return (
    <section id="about" className="relative min-h-screen flex items-center justify-center px-4 py-32 z-10">
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
            <p className="text-white/50 font-mono text-xs tracking-[0.3em] uppercase">District 01</p>
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3"
            style={{ textShadow: '0 0 40px rgba(183,67,232,0.3)' }}>
            The Core System
          </h2>
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase">About & Objective</p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* Objective */}
          <motion.div
            className="lg:col-span-7 rounded-2xl border-2 border-white/10 p-8 md:p-10 flex flex-col justify-between"
            style={{ background: 'rgba(10,5,20,0.85)', backdropFilter: 'blur(32px)' }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center"
                  style={{ borderColor: '#ff2a6d30', background: '#ff2a6d10' }}>
                  <Target size={18} strokeWidth={1.5} style={{ color: '#ff2a6d' }} />
                </div>
                <p className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: '#ff2a6d' }}>
                  Mission Objective
                </p>
              </div>

              <div className="relative border-l-2 pl-6 py-1 mb-10" style={{ borderColor: '#ff2a6d25' }}>
                <div className="absolute top-0 left-[-2px] w-[2px] h-4" style={{ backgroundColor: '#ff2a6d' }} />
                <div className="absolute bottom-0 left-[-2px] w-[2px] h-4" style={{ backgroundColor: '#ff2a6d' }} />
                <p className="text-white/70 font-body text-base md:text-lg leading-relaxed md:leading-loose">
                  3rd-year CSE undergrad at SR University (Class of 2027) specialising in
                  <span className="text-white font-medium"> AI/ML</span> and
                  <span className="text-white font-medium"> full-stack development</span>.
                  150+ LeetCode problems solved; national/finalist rounds in 4 hackathons. Seeking a software engineering internship in backend, AI, or product engineering.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['AI / ML', 'Full Stack', '150+ LC'].map((tag, i) => {
                const colors = ['#ff2a6d', '#05d9e8', '#b743e8'];
                return (
                  <motion.div
                    key={tag}
                    className="flex items-center justify-center p-4 rounded-xl font-mono text-xs tracking-widest uppercase border-2 cursor-default"
                    style={{ borderColor: `${colors[i]}25`, background: `${colors[i]}08`, color: colors[i] }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ borderColor: `${colors[i]}50`, boxShadow: `0 0 15px ${colors[i]}20` }}
                  >
                    {tag}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="lg:col-span-5 flex flex-col gap-6"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Education Card */}
            <div className="rounded-2xl border-2 border-white/10 p-8 relative overflow-hidden flex-1 group"
              style={{ background: 'rgba(10,5,20,0.85)', backdropFilter: 'blur(32px)' }}>
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: '#05d9e8' }} />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center"
                  style={{ borderColor: '#05d9e830', background: '#05d9e810' }}>
                  <GraduationCap size={18} strokeWidth={1.5} style={{ color: '#05d9e8' }} />
                </div>
                <p className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: '#05d9e8' }}>
                  Education
                </p>
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-white font-display text-2xl md:text-3xl mb-1">SR University</p>
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Computer Science Eng.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl md:text-5xl font-display font-bold leading-none mb-1" style={{ color: '#05d9e8' }}>7.68</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">CGPA</div>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-white/5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#05d9e8' }} />
                <span className="text-white/60 font-mono text-xs uppercase tracking-widest">2023 — 2027</span>
              </div>
            </div>

            {/* Coursework Card */}
            <div className="rounded-2xl border-2 border-white/10 p-8"
              style={{ background: 'rgba(10,5,20,0.85)', backdropFilter: 'blur(32px)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center"
                  style={{ borderColor: '#ffb80030', background: '#ffb80010' }}>
                  <BookOpen size={18} strokeWidth={1.5} style={{ color: '#ffb800' }} />
                </div>
                <p className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: '#ffb800' }}>
                  Core Coursework
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {coursework.map((course, i) => (
                  <motion.span
                    key={course}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono text-white/60 border border-white/10 bg-black/30 cursor-default"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    whileHover={{
                      borderColor: '#ffb80040',
                      color: 'white',
                      boxShadow: '0 0 15px rgba(255,184,0,0.15)',
                    }}
                  >
                    {course}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
