import React from 'react';
import { motion } from 'framer-motion';
import { Check, Instagram as InstagramIcon, QrCode } from 'lucide-react';

const features = [
  'QR hand‑off: scan to send images straight to your device',
  'Mobile composer: captions, hashtags, and notes ready to paste',
  'Nymia Go (Coming Soon): a companion app to receive full post templates and open your favorite social app composer'
];

const Instagram = () => {
  return (
    <section id="instagram-safety" className="py-32 bg-slate-900 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Instagram — keep your{' '}
            <span className="text-purple-400 font-medium">
              account safe
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Post natively to minimize risk. Nymia prepares your content and gets it to your phone in seconds.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <Check className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                    <p className="text-slate-300 leading-relaxed">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-3">
                Why native posting?
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automated posting can trigger Instagram's spam detection. 
                Our QR hand-off method keeps your account safe while making posting effortless.
              </p>
            </div>
          </motion.div>

          {/* Right Side - Phone with Video */}
          <motion.div
            // initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            {/* Phone Container */}
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-80 bg-slate-900 rounded-[3rem] border-4 border-slate-700 p-4 shadow-2xl">
                {/* Screen */}
                <div className="w-full bg-black rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-black px-6 py-3 flex justify-between items-center text-white text-sm">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-6 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* Instagram Header */}
                  <div className="bg-black px-4 py-3 flex items-center space-x-3 border-b border-slate-800">
                    <InstagramIcon className="text-pink-400" size={24} />
                    <span className="text-white font-semibold">Create Post</span>
                  </div>

                  {/* Video Content - 9:16 Aspect Ratio */}
                  <div className="relative bg-black">
                    <div className="w-full aspect-[9/16] relative group">
                      <video 
                        className="w-full h-full object-cover"
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        onError={(e) => {
                          console.log('Video failed to load:', e);
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('Video loaded successfully');
                        }}
                      >
                        <source src="/video1.mp4" type="video/mp4" />
                      </video>
                      
                      {/* Fallback */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <span className="text-slate-400 text-sm">Your Content</span>
                      </div>
                      
                      {/* Video Overlay Effects */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      {/* Play Indicator */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                      </div>

                      {/* Instagram UI Elements */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex space-x-4">
                            <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                            <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                            <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>

                    {/* Caption Area */}
                    <div className="bg-black px-4 py-4 border-t border-slate-800">
                      <div className="text-white text-sm mb-2">
                        <span className="font-semibold">your_virtual_model</span>
                      </div>
                      <div className="text-slate-300 text-sm leading-relaxed">
                        "Just dropped some new content! What do you think? 💫 #virtualinfluencer #ai #content"
                      </div>
                    </div>

                    {/* QR Transfer Section */}
                    <div className="bg-slate-900 px-4 py-6 border-t border-slate-700">
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-white rounded-xl p-4 inline-block mb-3"
                        >
                          <QrCode className="text-slate-900" size={48} />
                        </motion.div>
                        <div className="text-slate-400 text-xs">
                          Scan to transfer to your device
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Glow Effect */}
                <div className="absolute -inset-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-[4rem] blur-2xl -z-10" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Ready to create safe Instagram content?
            </h3>
            <p className="text-slate-400 mb-6">
              Generate stunning visuals and post them safely with our QR hand-off system.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-500 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-purple-400 transition-colors"
            >
              Start creating content
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Instagram;