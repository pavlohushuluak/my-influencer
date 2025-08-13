import React from 'react';
import { motion } from 'framer-motion';
import { Check, Gem } from 'lucide-react';

const FanvueDMs = () => {
  return (
    <section id="fanvue-dms" className="py-32 bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Fanvue DMs{' '}
            <span className="text-purple-400 font-medium">
              (Open Beta)
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Manage and reply to Fanvue messages in your model's tone. 
            Pull stats into Nymia and keep conversations moving.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Check className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="text-slate-300">Open Beta: first </span>
                    <strong className="text-white">50 DMs free</strong>
                    <span className="text-slate-300"> for every user</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Check className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-slate-300">Works on all plans during beta</span>
                </div>
                <div className="flex items-start space-x-4">
                  <Check className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-slate-300">Thoughtful rate limits to protect your account and platform compliance</span>
                </div>
              </div>
            </div>

            <div className="text-slate-400 text-sm italic">
              Automated and manual replies are powered by Gems after the free tier. Details in‑app.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Fanvue Platform Preview */}
            <div className="mb-8">
              <img 
                src="/fanvue_dm.png" 
                alt="Social Media Management"
                className="w-full h-48 object-cover rounded-3xl opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-800/90 to-transparent rounded-3xl" />
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
                <div>
                  <div className="text-white font-semibold">Fanvue Messages</div>
                  <div className="text-slate-400 text-sm">3 new messages</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-2xl p-4">
                  <div className="text-slate-300 text-sm mb-2">Incoming message:</div>
                  <div className="text-white">"Hey! Love your content 😍"</div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <div className="text-purple-300 text-sm mb-2">AI-generated reply:</div>
                  <div className="text-white">"Thank you so much! 💕 I have some exclusive content just for you..."</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gem className="text-purple-400" size={16} />
                  <span className="text-slate-400 text-sm">Powered by Gems</span>
                </div>
                <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium">
                  Send reply
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FanvueDMs;