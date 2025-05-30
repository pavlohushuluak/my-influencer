import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleTheme } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User, Image, Zap, Shield, TrendingUp, Moon, Sun, Menu, Settings, Check, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/Layout/AppHeader';
import { AppFooter } from '@/components/Layout/AppFooter';

export default function Homepage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: User,
      title: 'AI Personalities',
      description: 'Create unique AI influencers with distinct personalities and characteristics'
    },
    {
      icon: Image,
      title: 'Content Generation',
      description: 'Generate high-quality images and videos with advanced AI technology'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Lightning-fast content creation and enhancement capabilities'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data and creations are protected with enterprise-grade security'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Track performance and optimize your content strategy with detailed insights'
    },
    {
      icon: Settings,
      title: 'Customization',
      description: 'Tailor AI outputs to match your brand voice, style, and specific requirements'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      description: 'Perfect for individuals getting started',
      features: [
        '3 AI Influencers',
        '100 Content Generations/month',
        'Basic Analytics',
        'Email Support',
        'Standard Processing Speed'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$49',
      period: '/month',
      description: 'Best for growing creators and agencies',
      features: [
        '10 AI Influencers',
        '500 Content Generations/month',
        'Advanced Analytics',
        'Priority Support',
        'Fast Processing Speed',
        'Custom Presets',
        'Team Collaboration'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$149',
      period: '/month',
      description: 'For large teams and businesses',
      features: [
        'Unlimited AI Influencers',
        'Unlimited Content Generations',
        'Enterprise Analytics',
        '24/7 Dedicated Support',
        'Lightning Processing Speed',
        'White-label Solutions',
        'API Access',
        'Custom Integrations'
      ],
      popular: false
    }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-founder',
      image: '/placeholder.svg',
      description: 'Former AI researcher at Google with 10+ years in machine learning and computer vision.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-founder',
      image: '/placeholder.svg',
      description: 'Ex-Meta engineer specializing in AI-powered content generation and scalable systems.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      image: '/placeholder.svg',
      description: 'Award-winning UX designer with expertise in AI interfaces and user experience.'
    }
  ];

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-muted", theme)}>
      {/* Header */}
      <AppHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-ai-gradient bg-clip-text text-transparent leading-tight">
              Create AI Influencers
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transform your creative vision into reality with AI-powered content generation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-ai-gradient hover:opacity-90 text-lg px-8 py-3 shadow-lg transition-all hover:shadow-xl"
                onClick={() => navigate('/dashboard')}
              >
                Start Creating
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-border border-neutral-300 hover:bg-accent dark:border-neutral-600 text-neutral-800 dark:text-neutral-100 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => navigate('/signin')}
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Powerful Features for Creators
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to create, manage, and grow your AI influencer empire
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur cursor-pointer"
              >
                <CardContent className='flex items-center p-6 pb-0'>
                  <feature.icon className="w-12 h-12 text-purple-500 dark:text-amber-500 transition-colors mb-4 mr-3" />
                  <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
                </CardContent>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30 backdrop-blur">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Start free and scale as you grow. All plans include our core features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                  plan.popular ? "border-purple-500 shadow-lg scale-105" : "border-border/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-ai-gradient text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className={cn("text-center", plan.popular && "pt-12")}>
                  <CardTitle className="text-xl text-card-foreground">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={cn(
                      "w-full mt-6",
                      plan.popular 
                        ? "bg-ai-gradient hover:opacity-90" 
                        : "bg-background border border-border hover:bg-accent text-foreground"
                    )}
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              About AI Influence
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              We're a team of AI researchers, engineers, and designers passionate about democratizing 
              AI-powered content creation. Our mission is to empower creators worldwide with cutting-edge technology.
            </p>
          </div>
          
          {/* Company Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">1M+</div>
              <div className="text-sm text-muted-foreground">Content Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>

          {/* Team */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg text-card-foreground">{member.name}</CardTitle>
                  <p className="text-sm text-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30 backdrop-blur">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Get in Touch
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                  <p className="text-muted-foreground">support@aiinfluence.com</p>
                  <p className="text-muted-foreground">hello@aiinfluence.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                  <p className="text-muted-foreground">+49 123 456 7890</p>
                  <p className="text-muted-foreground">Mon-Fri 9am-6pm CEST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Visit Us</h3>
                  <p className="text-muted-foreground">AI influencer platform</p>
                  <p className="text-muted-foreground">Berlin, Germany</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground">Send Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <Button className="w-full bg-ai-gradient hover:opacity-90">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
              Ready to Start Creating?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4">
              Join thousands of creators who are already building their AI influencer networks
            </p>
            <Button 
              size="lg" 
              className="bg-ai-gradient hover:opacity-90 text-base sm:text-lg px-6 sm:px-8 py-3 shadow-lg transition-all hover:shadow-xl w-full sm:w-auto"
              onClick={() => navigate('/signup')}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
