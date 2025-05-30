
import { Star, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function AppFooter() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

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
      { name: 'Privacy Policy', href: '#privacy', action: 'scroll' },
      { name: 'Terms of Service', href: '#terms', action: 'scroll' },
      { name: 'Cookie Policy', href: '#cookies', action: 'scroll' },
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
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Here you would typically send the email to your backend
      console.log('Newsletter subscription:', email);
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
                <p className="text-sm text-muted-foreground">Creative Studio</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Transform your creative vision into reality with AI-powered content generation. 
              Create unique AI influencers and build your digital empire.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Stay updated</h3>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <Button type="submit" size="sm" className="bg-ai-gradient hover:opacity-90 w-full sm:w-auto">
                  Subscribe
                </Button>
              </form>
              {isSubscribed && (
                <p className="text-sm text-green-600">Thank you for subscribing!</p>
              )}
            </div>
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
            © 2024 AI Influence Creative Studio. All rights reserved.
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
    </footer>
  );
}
