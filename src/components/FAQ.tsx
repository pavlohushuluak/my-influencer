import React from 'react';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'Do Gems expire?',
    answer: 'Monthly Gems refresh each cycle; Top‑up Gems never expire.'
  },
  {
    question: 'Can I automate Instagram?',
    answer: 'Not by default. We recommend native posting via QR hand‑off to keep accounts safe. "Nymia Go" is coming soon.'
  },
  {
    question: 'Does Nymia support OnlyFans?',
    answer: 'No. We support Instagram (SFW) and Fanvue (SFW/NSFW) per their policies.'
  },
  {
    question: 'What happens on the Free plan?',
    answer: 'You can create, preview, and test. Library items delete after 30 days and downloads require a paid plan.'
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="py-32 bg-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            FAQ{' '}
            <span className="text-purple-400 font-medium">
              (short)
            </span>
          </h2>
        </motion.div>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {faq.question}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;