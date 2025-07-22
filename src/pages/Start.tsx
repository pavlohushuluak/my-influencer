import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Circle, Play, Star, AlertTriangle, Zap, Users, BarChart3, Shield, Sparkles, Target, TrendingUp, Palette, Globe, User, Brain, BookOpen, Wand2, Image as ImageIcon, Edit, Layers, Clock, Settings } from 'lucide-react';
import InstructionVideo from '@/components/InstructionVideo';
import { getInstructionVideoConfig } from '@/config/instructionVideos';
import { toast } from 'sonner';

export default function Start() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const currentPhase = userData.guide_step;
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [blinkState, setBlinkState] = useState(false);

  // Custom blinking animation: blink 3 times, wait, then loop
  useEffect(() => {
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      if (blinkCount < 7) {
        setBlinkState(prev => !prev);
        blinkCount++;
      } else {
        // Wait for 2 seconds after 3 blinks
        setTimeout(() => {
          blinkCount = 0;
          setBlinkState(false);
        }, 3000);
      }
    }, 1000); // Blink every 500ms

    return () => clearInterval(blinkInterval);
  }, []);

  const phases = [
    {
      id: 1,
      title: "Phase 1: Create your Influencer",
      description: "Set up your AI influencer's profile and basic information",
      completed: currentPhase > 1,
      icon: currentPhase > 1 ? CheckCircle : Circle,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      isPending: currentPhase === 1
    },
    {
      id: 2,
      title: "Phase 2: Train your AI Model",
      description: "Train your AI model for character consistency",
      completed: currentPhase > 2,
      icon: currentPhase > 2 ? CheckCircle : Circle,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      isPending: currentPhase === 2
    },
    {
      id: 3,
      title: "Phase 3: Generate Exclusive Content",
      description: "Create unique content for your influencer",
      completed: currentPhase > 3,
      icon: currentPhase > 3 ? CheckCircle : Circle,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      isPending: currentPhase === 3
    },
    {
      id: 4,
      title: "Phase 4: Organize your Content",
      description: "Manage and organize your generated content",
      completed: currentPhase > 4,
      icon: currentPhase > 4 ? CheckCircle : Circle,
      color: "from-orange-500 to-amber-500",
      bgColor: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
      isPending: currentPhase === 4
    }
  ];

  const handleCreateInfluencer = async () => {
    if (currentPhase === 0) {
      navigate('/dashboard');
    } else if (currentPhase === 1) {
      navigate('/influencers/create');
    } else if (currentPhase === 2) {
      navigate('/influencers');
    } else if (currentPhase === 3) {
      navigate('/content/create');
    } else if (currentPhase === 4) {
      // Update guide_step to 5 when user clicks "Organize Content"
      try {
        const response = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            guide_step: 5
          })
        });

        if (response.ok) {
          dispatch(setUser({ guide_step: 5 }));
          toast.success('Progress updated! Moving to Phase 5...');
        } else {
          toast.error('Failed to update progress');
        }
      } catch (error) {
        console.error('Failed to update guide_step:', error);
        toast.error('Failed to update progress');
      }
      
      navigate('/content/vault');
    }
    else {
      navigate('/dashboard');
    }
  };

  const getButtonText = () => {
    switch (currentPhase) {
      case 0:
        return "Start Your Journey";
      case 1:
        return "Start Phase 1 - Create your Influencer";
      case 2:
        return "Start Phase 2 - Train your AI Model";
      case 3:
        return "Start Phase 3 - Generate Exclusive Content";
      case 4:
        return "Start Phase 4 - Organize your Content";
      default:
        return "Start Your Journey";
    }
  };

  const handleContinueWork = () => {
    setShowWarningModal(true);
  };

  const handleConfirmContinueWork = async () => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          guide_step: 3
        })
      });

      if (response.ok) {
        dispatch(setUser({ guide_step: 3 }));
        toast.success('Progress updated! Moving to Phase 3...');
        setShowWarningModal(false);
        // Refresh the page to show updated phase
        window.location.reload();
      } else {
        toast.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Failed to update guide_step:', error);
      toast.error('Failed to update progress');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Start
          </h1>
          <p className="text-muted-foreground">
            Welcome to your AI influencer journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Side - Main Card */}
        <div className="w-full flex">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 shadow-2xl grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 xl:mr-[50px] lg:mr-[30px]">
            <CardContent className="p-8 lg:col-span-3 xl:col-span-2">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-white">
                    Let's launch your AI Influencer
                  </h2>
                  <p className="text-lg text-slate-300">
                    All you need is 4 simple steps – start with Phase 1 below.
                  </p>
                </div>

                {/* Phases List */}
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                        phase.completed 
                          ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30' 
                          : phase.isPending
                          ? `bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500/30 ${blinkState ? 'opacity-100' : 'opacity-50'}`
                          : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${phase.color} flex items-center justify-center shadow-lg transition-opacity duration-300 ${
                        phase.isPending ? (blinkState ? 'opacity-100' : 'opacity-50') : ''
                      }`}>
                        <phase.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`text-lg font-semibold transition-opacity duration-300 ${
                          phase.completed ? 'text-green-400' : phase.isPending ? (blinkState ? 'text-blue-400' : 'text-blue-600') : 'text-slate-300'
                        }`}>
                          {phase.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {phase.description}
                        </p>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Call to Action Button */}
                <div className="pt-6 flex gap-4 justify-center">
                  <Button
                    onClick={handleCreateInfluencer}
                    className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {getButtonText()}
                  </Button>
                  
                  {/* Continue my work button for Phase 2 */}
                  {currentPhase === 2 && (
                    <Button
                      onClick={handleContinueWork}
                      variant="outline"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-green-500"
                    >
                      Continue my work
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <div className="lg:col-span-2 xl:col-span-1 w-full h-full flex flex-col items-center justify-center">
              <InstructionVideo {...getInstructionVideoConfig(`phase${currentPhase}`)} className="m-4 lg:mr-[-30px] xl:mr-[-50px] flex flex-col items-center justify-center " />
            </div>
          </Card>
        </div>
      </div>

      {/* Comprehensive Platform Features */}
      <div className="space-y-12">
        
        {/* Core Creation Features */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white text-center mb-6">AI Influencer Creation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">AI Personality Builder</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Create unique AI influencers with detailed personality traits, appearance, and character profiles
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">LoRA Training</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Advanced AI model training for consistent character generation and visual coherence
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Template Library</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Pre-designed templates and guided wizards for rapid influencer creation
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-700/30 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Guided Wizard</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Step-by-step creation process with intelligent recommendations and best practices
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Generation Features */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white text-center mb-6">Content Generation & Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group bg-gradient-to-br from-cyan-900/20 to-teal-900/20 border-cyan-700/30 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">AI Content Creation</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Generate high-quality images with advanced prompts, scene customization, and style controls
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-rose-900/20 to-pink-900/20 border-rose-700/30 hover:border-rose-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Edit className="w-7 h-7 text-white" />
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

            <Card className="group bg-gradient-to-br from-lime-900/20 to-green-900/20 border-lime-700/30 hover:border-lime-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-lime-500/10">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-lime-500 to-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Content Scheduling</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Plan and schedule content across multiple platforms with automated publishing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="space-y-6">
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
      </div>

      {/* Warning Modal for Continue Work */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Quality Consideration
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-base leading-relaxed">
              <p className="mb-4">
                By proceeding without LoRA training, you may experience reduced character consistency and quality in your generated content.
              </p>
              <p className="text-sm text-slate-400">
                LoRA training significantly enhances your AI influencer's visual consistency and produces more professional, cohesive results. We recommend completing the training for optimal results.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowWarningModal(false)}
              className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmContinueWork}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-200"
            >
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 