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
    <section id="pricing" className="py-32 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Simple Pricing
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your virtual influencer journey. 
            <span className="text-purple-400 font-medium"> Gems included monthly. Top‑ups never expire.</span>
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
              className="w-full h-64 object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent rounded-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-10 py-8 text-center shadow-2xl">
                <div className="text-white text-3xl font-bold mb-3">Start Free Today</div>
                <div className="text-slate-300 text-lg">15 Gems to create your first virtual influencer</div>
                <div className="text-purple-400 text-sm mt-2 font-medium">No credit card required</div>
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
              className={`relative bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 flex flex-col h-full ${
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

              <div className="space-y-3 mb-6 flex-grow">
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
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-purple-500/25'
                    : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 shadow-slate-500/25'
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
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">
              Top‑up Gems
            </h3>
            <p className="text-slate-400 text-lg mb-2">
              <span className="text-purple-400 font-semibold">Never expire</span> • Available in packs of:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {topUps.map((amount, index) => (
                <span key={index} className="bg-slate-800 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-300 cursor-pointer">
                  {amount} Gems
                </span>
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-4 italic">
              Pricing shown at checkout
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl shadow-purple-500/25"
            >
              Start Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-slate-600 text-slate-300 px-10 py-4 rounded-xl font-semibold hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
            >
              Add Gems
            </motion.button>
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
            <span className="text-purple-400 font-medium">Monthly Gems</span> refresh each billing cycle. 
            <span className="text-purple-400 font-medium"> Top‑up Gems</span> never expire and can be used anytime.
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;