
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User, Image, Zap, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {
  const navigate = useNavigate();

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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ai-gradient rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-ai-gradient bg-clip-text text-transparent">
                AI Influence
              </h1>
              <p className="text-xs text-muted-foreground">Creative Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/signin')}>
              Sign In
            </Button>
            <Button className="bg-ai-gradient hover:opacity-90" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-ai-gradient bg-clip-text text-transparent">
              Create AI Influencers
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Transform your creative vision into reality with AI-powered content generation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-ai-gradient hover:opacity-90 text-lg px-8 py-3"
                onClick={() => navigate('/dashboard')}
              >
                Start Creating
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-3"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Creators
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and grow your AI influencer empire
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-ai-purple-500 group-hover:text-ai-purple-400 transition-colors mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Creating?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of creators who are already building their AI influencer networks
            </p>
            <Button 
              size="lg" 
              className="bg-ai-gradient hover:opacity-90 text-lg px-8 py-3"
              onClick={() => navigate('/signup')}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-ai-gradient rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-ai-gradient bg-clip-text text-transparent">
              AI Influence
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 AI Influence Creative Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
