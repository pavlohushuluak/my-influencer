import React from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw, Clock, Zap, Gem } from 'lucide-react';

const Gems = () => {
  return (
    <section id="gems" className="relative py-32 bg-slate-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Digital Currency Background"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-slate-900/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Gems Hero Image */}
          <div className="mb-8">
            <img 
              src="/price6.png" 
              alt="What are Gems"
              className="w-full max-w-5xl mx-auto h-80 object-cover rounded-3xl opacity-90"
            />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            What are{' '}
            <span className="text-purple-400 font-medium">Gems?</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Gems power everything in Nymia: creating influencers, generating content, and advanced features like Fanvue DMs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Gems Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="/price7.png" 
                  alt="Gems Balance Background"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Gem className="text-purple-400" size={24} />
                    <div>
                      <div className="text-white font-semibold">Gems Balance</div>
                      <div className="text-slate-400 text-sm">Power everything in Nymia</div>
                    </div>
                  </div>
                  <div className="text-purple-400 font-bold text-xl">360</div>
                </div>

                <div className="space-y-6">
                  {/* Monthly Gems */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-purple-500/20 p-3 rounded-2xl">
                        <RefreshCw className="text-purple-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Monthly Gems</h3>
                        <p className="text-slate-400 text-sm">Refresh every billing cycle</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                          >
                            <Gem className="text-purple-400" size={20} />
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-purple-400 font-semibold">360 Gems</span>
                    </div>
                  </motion.div>

                  {/* Top-up Gems */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-purple-500/20 p-3 rounded-2xl">
                        <Clock className="text-purple-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Top-up Gems</h3>
                        <p className="text-slate-400 text-sm">Never expire</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                          >
                            <Gem className="text-purple-400" size={20} />
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-purple-400 font-semibold">150 Gems</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Check className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-white">Monthly Gems</strong> come with your plan and refresh every month
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Check className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-white">Top‑up Gems</strong> are one‑time purchases and never expire
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="text-purple-400" size={24} />
                <h4 className="text-xl font-bold text-white">Smart Usage</h4>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Nymia spends Monthly Gems first, then Top-ups — so you always use the value included in your plan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
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
                className="border border-slate-600 text-white px-8 py-3 rounded-md font-medium hover:bg-slate-800 transition-colors"
              >
                Add Gems
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Gems;