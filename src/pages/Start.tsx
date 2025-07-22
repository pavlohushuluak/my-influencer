import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Circle, Play, Star, AlertTriangle } from 'lucide-react';
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

  const handlePhaseClick = (phaseId: number) => {
    // Update the current phase in Redux store
    dispatch(setUser({ guide_step: phaseId }));
    
    // Show success message
    toast.success(`Phase ${phaseId} activated!`, {
      description: `You are now on ${phases.find(p => p.id === phaseId)?.title}`
    });
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
                      onClick={() => handlePhaseClick(phase.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${
                        phase.completed 
                          ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-400/50' 
                          : phase.isPending
                          ? `bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500/30 hover:border-blue-400/50 ${blinkState ? 'opacity-100' : 'opacity-50'}`
                          : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30 hover:border-slate-500/50'
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

      {/* Move to Main Page Section */}
      <div className="flex justify-center mt-12">
        <div className="text-center space-y-6">
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 mx-auto rounded-full shadow-lg"></div>
          <Button
            onClick={() => navigate('/')}
            className="group relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 hover:from-slate-600 hover:via-gray-600 hover:to-slate-700 text-white font-semibold text-lg px-12 py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:scale-105 border border-slate-600/50 hover:border-slate-500/70"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Star className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Move to Main Page
              <Star className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Button>
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