import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {progress <= 100 && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06020a]"
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }} // Slower, cinematic fade out
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center"
          >
             <p className="font-mono text-xs tracking-[0.3em] text-cyan-500/70 mb-4">
                SYSTEM INITIALIZATION
             </p>
             <div className="w-64 h-[1px] bg-cyan-900/40 overflow-hidden relative">
                <motion.div 
                   className="absolute top-0 left-0 bottom-0 bg-cyan-400 shadow-[0_0_10px_#05d9e8]"
                   style={{ width: `${progress}%` }}
                />
             </div>
             <p className="font-mono text-[10px] text-cyan-700 mt-2">{progress}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
