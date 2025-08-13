import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Zap } from 'lucide-react';

const roadmapItems = [
  {
    title: 'Now',
    items: [
      'Image Studio · AI Consistency · Videos & Audios · Templates · Library · Bio · Fanvue Analytics & DMs (Open Beta) · Optimizer'
    ],
    status: 'current',
    icon: CheckCircle,
    color: 'purple'
  },
  {
    title: 'Next',
    items: [
      'Schedule (Beta) · Nymia Go (Companion App)'
    ],
    status: 'next',
    icon: Zap,
    color: 'yellow'
  },
  {
    title: 'Later',
    items: [
      'Batch publishing · Advanced analytics'
    ],
    status: 'later',
    icon: Clock,
    color: 'gray'
  }
];

const Roadmap = () => {
  return (
    <section id="roadmap" className="py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Roadmap
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {item.title}
                </h3>
              </div>

              <div>
                {item.items.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="text-slate-300 leading-relaxed"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-slate-400 mb-6">
            Join our beta list to get early access and shape what ships next.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-500 text-white px-8 py-3 rounded-md font-medium hover:bg-purple-400 transition-all duration-300"
          >
            Join beta list
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Roadmap;