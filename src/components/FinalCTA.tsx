import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="relative py-32 bg-slate-800 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Success with Virtual Influencer"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/95 via-slate-800/80 to-slate-800/95" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Success Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="relative max-w-4xl mx-auto">
            <img 
              src="/cta.png" 
              alt="Launch Virtual Influencer CTA"
              className="w-full h-96 object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent rounded-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-8 py-6 text-center">
                <div className="text-white text-2xl font-bold mb-2">Launch a virtual influencer in under 60 minutes.</div>
                <div className="text-slate-300">It's never been this simple.</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-12 leading-tight">
            Ready to launch your{' '}
            <span className="text-purple-400 font-medium">
              first virtual influencer?
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-500 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-purple-400 transition-all duration-300"
            >
              Start free
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-slate-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-slate-800 transition-colors inline-flex items-center space-x-2"
            >
              <Play size={16} />
              <span>Watch demo</span>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-400 text-sm italic"
          >
            Average times are estimates and may vary. Features marked Beta/Coming Soon require opt‑in and may change.
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;