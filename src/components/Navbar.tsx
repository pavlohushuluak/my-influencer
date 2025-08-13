import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useHref, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutUsOpen, setAboutUsOpen] = useState(false);
  const [forYouOpen, setForYouOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  
  // Get user authentication state
  const userData = useSelector((state: RootState) => state.user);
  const isAuthenticated = userData.id && sessionStorage.getItem('access_token');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsOpen(false); // Close mobile menu
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl shadow-black/20' 
          : 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/30'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <img 
                src="/logo.jpg" 
                alt="Nymia Logo" 
                className="relative h-12 w-auto rounded-xl object-cover cursor-pointer shadow-lg border border-white/10 backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* About Us Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setAboutUsOpen(true)}
                onMouseLeave={() => setAboutUsOpen(false)}
                className="px-3 py-2 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium text-sm flex items-center gap-1"
              >
                About Us
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${aboutUsOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {aboutUsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setAboutUsOpen(true)}
                    onMouseLeave={() => setAboutUsOpen(false)}
                    className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 z-50"
                  >
                    <div className="py-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('why-nymia')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Why Nymia
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('how-it-works')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        How It Works
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('image-studio')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Image Studio
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('product')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Product
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* For You Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setForYouOpen(true)}
                onMouseLeave={() => setForYouOpen(false)}
                className="px-3 py-2 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium text-sm flex items-center gap-1"
              >
                For You
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${forYouOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {forYouOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setForYouOpen(true)}
                    onMouseLeave={() => setForYouOpen(false)}
                    className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 z-50"
                  >
                    <div className="py-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('fanvue-dms')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Fanvue DMs
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('instagram-safety')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Keep Safe
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setPricingOpen(true)}
                onMouseLeave={() => setPricingOpen(false)}
                className="px-3 py-2 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium text-sm flex items-center gap-1"
              >
                Pricing
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${pricingOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {pricingOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setPricingOpen(true)}
                    onMouseLeave={() => setPricingOpen(false)}
                    className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 z-50"
                  >
                    <div className="py-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('pricing')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Plans
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('gems')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Gems
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('roadmap')}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-sm font-medium"
                      >
                        Roadmap
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('safety')}
              className="px-3 py-2 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium text-sm"
            >
              Compliance & Safety
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('faq')}
              className="px-3 py-2 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium text-sm"
            >
              FAQ
            </motion.button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signin')}
                  className="text-slate-300 hover:text-white transition-all duration-300 font-medium px-4 py-2 rounded-lg border border-slate-600/50 hover:border-slate-500 hover:bg-slate-800/30 backdrop-blur-sm"
                >
                  Sign in
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                >
                  Get Started
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    sessionStorage.removeItem('access_token');
                    sessionStorage.removeItem('refresh_token');
                    window.location.href = '/';
                  }}
                  className="text-slate-300 hover:text-white transition-all duration-300 font-medium px-4 py-2 rounded-lg border border-slate-600/50 hover:border-slate-500 hover:bg-slate-800/30 backdrop-blur-sm"
                >
                  Sign out
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/start')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                >
                  Start Creating
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mt-4 pb-4 border-t border-slate-700/50"
          >
            <div className="flex flex-col space-y-2 pt-4">
              {/* About Us Mobile */}
              <div className="space-y-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAboutUsOpen(!aboutUsOpen)}
                  className="w-full text-left px-4 py-3 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium flex items-center justify-between"
                >
                  About Us
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${aboutUsOpen ? 'rotate-180' : ''}`} />
                </motion.button>
                <AnimatePresence>
                  {aboutUsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 space-y-1"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('why-nymia')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Why Nymia
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('how-it-works')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        How It Works
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('image-studio')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Image Studio
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('product')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Product
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* For You Mobile */}
              <div className="space-y-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setForYouOpen(!forYouOpen)}
                  className="w-full text-left px-4 py-3 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium flex items-center justify-between"
                >
                  For You
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${forYouOpen ? 'rotate-180' : ''}`} />
                </motion.button>
                <AnimatePresence>
                  {forYouOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 space-y-1"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('fanvue-dms')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Fanvue DMs
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('instagram-safety')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Keep Safe
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pricing Mobile */}
              <div className="space-y-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPricingOpen(!pricingOpen)}
                  className="w-full text-left px-4 py-3 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium flex items-center justify-between"
                >
                  Pricing
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${pricingOpen ? 'rotate-180' : ''}`} />
                </motion.button>
                <AnimatePresence>
                  {pricingOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 space-y-1"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('pricing')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Plans
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('gems')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Gems
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('roadmap')}
                        className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 text-sm"
                      >
                        Roadmap
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('safety')}
                className="text-left px-4 py-3 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium"
              >
                Compliance & Safety
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('faq')}
                className="text-left px-4 py-3 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-800/50 font-medium"
              >
                FAQ
              </motion.button>
              
              <div className="flex flex-col space-y-3 pt-4 border-t border-slate-700/50">
                {!isAuthenticated ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/signin')}
                      className="text-left px-4 py-3 text-slate-300 hover:text-white transition-all duration-300 rounded-lg border border-slate-600/50 hover:border-slate-500 hover:bg-slate-800/30 backdrop-blur-sm font-medium"
                    >
                      Sign in
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/signup')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                    >
                      Get Started
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        sessionStorage.removeItem('access_token');
                        sessionStorage.removeItem('refresh_token');
                        window.location.href = '/';
                      }}
                      className="text-left px-4 py-3 text-slate-300 hover:text-white transition-all duration-300 rounded-lg border border-slate-600/50 hover:border-slate-500 hover:bg-slate-800/30 backdrop-blur-sm font-medium"
                    >
                      Sign out
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/start')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                    >
                      Start Creating
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;