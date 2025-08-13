import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Brain, Image, FolderOpen, ArrowRight, ZoomIn } from 'lucide-react';

const phases = [
  {
    phase: 'Phase 1',
    title: 'Create your Influencer',
    description: 'Set name, visuals, and backstory with guided prompts.',
    time: 'Avg. setup: ~10 minutes.',
    icon: User,
    imageSrc: '/phase1.png'
  },
  {
    phase: 'Phase 2',
    title: 'Lock the Look (AI Consistency)',
    description: 'We handle training automatically — no settings, no jargon.',
    time: 'Runs ~30 minutes in the background.',
    icon: Brain,
    imageSrc: '/phase2.png'
  },
  {
    phase: 'Phase 3',
    title: 'Generate Exclusive Content',
    description: 'Produce images (and soon videos, audio, LipSync) using curated templates.',
    time: 'Ready‑to‑post packs for Instagram & Fanvue.',
    icon: Image,
    imageSrc: '/phase3.png'
  },
  {
    phase: 'Phase 4',
    title: 'Organize & Prepare to Publish',
    description: 'Sort by series, prepare Fanvue PPV sets, export IG carousels, and queue ideas.',
    time: 'Downloads available on paid plans.',
    icon: FolderOpen,
    imageSrc: '/phase4.png'
  }
];

const HowItWorks = () => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  return (
    <section id="how-it-works" className="relative py-32 bg-slate-900 overflow-hidden">
      {/* Large Image Overlay */}
      {hoveredImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center"
          onClick={() => setHoveredImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-4xl max-h-[80vh] w-full mx-6"
          >
            <img 
              src={hoveredImage}
              alt="Large preview"
              className="w-full h-full object-contain rounded-3xl shadow-2xl"
            />
            <button
              onClick={() => setHoveredImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/consistency.png" 
          alt="AI Workflow Background"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-slate-900/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            How it works — the{' '}
            <span className="text-purple-400 font-medium">4‑phase assistant</span>
          </h2>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Process Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                  alt="AI Workflow Process"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 via-transparent to-slate-800/90" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="text-white text-3xl font-bold mb-2">60 Minutes</div>
                <div className="text-slate-300">From Idea to Virtual Influencer</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/70 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  {/* Phase Image */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group/phase bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30"
                    onClick={() => setHoveredImage(phase.imageSrc)}
                  >
                    <img 
                      src={phase.imageSrc}
                      alt={phase.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover/phase:scale-110 group-hover/phase:brightness-110"
                    />
                    <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover/phase:opacity-100 transition-all duration-300 rounded-2xl" />
                    <div className="absolute inset-0 opacity-0 group-hover/phase:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-slate-900/90 backdrop-blur-sm p-2 rounded-full border border-slate-600/50 shadow-lg">
                        <ZoomIn className="text-white w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <div>
                    <div className="text-sm font-medium text-purple-400 mb-1">
                      {phase.phase}
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-300 mb-4 leading-relaxed">
                  {phase.description}
                </p>

                <div className="text-sm text-slate-400 italic">
                  {phase.time}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-500 text-white px-12 py-6 rounded-md text-xl font-semibold hover:bg-purple-400 transition-colors inline-flex items-center space-x-3"
          >
            <span>Start the 4‑phase flow</span>
            <ArrowRight size={24} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;