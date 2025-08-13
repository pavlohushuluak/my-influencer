import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Zap, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Available':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' };
      case 'Beta':
        return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' };
      case 'Coming soon':
        return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' };
      case 'Open Beta':
        return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' };
      default:
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium ${config.color} ${config.bg} border ${config.border}`}>
      <Icon size={12} />
      <span>{status}</span>
    </span>
  );
};

const sections = [
  {
    title: 'Influencers',
    items: [
      { name: 'New', status: 'Available' },
      { name: 'Profiles', status: 'Available' },
      { name: 'AI Consistency', status: 'Available' },
      { name: 'Templates', status: 'Available' }
    ]
  },
  {
    title: 'Create',
    items: [
      { name: 'Images', status: 'Available' },
      { name: 'Videos', status: 'Available' },
      { name: 'AI Edit', status: 'Available' },
      { name: 'Face Swap', status: 'Available', note: '(consent required)' },
      { name: 'Optimizer', status: 'Available' }
    ]
  },
  {
    title: 'Library',
    items: [
      { name: 'Images', status: 'Available' },
      { name: 'Videos', status: 'Available' },
      { name: 'Audios', status: 'Available' }
    ]
  },
  {
    title: 'Social',
    items: [
      { name: 'Bio', status: 'Available' },
      { name: 'Story', status: 'Coming soon' },
      { name: 'Schedule', status: 'Coming soon' },
      { name: 'Batch', status: 'Coming soon' },
      { name: 'Fanvue', status: 'Open Beta' }
    ]
  }
];

const ProductOverview = () => {
  return (
    <section id="product" className="py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Product{' '}
            <span className="text-purple-400 font-medium">
              overview
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            See what's available and what we are working on.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-8">
                {section.title}
              </h3>
              
              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-slate-300 font-medium">
                        {item.name}
                      </div>
                      {item.note && (
                        <div className="text-xs text-slate-500 mt-1">
                          {item.note}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={item.status} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="mt-6 text-slate-500 text-sm max-w-2xl mx-auto italic">
            Beta and Coming Soon features may require opt‑in. Roadmap subject to change.
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductOverview;