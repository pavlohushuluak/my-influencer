import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, QrCode } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-32 bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(225, 252, 2, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(225, 252, 2, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, rgba(225, 252, 2, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(225, 252, 2, 0.05) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
            Get the app for{' '}
            <span className="text-lime-400 font-medium">managing money</span>{' '}
            everywhere
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Join 16+ million people who choose FlowPay for fast, fair, 
            and transparent international money transfers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - App Download */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 text-white px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  📱
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 text-white px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  📲
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-semibold text-white mb-4">
                Why choose FlowPay?
              </h3>
              <div className="space-y-4">
                {[
                  'Real exchange rates, no hidden fees',
                  'Send money to 80+ countries',
                  'Multi-currency account and debit card',
                  '24/7 customer support'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-lime-400 rounded-full" />
                    <span className="text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - QR Code and Phone */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="inline-block bg-white p-8 rounded-3xl mb-8 shadow-2xl"
            >
              <div className="w-48 h-48 bg-slate-900 rounded-2xl flex items-center justify-center">
                <QrCode size={120} className="text-white" />
              </div>
            </motion.div>

            <div className="text-white mb-4">
              <div className="text-lg font-semibold mb-2">
                Scan to download
              </div>
              <div className="text-slate-400">
                Available on iOS and Android
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Smartphone className="text-lime-400" size={48} />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-lime-400 text-slate-900 px-12 py-6 rounded-md text-xl font-semibold hover:bg-lime-300 transition-colors inline-flex items-center space-x-3"
          >
            <Download size={24} />
            <span>Start your journey today</span>
          </motion.button>
          
          <div className="mt-6 text-slate-400">
            No setup fees • No monthly fees • No minimum balance
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;