import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    features: [
      '15 Gems at sign‑up (create one influencer without training + first images)',
      'Watermarked previews',
      'Library auto‑deletes after 30 days',
      'Downloads on paid plans'
    ],
    cta: 'Start free',
    popular: false
  },
  {
    name: 'Nymia Starter',
    price: '$9.95',
    period: '/ month',
    features: [
      'no watermarks',
      '170 Gems / month',
      'Downloads enabled',
      '1 GB archive'
    ],
    cta: 'Get started',
    popular: false
  },
  {
    name: 'Nymia Creator',
    price: '$19.95',
    period: '/ month',
    features: [
      'no watermarks',
      '360 Gems / month',
      'Downloads enabled',
      'Priority processing',
      '3 GB archive'
    ],
    cta: 'Get started',
    popular: true
  },
  {
    name: 'Nymia Advanced',
    price: '$49.95',
    period: '/ month',
    features: [
      'no watermarks',
      '950 Gems / month',
      'Downloads enabled',
      'Priority + early Beta access',
      '10 GB archive'
    ],
    cta: 'Get started',
    popular: false
  }
];

const topUps = [
  '150',
  '330', 
  '850',
  '1,800'
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-32 bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Pricing
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Simple plans. Gems included monthly. Top‑ups never expire.
          </p>
        </motion.div>

        {/* Pricing Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="relative max-w-4xl mx-auto">
            <img 
              src="/starterhero1.png" 
              alt="Growth and Success"
              className="w-full h-64 object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-8 py-6 text-center">
                <div className="text-white text-3xl font-bold mb-2">Start Free</div>
                <div className="text-slate-300">15 Gems to create your first influencer</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 ${
                plan.popular 
                  ? 'border-purple-500 ring-2 ring-purple-500/20' 
                  : 'border-slate-700/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Image */}
              <div className="mb-6">
                <img 
                  src={`/price${index + 1}.png`}
                  alt={`${plan.name} Plan`}
                  className="w-full h-32 object-cover rounded-2xl opacity-80"
                />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <Check className="text-purple-400 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-300 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
                  plan.popular
                    ? 'bg-purple-500 text-white hover:bg-purple-400'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Top-up Gems */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-3">
              Top‑up Gems (never expire)
            </h3>
            <p className="text-slate-400">
              {topUps.join(' · ')}
            </p>
            <p className="text-slate-500 text-sm mt-2 italic">
              Pricing shown at checkout.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-500 text-white px-8 py-3 rounded-md font-medium hover:bg-purple-400 transition-all duration-300"
            >
              Start free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-slate-600 text-slate-300 px-8 py-3 rounded-md font-medium hover:bg-slate-800 transition-colors"
            >
              Add Gems
            </motion.button>
          </div>

          <div className="mt-6 text-center text-slate-500 text-sm italic max-w-2xl mx-auto">
            Monthly Gems refresh each billing cycle. Top‑up Gems never expire.
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;