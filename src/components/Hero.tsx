import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, User, Brain, Image, FolderOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const Hero = () => {
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);
  const isAuthenticated = userData.id && sessionStorage.getItem('access_token');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero02_sml.png" 
          alt="AI Technology Background"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90" />
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 z-10">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 text-center max-w-5xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-light text-white mb-8 leading-tight"
        >
          Launch a virtual influencer{' '}
          <span className="text-purple-400 font-medium">
            in under 60 minutes
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Guided assistants, AI Consistency, and a studio for stunning images. 
          Post safely to Instagram and sell on Fanvue — without technical know‑how.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isAuthenticated) {
                navigate('/start');
              } else {
                navigate('/signup');
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 flex items-center space-x-2"
          >
            <span>{isAuthenticated ? 'Start Creating' : 'Start free'}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard');
              } else {
                navigate('/signin');
              }
            }}
            className="border border-slate-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <Play size={16} />
            <span>Watch demo</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-slate-400 text-sm italic mb-16"
        >
          Optimized for Instagram & Fanvue · No code · Gems power everything · Fanvue DMs (Open Beta)
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { icon: User, title: 'Create Influencer', desc: 'Set name, visuals, and backstory' },
            { icon: Brain, title: 'AI Consistency', desc: 'Lock the look automatically' },
            { icon: Image, title: 'Generate Content', desc: 'Images, videos, and more' },
            { icon: FolderOpen, title: 'Organize & Publish', desc: 'Ready-to-post content' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-xl mb-4">
                <feature.icon className="text-purple-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;