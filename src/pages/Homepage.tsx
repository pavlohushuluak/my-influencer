import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleTheme } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User, Image, Zap, Shield, TrendingUp, Moon, Sun, Menu, Settings } from 'lucide-react';
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30 backdrop-blur">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Ready to Start Creating?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of creators who are already building their AI influencer networks
            </p>
            <Button
              size="lg"
              className="bg-ai-gradient hover:opacity-90 text-lg px-8 py-3 shadow-lg transition-all hover:shadow-xl"
              onClick={() => navigate('/signup')}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/95 backdrop-blur py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-ai-gradient rounded-lg flex items-center justify-center shadow-md">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-ai-gradient bg-clip-text text-transparent">
              AI Influence
            </span>
          </div>
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} AI Influence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
