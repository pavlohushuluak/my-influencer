import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleTheme } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User, Image, Zap, Shield, TrendingUp, Moon, Sun, Menu, Settings, Check, Mail, Phone, MapPin, Camera, Video, Edit3, Layers, Clock, BarChart3, Palette, Globe, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/Layout/AppHeader';
import { AppFooter } from '@/components/Layout/AppFooter';

export default function Homepage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);
  const { id, email } = useSelector((state: RootState) => state.user);
  const { plan: currentPlan } = useSelector((state: RootState) => state.subscription);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = sessionStorage.getItem('access_token') !== null;

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

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
      price: '$19.95',
      period: '/month',
      description: 'Perfect for individual creators',
      features: [
        'Basic influencer information',
        'Limited appearance customization',
        'Basic style options',
        'Community support',
        'Standard processing speed'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$49.95',
      period: '/month',
      description: 'Best for growing creators and agencies',
      features: [
        'All Starter features',
        'Advanced appearance customization',
        'Detailed personality traits',
        'Style & environment options',
        'Content focus customization',
        'Priority support',
        'Fast processing speed'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99.95',
      period: '/month',
      description: 'For large teams and businesses',
      features: [
        'All Professional features',
        'Unlimited customization',
        'Priority support',
        'Advanced analytics',
        'API access',
        '24/7 dedicated support',
        'Lightning processing speed'
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

  const handlePricingClick = (plan: string) => {
    if (!isLoggedIn) {
      navigate('/signup');
      return;
    }

    if (plan === 'free') {
      navigate('/dashboard');
      return;
    }

    navigate('/pricing');
  };

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
                className="bg-ai-gradient hover:opacity-90 text-lg px-8 py-3 mt-5 shadow-lg transition-all hover:shadow-xl"
                onClick={() => navigate(isLoggedIn ? '/start' : '/signup')}
              >
                {isLoggedIn ? 'Start Creating' : 'Get Started'}
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

      {/* Content Creation Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Professional Content Creation
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Unleash your creativity with our comprehensive suite of AI-powered content creation tools
            </p>
          </div>

          {/* Core Creation Tools */}
          <div className="space-y-6 mb-16">
            <h3 className="text-xl font-semibold text-white text-center mb-6">Core Creation Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Create Image</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Generate stunning AI-powered images with advanced customization options, scene settings, and character consistency
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Create Video</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Produce dynamic videos with motion control, camera movements, and seamless transitions using cutting-edge AI
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Edit3 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Content Enhancement</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Advanced editing tools for refining, retouching, and perfecting your generated content
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-700/30 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Layers className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Content Vault</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Organized storage system with advanced search, filtering, and content management
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-6 mb-16">
            <h3 className="text-xl font-semibold text-white text-center mb-6">Advanced Tools & Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-indigo-700/30 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Performance Analytics</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Track engagement, growth metrics, and content performance with detailed insights
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-pink-900/20 to-rose-900/20 border-pink-700/30 hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Palette className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Style Customization</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Extensive clothing, pose, location, and accessory catalogs for limitless creativity
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Batch Processing</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Generate multiple content variations simultaneously with automated workflows
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-700/30 hover:border-teal-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Preset Management</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Save and reuse custom configurations for consistent content generation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enterprise Features */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center mb-6">Enterprise & Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-700/30 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Enterprise Security</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Bank-level encryption, secure cloud infrastructure, and data protection compliance
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-slate-900/20 to-gray-900/20 border-slate-700/30 hover:border-slate-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-slate-500 to-gray-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Team Collaboration</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Multi-user access, role-based permissions, and collaborative content creation
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Multi-Platform Export</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Optimize content for Instagram, TikTok, YouTube, and all major social platforms
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Premium Support</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Priority support, dedicated account management, and expert guidance
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => navigate(isLoggedIn ? '/content/create' : '/signup')}
            >
              Start Creating Content
            </Button>
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
                <CardContent>
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
                    onClick={() => handlePricingClick(plan.name.toLowerCase())}
                  >
                    {isLoggedIn
                      ? currentPlan === plan.name.toLowerCase()
                        ? 'Current Plan'
                        : 'Change Plan'
                      : 'Get Started'}
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
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30 backdrop-blur">
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
              onClick={() => navigate(isLoggedIn ? '/start' : '/signup')}
            >
              {isLoggedIn ? 'Start Creating' : 'Get Started for Free'}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
