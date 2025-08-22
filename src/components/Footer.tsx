import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Github, Mail, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import { DMCAPolicy } from './DMCAPolicy';
import { CookiePolicy } from './CookiePolicy';
import { ComplaintPolicy } from './ComplaintPolicy';

const Footer = () => {
  const navigate = useNavigate();
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [dmcaModalOpen, setDmcaModalOpen] = useState(false);
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const footerLinks = {
    'Product': [
      'Features',
      'Pricing',
      'Roadmap',
      'API',
      'Integrations'
    ],
    'Resources': [
      'Documentation',
      'Tutorials',
      'Blog',
      'Community',
      'Support'
    ],
    'Company': [
      'About',
      'Careers',
      'Press',
      'Partners',
      'Contact'
    ],
    'Legal': [
      'Privacy Policy',
      'Terms of Service',
      'Cookie Policy',
      'Complaint',
      'DMCA'
    ]
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <img 
                    src="/logo.jpg" 
                    alt="Nymia Logo" 
                    className="relative h-12 w-auto rounded-xl cursor-pointer object-cover shadow-lg border border-white/10 backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Launch virtual influencers in under 60 minutes. 
              Guided assistants, AI Consistency, and stunning content creation.
            </p>
            <div className="flex items-center space-x-4">
              {[Twitter, Github, Mail, Globe].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center text-slate-400 hover:text-purple-400 hover:bg-slate-700 transition-all duration-300"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    {category === 'Legal' ? (
                      <button
                        onClick={() => {
                          if (link === 'Privacy Policy') {
                            setPrivacyModalOpen(true);
                          } else if (link === 'Terms of Service') {
                            setTermsModalOpen(true);
                          } else if (link === 'Cookie Policy') {
                            setCookieModalOpen(true);
                          } else if (link === 'Complaint') {
                            setComplaintModalOpen(true);
                          } else if (link === 'DMCA') {
                            setDmcaModalOpen(true);
                          }
                        }}
                        className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer text-left w-full"
                      >
                        {link}
                      </button>
                    ) : (
                      <a
                        href="#"
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="text-slate-500 text-sm">
                © 2025 sayasaas llc. All rights reserved.
              </div>
            </div>

            <div className="flex items-center space-x-6 text-slate-500 text-sm">
              <button 
                onClick={() => setPrivacyModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy policy
              </button>
              <button 
                onClick={() => setTermsModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of service
              </button>
              <button 
                onClick={() => setComplaintModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Complaint
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicy 
        open={privacyModalOpen} 
        onOpenChange={setPrivacyModalOpen} 
      />

      {/* Terms of Service Modal */}
      <TermsOfService 
        open={termsModalOpen} 
        onOpenChange={setTermsModalOpen} 
      />

      {/* DMCA Policy Modal */}
      <DMCAPolicy 
        open={dmcaModalOpen} 
        onOpenChange={setDmcaModalOpen} 
      />

      {/* Cookie Policy Modal */}
      <CookiePolicy 
        open={cookieModalOpen} 
        onOpenChange={setCookieModalOpen} 
      />

      {/* Complaint Policy Modal */}
      <ComplaintPolicy 
        open={complaintModalOpen} 
        onOpenChange={setComplaintModalOpen} 
      />
    </footer>
  );
};

export default Footer;