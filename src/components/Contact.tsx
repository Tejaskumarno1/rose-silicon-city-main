import { motion } from 'framer-motion';
import { useState } from 'react';
import { Github, Linkedin, Mail, Phone, Send, ArrowUpRight } from 'lucide-react';

const socialLinks = [
  { label: 'GitHub', url: 'https://github.com/Tejaskumarno1', Icon: Github, color: '#ff2a6d' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/boddu-tejas-kumar', Icon: Linkedin, color: '#05d9e8' },
  { label: 'Email', url: 'mailto:tejaskumarwgl@gmail.com', Icon: Mail, color: '#b743e8' },
  { label: 'Phone', url: 'tel:+918125865459', Icon: Phone, color: '#ffb800' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="relative min-h-screen flex items-center justify-center px-4 py-32">
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
            <p className="text-white/50 font-mono text-xs tracking-[0.3em] uppercase">District 05</p>
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3"
            style={{ textShadow: '0 0 40px rgba(183,67,232,0.3)' }}>
            The Signal Tower
          </h2>
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Let's connect & build together</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="lg:col-span-3 rounded-2xl border-2 border-white/10 p-8 md:p-10 space-y-6"
            style={{ background: 'rgba(10,5,20,0.85)', backdropFilter: 'blur(32px)' }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div>
              <label className="block font-mono text-[10px] text-white/30 mb-2 uppercase tracking-[0.3em]">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-white/[0.03] border-2 border-white/10 rounded-xl px-5 py-4 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#05d9e8]/40 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-white/30 mb-2 uppercase tracking-[0.3em]">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-white/[0.03] border-2 border-white/10 rounded-xl px-5 py-4 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#05d9e8]/40 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-white/30 mb-2 uppercase tracking-[0.3em]">Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className="w-full bg-white/[0.03] border-2 border-white/10 rounded-xl px-5 py-4 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#05d9e8]/40 transition-colors resize-none"
                placeholder="Your message..."
              />
            </div>
            <motion.button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-mono text-sm uppercase tracking-[0.2em] border-2 transition-all duration-300 cursor-pointer"
              style={{
                borderColor: sent ? '#05d9e8' : 'rgba(255,42,109,0.3)',
                background: sent ? 'rgba(5,217,232,0.1)' : 'rgba(255,42,109,0.05)',
                color: sent ? '#05d9e8' : '#ff2a6d',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(255,42,109,0.2)' }}
              whileTap={{ scale: 0.98 }}
            >
              {sent ? (
                <>✓ Signal Sent</>
              ) : (
                <><Send size={16} /> Send Signal</>
              )}
            </motion.button>
          </motion.form>

          {/* Social Links */}
          <motion.div
            className="lg:col-span-2 flex flex-col gap-4"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {socialLinks.map((link, i) => {
              const LinkIcon = link.Icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 p-5 rounded-2xl border-2 border-white/10 transition-all duration-300 cursor-pointer"
                  style={{ background: 'rgba(10,5,20,0.85)', backdropFilter: 'blur(24px)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{
                    borderColor: `${link.color}40`,
                    boxShadow: `0 0 20px ${link.color}15`,
                    y: -2,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{ borderColor: `${link.color}30`, background: `${link.color}10` }}>
                    <LinkIcon size={20} strokeWidth={1.5} style={{ color: link.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mb-0.5">{link.label}</p>
                    <p className="font-body text-sm text-white/70 truncate group-hover:text-white transition-colors">
                      {link.url.replace('mailto:', '').replace('tel:', '').replace('https://', '')}
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="text-white/10 group-hover:text-white/40 transition-colors flex-shrink-0" />
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
