import { motion } from 'framer-motion';
import { Github, Linkedin, Code2, Mail } from 'lucide-react'; // Using Code2 for Leetcode

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com/in/boddu-tejas-kumar', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/Tejaskumarno1', label: 'GitHub' },
  { icon: Code2, href: 'https://leetcode.com', label: 'LeetCode' },
  { icon: Mail, href: 'mailto:tejaskumarwgl@gmail.com', label: 'Email' },
];

const SocialSidebar = () => {
  return (
    <motion.div
      className="fixed bottom-10 left-6 z-40 hidden md:flex flex-col items-center gap-6 px-2.5 py-4 glass-card-strong gradient-border rounded-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      {socialLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-primary hover:glow-text transition-all duration-300 hover:-translate-y-1 p-1 hover:bg-white/5 rounded-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
            title={link.label}
          >
            <Icon strokeWidth={1.5} size={22} />
          </motion.a>
        );
      })}
    </motion.div>
  );
};

export default SocialSidebar;
