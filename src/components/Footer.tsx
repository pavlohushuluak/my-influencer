import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Github, Mail, Globe, Sparkles, Send, User, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import { DMCAPolicy } from './DMCAPolicy';
import { CookiePolicy } from './CookiePolicy';
import { ComplaintPolicy } from './ComplaintPolicy';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { synthesisService, SynthesisRequest } from '@/services/synthesisService';
import { toast } from 'sonner';

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const userData = useSelector((state: RootState) => state.user);
  
  // Modal states
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [dmcaModalOpen, setDmcaModalOpen] = useState(false);
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  
  // AI Synthesis Editor states
  const [synthesisPrompt, setSynthesisPrompt] = useState('');
  const [isProcessingSynthesis, setIsProcessingSynthesis] = useState(false);
  const [showSynthesisModal, setShowSynthesisModal] = useState(false);
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [synthesisStrength, setSynthesisStrength] = useState(0.8);
  const [synthesisGuidance, setSynthesisGuidance] = useState(7.5);
  const [showNameSelector, setShowNameSelector] = useState(false);

  // Add influencer name to prompt
  const addInfluencerToPrompt = (influencerName: string) => {
    const nameReference = `@${influencerName}`;
    if (!synthesisPrompt.includes(nameReference)) {
      setSynthesisPrompt(prev => prev ? `${prev} ${nameReference}` : nameReference);
    }
  };

  // Remove influencer from selection
  const removeInfluencerFromSelection = (influencerId: string) => {
    setSelectedInfluencers(prev => prev.filter(id => id !== influencerId));
    // Also remove from prompt
    const influencer = influencers.find(inf => inf.id === influencerId);
    if (influencer) {
      const nameReference = `@${influencer.name_first} ${influencer.name_last}`;
      setSynthesisPrompt(prev => prev.replace(new RegExp(nameReference, 'g'), '').trim());
    }
  };

  // Handle synthesis submission
  const handleSynthesisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!synthesisPrompt.trim()) return;

    setIsProcessingSynthesis(true);
    try {
      // Build the synthesis request
      const synthesisRequest: SynthesisRequest = {
        prompt: synthesisPrompt,
        selectedInfluencers: selectedInfluencers,
        strength: synthesisStrength,
        guidance: synthesisGuidance,
        userId: userData?.id || ''
      };
      
      console.log('AI Synthesis request:', synthesisRequest);
      
      // Call the synthesis service
      const response = await synthesisService.generateSynthesis(synthesisRequest);
      
      if (response.success) {
        toast.success(`AI Synthesis completed! ${response.message}`);
        setSynthesisPrompt('');
        setSelectedInfluencers([]);
        setShowSynthesisModal(false);
      } else {
        toast.error(`AI Synthesis failed: ${response.error || response.message}`);
      }
    } catch (error) {
      console.error('AI Synthesis failed:', error);
      toast.error('AI Synthesis failed. Please try again.');
    } finally {
      setIsProcessingSynthesis(false);
    }
  };

  // Open synthesis modal
  const openSynthesisModal = () => {
    setShowSynthesisModal(true);
  };

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

        {/* AI Synthesis Editor */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">AI Synthesis Editor</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Create stunning AI-generated content with our advanced synthesis technology
              </p>
            </div>
            
            {/* Quick Synthesis Input */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Describe what you want to create... (e.g., 'A professional portrait in a modern office setting')"
                  value={synthesisPrompt}
                  onChange={(e) => setSynthesisPrompt(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isProcessingSynthesis}
                />
              </div>
              <Button
                onClick={openSynthesisModal}
                disabled={!synthesisPrompt.trim() || isProcessingSynthesis}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Advanced Editor
              </Button>
            </div>

            {/* Selected Influencers Display */}
            {selectedInfluencers.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm text-slate-300 mb-2 block">Selected Influencers:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedInfluencers.map(influencerId => {
                    const influencer = influencers.find(inf => inf.id === influencerId);
                    return influencer ? (
                      <Badge 
                        key={influencerId}
                        variant="secondary" 
                        className="bg-slate-700 text-white hover:bg-slate-600"
                      >
                        <User className="h-3 w-3 mr-1" />
                        {influencer.name_first} {influencer.name_last}
                        <button
                          onClick={() => removeInfluencerFromSelection(influencerId)}
                          className="ml-2 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-xs text-slate-500">
                💡 Tip: Use the Advanced Editor to select specific influencers and fine-tune your synthesis
              </p>
            </div>
          </div>
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

      {/* Advanced AI Synthesis Editor Modal */}
      <Dialog open={showSynthesisModal} onOpenChange={setShowSynthesisModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Advanced AI Synthesis Editor
            </DialogTitle>
            <DialogDescription className="text-base text-slate-400">
              Create stunning AI-generated content with precise control over your synthesis parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Influencer Selection */}
            <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold text-white">Select Influencers</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNameSelector(!showNameSelector)}
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {showNameSelector ? 'Hide' : 'Show'} Influencers
                  </Button>
                </div>

                {showNameSelector && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {influencers.map(influencer => (
                      <Card
                        key={influencer.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedInfluencers.includes(influencer.id)
                            ? 'ring-2 ring-purple-500 bg-purple-900/20'
                            : 'hover:bg-slate-700/50'
                        }`}
                        onClick={() => {
                          if (selectedInfluencers.includes(influencer.id)) {
                            removeInfluencerFromSelection(influencer.id);
                          } else {
                            setSelectedInfluencers(prev => [...prev, influencer.id]);
                            addInfluencerToPrompt(`${influencer.name_first} ${influencer.name_last}`);
                          }
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-slate-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {influencer.name_first} {influencer.name_last}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {influencer.influencer_type}
                              </p>
                            </div>
                            {selectedInfluencers.includes(influencer.id) && (
                              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Selected Influencers */}
                {selectedInfluencers.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm text-slate-300 mb-2 block">Selected:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedInfluencers.map(influencerId => {
                        const influencer = influencers.find(inf => inf.id === influencerId);
                        return influencer ? (
                          <Badge 
                            key={influencerId}
                            variant="secondary" 
                            className="bg-purple-600 text-white hover:bg-purple-700"
                          >
                            <User className="h-3 w-3 mr-1" />
                            {influencer.name_first} {influencer.name_last}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeInfluencerFromSelection(influencerId);
                              }}
                              className="ml-2 hover:text-red-300"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Synthesis Prompt */}
            <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Label htmlFor="synthesis-prompt" className="text-lg font-semibold text-white mb-3 block">
                  Synthesis Prompt
                </Label>
                <textarea
                  id="synthesis-prompt"
                  placeholder="Describe the image you want to generate... (e.g., 'A professional portrait of @influencer_name in a modern office setting with natural lighting')"
                  value={synthesisPrompt}
                  onChange={(e) => setSynthesisPrompt(e.target.value)}
                  className="w-full min-h-[120px] bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-2">
                  💡 Tip: Use @influencer_name to reference your selected influencers in the prompt
                </p>
              </CardContent>
            </Card>

            {/* Synthesis Parameters */}
            <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Label className="text-lg font-semibold text-white mb-4 block">
                  Synthesis Parameters
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Strength: {synthesisStrength}
                    </Label>
                    <Slider
                      value={[synthesisStrength]}
                      onValueChange={([value]) => setSynthesisStrength(value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Controls how closely the AI follows your prompt
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Guidance: {synthesisGuidance}
                    </Label>
                    <Slider
                      value={[synthesisGuidance]}
                      onValueChange={([value]) => setSynthesisGuidance(value)}
                      max={20}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Controls the creativity vs. adherence balance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSynthesisSubmit}
                disabled={!synthesisPrompt.trim() || isProcessingSynthesis}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              >
                {isProcessingSynthesis ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing Synthesis...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 mr-3" />
                    Generate AI Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;