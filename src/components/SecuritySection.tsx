import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';

const securityFeatures = [
  {
    icon: Shield,
    title: '2-Factor Authentication',
    description: 'Extra layer of security to protect your account and transactions.'
  },
  {
    icon: Lock,
    title: 'FINTRAC Registered',
    description: 'Fully regulated and compliant with Canadian financial regulations.'
  },
  {
    icon: Eye,
    title: 'Fraud Protection',
    description: 'Advanced monitoring systems to detect and prevent fraudulent activity.'
  }
];

const SecuritySection = () => {
  return (
    <section className="py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Your money is{' '}
            <span className="text-lime-400 font-medium">safe</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            We use industry-leading security measures to protect your money 
            and personal information. Trust is earned, security is guaranteed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-lime-400/10 border border-lime-400/30 rounded-2xl mb-6"
              >
                <feature.icon className="text-lime-400" size={32} />
              </motion.div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-semibold text-white mb-4">
              Trusted by millions
            </h3>
            <p className="text-slate-400">
              We're regulated by financial authorities worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Countries regulated in', value: '40+' },
              { label: 'Customers worldwide', value: '16M+' },
              { label: 'Money transferred', value: '$120B+' },
              { label: 'Security certifications', value: '25+' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-lime-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center mt-12 space-x-4"
        >
          <CheckCircle2 className="text-lime-400" size={24} />
          <span className="text-slate-300 text-lg">
            Money protected up to £85,000 by the Financial Services Compensation Scheme
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;