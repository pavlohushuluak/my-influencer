
import { Star, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { TermsOfService } from '@/components/TermsOfService';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { DMCAPolicy } from '@/components/DMCAPolicy';
import { CommunityGuidelines } from '@/components/CommunityGuidelines';
import { RefundPolicy } from '@/components/RefundPolicy';
import { CookiePolicy } from '@/components/CookiePolicy';

export function AppFooter() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showDMCAPolicy, setShowDMCAPolicy] = useState(false);
  const [showCommunityGuidelines, setShowCommunityGuidelines] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features', action: 'scroll' },
      { name: 'Pricing', href: '#pricing', action: 'scroll' },
      { name: 'Demo', href: '/signin', action: 'navigate' },
      { name: 'API', href: '#api', action: 'scroll' }
    ],
    company: [
      { name: 'About', href: '#about', action: 'scroll' },
      { name: 'Blog', href: '#blog', action: 'scroll' },
      { name: 'Careers', href: '#careers', action: 'scroll' },
      { name: 'Contact', href: '#contact', action: 'scroll' }
    ],
          legal: [
        { name: 'Privacy Policy', href: '#privacy', action: 'modal' },
        { name: 'Terms of Service', href: '#terms', action: 'modal' },
        { name: 'DMCA Policy', href: '#dmca', action: 'modal' },
        { name: 'Community Guidelines', href: '#guidelines', action: 'modal' },
        { name: 'Refund Policy', href: '#refund', action: 'modal' },
        { name: 'Cookie Policy', href: '#cookies', action: 'modal' },
        { name: 'GDPR', href: '#gdpr', action: 'scroll' }
      ]
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/aiinfluence', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/aiinfluence', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/aiinfluence', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@aiinfluence.com', label: 'Email' }
  ];

  const handleLinkClick = (item: typeof footerLinks.product[0]) => {
    if (item.action === 'navigate') {
      navigate(item.href);
    } else if (item.action === 'scroll' && item.href.startsWith('#')) {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.action === 'modal') {
      if (item.name === 'Terms of Service') {
        setShowTermsOfService(true);
      } else if (item.name === 'Privacy Policy') {
        setShowPrivacyPolicy(true);
      } else if (item.name === 'DMCA Policy') {
        setShowDMCAPolicy(true);
      } else if (item.name === 'Community Guidelines') {
        setShowCommunityGuidelines(true);
      } else if (item.name === 'Refund Policy') {
        setShowRefundPolicy(true);
      } else if (item.name === 'Cookie Policy') {
        setShowCookiePolicy(true);
      }
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Here you would typically send the email to your backend
      // console.log('Newsletter subscription:', email);
      setIsSubscribed(true);
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const handleSocialClick = (href: string) => {
    if (href.startsWith('mailto:')) {
      window.location.href = href;
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-ai-gradient rounded-lg flex items-center justify-center shadow-md">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-ai-gradient bg-clip-text text-transparent">
                  AI Influence
                </h2>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Transform your creative vision into reality with AI-powered content generation. 
              Create unique AI influencers and build your digital empire.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleLinkClick(link)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleLinkClick(link)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleLinkClick(link)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} AI Influence. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleSocialClick(social.href)}
              >
                <social.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <TermsOfService 
        open={showTermsOfService} 
        onOpenChange={setShowTermsOfService} 
      />

      {/* Privacy Policy Modal */}
            <PrivacyPolicy
        open={showPrivacyPolicy}
        onOpenChange={setShowPrivacyPolicy}
      />
      <DMCAPolicy
        open={showDMCAPolicy}
        onOpenChange={setShowDMCAPolicy}
      />
              <CommunityGuidelines
          open={showCommunityGuidelines}
          onOpenChange={setShowCommunityGuidelines}
        />
        <RefundPolicy
          open={showRefundPolicy}
          onOpenChange={setShowRefundPolicy}
        />
        <CookiePolicy
          open={showCookiePolicy}
          onOpenChange={setShowCookiePolicy}
        />
      </footer>
  );
}
