import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const features = [
  'High‑quality image generation with style templates',
  'Post‑processing and AI edits',
  'Face Swap (with explicit consent only)',
  'Asset series builder for carousels and PPV packs'
];

const ImageStudio = () => {
  return (
    <section id="image-studio" className="py-32 bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Image Studio{' '}
            <span className="text-purple-400 font-medium">
              (today's superpower)
            </span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Studio Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto">
              <img 
                src="/quality_post.png" 
                alt="Image Studio Interface"
                className="w-full h-full object-cover rounded-3xl opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent rounded-3xl" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Generate', 'Edit', 'Enhance', 'Export'].map((action, index) => (
                      <div key={index} className="text-center">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <div className="w-3 h-3 bg-purple-400 rounded-full" />
                        </div>
                        <div className="text-white text-sm font-medium">{action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <Check className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                  
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {feature}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageStudio;