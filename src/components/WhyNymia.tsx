import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock, Palette, Shield, TrendingUp, ZoomIn } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Create faster',
    description: 'From idea to first assets in under an hour.',
    hasImage: true,
    imageSrc: '/Speed.png'
  },
  {
    icon: Lock,
    title: 'Stay consistent',
    description: 'Lock the look with AI Consistency — training runs in the background.',
    hasImage: true,
    imageSrc: '/consistency.png'
  },
  {
    icon: Palette,
    title: 'One studio',
    description: 'Images, post‑processing, videos, audio, LipSync.',
    hasImage: true,
    imageSrc: '/one_studio.png'
  },
  {
    icon: Shield,
    title: 'Platform‑ready',
    description: 'SFW for Instagram; SFW/NSFW for Fanvue PPV (subject to platform policies).',
    hasImage: true,
    imageSrc: '/platform_ready.png'
  },
  {
    icon: TrendingUp,
    title: 'Value over complexity',
    description: 'You focus on growth; we handle the tech.',
    hasImage: true,
    imageSrc: '/tech.png'
  }
];

const WhyNymia = () => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  return (
    <section id="why-nymia" className="py-32 bg-slate-800">
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

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Why{' '}
            <span className="text-purple-400 font-medium">Nymia</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group relative"
            >
              {/* Feature Card */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-8 h-full">
                {/* Content */}
                <div className="relative z-10">
                  {/* Mini-Hero Image or Icon */}
                  {feature.hasImage ? (
                    <motion.div
                     whileHover={{ scale: 1.05, y: -4 }}
                     className="w-full h-40 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700/30 to-slate-800/50 cursor-pointer relative group shadow-lg border border-slate-600/30"
                      onClick={() => setHoveredImage(feature.imageSrc)}
                    >
                     {/* Gradient Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10" />
                     
                      <img 
                        src={feature.imageSrc}
                        alt={feature.title}
                       className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                        onError={(e) => {
                          console.log(`Failed to load image: ${feature.imageSrc}`);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded: ${feature.imageSrc}`);
                        }}
                      />
                     
                     {/* Glow Effect */}
                     <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl" />
                     
                      {/* Hover Indicator */}
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
                       <div className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-full border border-slate-600/50 shadow-lg">
                          <ZoomIn className="text-white w-5 h-5" />
                        </div>
                      </div>
                     
                     {/* Corner Accent */}
                     <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20" />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-6"
                    >
                      <feature.icon className="text-purple-400" size={28} />
                    </motion.div>
                  )}
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNymia;