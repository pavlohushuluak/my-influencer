import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react';

const journeySteps = [
  {
    location: 'Delhi, India',
    action: 'Book taxi ride',
    amount: '₹250',
    flag: '🇮🇳',
    icon: '🚕'
  },
  {
    location: 'London, UK',
    action: 'Coffee & pastry',
    amount: '£8.50',
    flag: '🇬🇧',
    icon: '☕'
  },
  {
    location: 'New York, USA',
    action: 'Metro card top-up',
    amount: '$25.00',
    flag: '🇺🇸',
    icon: '🚇'
  },
  {
    location: 'Tokyo, Japan',
    action: 'Dinner for two',
    amount: '¥4,500',
    flag: '🇯🇵',
    icon: '🍜'
  }
];

const TransactionJourney = () => {
  return (
    <section className="py-32 bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            One card,{' '}
            <span className="text-lime-400 font-medium">everywhere</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Spend like a local in 175+ countries. Your FlowPay card automatically 
            converts at the real exchange rate.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Journey Path */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-400 transform -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Connection Node */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-4 h-4 bg-lime-400 rounded-full border-4 border-slate-900 z-10 hidden lg:block" />

                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 text-center hover:bg-slate-800/70 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{step.icon}</div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <MapPin className="text-slate-400" size={16} />
                    <span className="text-slate-400 text-sm">{step.location}</span>
                    <span className="text-2xl">{step.flag}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.action}
                  </h3>

                  <div className="text-2xl font-bold text-lime-400 mb-4">
                    {step.amount}
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-emerald-400">
                    <CheckCircle size={16} />
                    <span className="text-sm">Paid instantly</span>
                  </div>
                </motion.div>

                {/* Mobile Arrow */}
                {index < journeySteps.length - 1 && (
                  <div className="flex justify-center my-6 lg:hidden">
                    <ArrowRight className="text-slate-400" size={24} />
                  </div>
                )}
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
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Real exchange rates, always
            </h3>
            <p className="text-slate-400 mb-6">
              No hidden fees, no inflated exchange rates. 
              What you see is what you get.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-lime-400 text-slate-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-lime-300 transition-colors"
            >
              Get your FlowPay card
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TransactionJourney;