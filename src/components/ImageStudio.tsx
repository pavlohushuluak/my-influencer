import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Camera, Edit3, Zap, Download, Star, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const features = [
  {
    icon: Camera,
    title: 'High‑quality image generation',
    description: 'Create stunning visuals with advanced AI and curated style templates',
    highlight: '4K Resolution'
  },
  {
    icon: Edit3,
    title: 'Post‑processing & AI edits',
    description: 'Professional editing tools with intelligent enhancement algorithms',
    highlight: 'Auto-Enhance'
  },
  {
    icon: Users,
    title: 'Face Swap (consent-based)',
    description: 'Advanced face swapping technology with explicit consent verification',
    highlight: 'Ethical AI'
  },
  {
    icon: Download,
    title: 'Asset series builder',
    description: 'Create carousels and PPV packs with intelligent content organization',
    highlight: 'Batch Export'
  }
];

const stats = [
  { icon: Star, value: '99.9%', label: 'Quality Score' },
  { icon: Clock, value: '<30s', label: 'Generation Time' },
  { icon: Users, value: '10K+', label: 'Active Users' },
  { icon: Sparkles, value: '1M+', label: 'Images Created' }
];

const ImageStudio = () => {
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);
  const isAuthenticated = userData.id && sessionStorage.getItem('access_token');

  const handleStartCreating = () => {
    if (isAuthenticated) {
      navigate('/create/images');
    } else {
      navigate('/signin');
    }
  };

  return (
    <section id="image-studio" className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(168,85,247,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-20 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl hidden lg:block"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl hidden lg:block"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">AI-Powered Studio</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 sm:mb-6 leading-tight">
            Image Studio{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-medium">
              (today's superpower)
            </span>
          </h2>
          
          <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Transform your creative vision into reality with our advanced AI-powered image generation and editing suite
          </p>
        </motion.div>


        <div className="max-w-6xl mx-auto">
          {/* Studio Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="relative aspect-[4/3] w-full max-w-4xl mx-auto">
              <img 
                src="/quality_post.png" 
                alt="Image Studio Interface"
                className="w-full h-full object-cover rounded-2xl sm:rounded-3xl shadow-2xl"
              />
              
              {/* Overlay Gradient - Desktop Only */}
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent rounded-2xl sm:rounded-3xl" />
              
              {/* Action Cards - Desktop Overlay */}
              <div className="hidden sm:block absolute bottom-8 left-8 right-8">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: 'Generate', icon: Camera, color: 'from-blue-500 to-cyan-500' },
                      { name: 'Edit', icon: Edit3, color: 'from-purple-500 to-pink-500' },
                      { name: 'Enhance', icon: Zap, color: 'from-yellow-500 to-orange-500' },
                      { name: 'Export', icon: Download, color: 'from-green-500 to-emerald-500' }
                    ].map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.2 + index * 0.1 }}
                        className="text-center group cursor-pointer"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-white text-sm font-medium group-hover:text-purple-300 transition-colors duration-300">
                          {action.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards - Mobile Below Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="sm:hidden mt-6"
            >
              <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Generate', icon: Camera, color: 'from-blue-500 to-cyan-500' },
                    { name: 'Edit', icon: Edit3, color: 'from-purple-500 to-pink-500' },
                    { name: 'Enhance', icon: Zap, color: 'from-yellow-500 to-orange-500' },
                    { name: 'Export', icon: Download, color: 'from-green-500 to-emerald-500' }
                  ].map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.2 + index * 0.1 }}
                      className="text-center group cursor-pointer"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white text-sm font-medium group-hover:text-purple-300 transition-colors duration-300">
                        {action.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 + index * 0.1 }}
                  className="group hover:bg-slate-800/50 rounded-xl p-4 sm:p-6 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-white text-lg sm:text-xl font-semibold">
                          {feature.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {feature.highlight}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="text-center mt-12 sm:mt-16 lg:mt-20"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartCreating}
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-semibold transition-all duration-300 inline-flex items-center space-x-3 shadow-2xl hover:shadow-purple-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center space-x-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>{isAuthenticated ? 'Continue Creating' : 'Start Creating Images'}</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ImageStudio;