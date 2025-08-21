import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ScrollToEndButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show button after scrolling 300px
      setIsVisible(scrolled > 300);
      
      // Hide button when near bottom (within 200px)
      setIsAtBottom(scrolled + windowHeight >= documentHeight - 200);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Check initial state

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToEnd = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && !isAtBottom && (
        <motion.div
          initial={{ opacity: 0, scale: 0, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0, x: 100 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 0.4 
          }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.button
            whileHover={{ 
              scale: 1.15,
              y: -2,
              boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)"
            }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToEnd}
            className="group relative w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/10"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md opacity-50 -z-10"
            />
            
            {/* Pulse ring */}
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 border-2 border-purple-400 rounded-full -z-10"
            />

            {/* Arrow with bounce animation */}
            <motion.div
              animate={{ 
                y: [0, 3, 0] 
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <ChevronDown className="w-6 h-6 drop-shadow-lg" strokeWidth={2.5} />
            </motion.div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg whitespace-nowrap shadow-lg border border-gray-700/50 pointer-events-none"
            >
              Scroll to bottom
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-900/90 rotate-45 transform -translate-y-1/2" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToEndButton;
