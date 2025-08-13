import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const complianceItems = [
  '18+ only. No content that depicts or appears to depict persons under 18.',
  'Consent required. No real‑person likenesses without explicit, documented consent; no celebrities.',
  'No exploitation or illegal activity. Zero tolerance for harassment, abuse, or criminal use.',
  'Platform policies apply. OnlyFans is not supported as per their policy. SFW/NSFW is supported for Fanvue (subject to their policies) and SFW for Instagram.',
  'Enforcement. Violations may result in immediate account termination and content removal without refund.',
  'Moderation. NSFW behind an explicit toggle; proactive detection for "youthful" traits; report and appeal workflows.'
];

const Compliance = () => {
  return (
    <section id="safety" className="py-32 bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Compliance Hero Image */}
          <div className="mb-8">
            <img 
              src="/compliance.png" 
              alt="Compliance and Safety Standards"
              className="w-full max-w-6xl mx-auto h-96 object-cover rounded-3xl opacity-90"
            />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Compliance &{' '}
            <span className="text-purple-400 font-medium">
              Safety
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            We take user safety and platform compliance seriously.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            <div className="space-y-6">
              {complianceItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <Check className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-slate-300 leading-relaxed">
                    {item}
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

export default Compliance;