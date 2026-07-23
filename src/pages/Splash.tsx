import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Splash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-950 via-gray-900 to-blue-950">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/20 rounded-full blob-animate blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blob-animate blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        className="relative flex flex-col items-center gap-6 text-center px-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl scale-150 animate-pulse" />
          <img
            src="/images/logo.png"
            alt="S.B. Jain Institute Logo"
            className="relative w-28 h-28 object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Campus<span className="text-green-400">Connect</span>
          </h1>
          <p className="text-green-300 text-sm mt-2 font-medium tracking-widest uppercase">
            Smart Indoor Navigation
          </p>
        </motion.div>

        {/* Institute Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-xs"
        >
          <p className="text-white/70 text-sm">S.B. Jain Institute of Technology, Management & Research</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="flex flex-col items-center gap-3 mt-4"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <p className="text-white/40 text-xs">Loading campus data...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Splash;
