import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Mic, Upload, Play, Pause, Volume2, ArrowLeft, Wand2, Loader2, RotateCcw, Calendar, BookOpen, Save, FolderOpen, Star, User, Settings, Video } from 'lucide-react';
import VaultSelector from '@/components/VaultSelector';

interface ContentCreateLipSyncVideoProps {
  influencerData?: any;
  onBack?: () => void;
}

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_url?: string;
  isPlaying?: boolean;
}

function ContentCreateLipSyncVideo({ influencerData, onBack }: ContentCreateLipSyncVideoProps) {
  const userData = useSelector((state: RootState) => state.user);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePhase, setActivePhase] = useState<'upload' | 'elevenlabs' | 'individual'>('upload');

  // Model data state to store influencer or selected video information
  const [modelData, setModelData] = useState<any>(null);

  // Voice states
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [selectedElevenLabsVoice, setSelectedElevenLabsVoice] = useState<VoiceOption | null>(null);
  const [textToSpeak, setTextToSpeak] = useState('');
  const [individualVoiceId, setIndividualVoiceId] = useState<string>('');

  // Modal states
  const [showHistory, setShowHistory] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);

  // ElevenLabs voices (mock data - replace with actual API call)
  const [elevenLabsVoices, setElevenLabsVoices] = useState<VoiceOption[]>([
    {
      id: 'voice_1',
      name: 'Sarah',
      description: 'Warm and friendly female voice',
      category: 'Female',
      preview_url: 'https://example.com/preview1.mp3'
    },
    {
      id: 'voice_2',
      name: 'Mike',
      description: 'Professional male voice',
      category: 'Male',
      preview_url: 'https://example.com/preview2.mp3'
    },
    {
      id: 'voice_3',
      name: 'Emma',
      description: 'Young and energetic female voice',
      category: 'Female',
      preview_url: 'https://example.com/preview3.mp3'
    },
    {
      id: 'voice_4',
      name: 'David',
      description: 'Deep and authoritative male voice',
      category: 'Male',
      preview_url: 'https://example.com/preview4.mp3'
    }
  ]);

  // Individual voices per influencer (mock data)
  const [individualVoices, setIndividualVoices] = useState<VoiceOption[]>([
    {
      id: 'ind_voice_1',
      name: 'Custom Voice 1',
      description: 'Personalized voice for influencer',
      category: 'Custom',
      preview_url: 'https://example.com/custom1.mp3'
    },
    {
      id: 'ind_voice_2',
      name: 'Custom Voice 2',
      description: 'Another personalized voice option',
      category: 'Custom',
      preview_url: 'https://example.com/custom2.mp3'
    }
  ]);

  useEffect(() => {
    if (influencerData) {
      setModelData(influencerData);
    }
  }, [influencerData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedAudioFile(file);
      const url = URL.createObjectURL(file);
      setUploadedAudioUrl(url);
      toast.success('Audio file uploaded successfully');
    }
  };

  const handleElevenLabsVoiceSelect = (voice: VoiceOption) => {
    setSelectedElevenLabsVoice(voice);
    toast.success(`Selected voice: ${voice.name}`);
  };

  const handleIndividualVoiceSelect = (voiceId: string) => {
    setIndividualVoiceId(voiceId);
    const voice = individualVoices.find(v => v.id === voiceId);
    if (voice) {
      toast.success(`Selected individual voice: ${voice.name}`);
    }
  };

  const validateForm = () => {
    if (!modelData) {
      toast.error('Please select an influencer video');
      return false;
    }

    if (activePhase === 'upload' && !uploadedAudioFile) {
      toast.error('Please upload an audio file');
      return false;
    }

    if (activePhase === 'elevenlabs') {
      if (!selectedElevenLabsVoice) {
        toast.error('Please select an ElevenLabs voice');
        return false;
      }
      if (!textToSpeak.trim()) {
        toast.error('Please enter text to speak');
        return false;
      }
    }

    if (activePhase === 'individual' && !individualVoiceId) {
      toast.error('Please select an individual voice');
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      const useridResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
        headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
      });
      const useridData = await useridResponse.json();

      let generationData: any = {
        task: "generatelipsync",
        userid: useridData[0].userid,
        modelid: modelData.id,
        phase: activePhase
      };

      // Add phase-specific data
      if (activePhase === 'upload') {
        generationData.audio_file = uploadedAudioFile;
      } else if (activePhase === 'elevenlabs') {
        generationData.voice_id = selectedElevenLabsVoice?.id;
        generationData.text = textToSpeak;
      } else if (activePhase === 'individual') {
        generationData.individual_voice_id = individualVoiceId;
        generationData.text = textToSpeak;
      }

      const response = await fetch('https://api.nymia.ai/v1/createtask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(generationData)
      });

      if (response.ok) {
        toast.success('Lip-sync video generation started! Check your history for progress.');
        handleClear();
      } else {
        throw new Error('Failed to start lip-sync generation');
      }
    } catch (error) {
      console.error('Error generating lip-sync video:', error);
      toast.error('Failed to generate lip-sync video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setUploadedAudioFile(null);
    setUploadedAudioUrl(null);
    setSelectedElevenLabsVoice(null);
    setTextToSpeak('');
    setIndividualVoiceId('');
    if (uploadedAudioUrl) {
      URL.revokeObjectURL(uploadedAudioUrl);
    }
  };

  const playVoicePreview = (voice: VoiceOption) => {
    // Mock audio preview functionality
    toast.info(`Playing preview for ${voice.name}`);
  };

  return (
    <div className="px-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Create LipSync Video
            </h1>
            <p className="text-muted-foreground">
              Generate new content
            </p>
          </div>
        </div>

        {/* Professional Preset and Library Buttons */}
        <div className="flex items-center gap-3">
          <div className="items-center gap-2 hidden xl:grid xl:grid-cols-2 2xl:grid-cols-4">
            <Button
              onClick={() => setShowLibraryModal(true)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Library
            </Button>

            <Button
              onClick={() => setShowPresetModal(true)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Presets
            </Button>

            <Button
              onClick={() => {/* handleSavePreset */}}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Preset
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!validateForm() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="bg-gradient-to-r from-red-600 to-orange-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>

      {/* Professional Preset and Library Buttons */}
      <div className="flex w-full items-center gap-3 xl:hidden">
        <div className="items-center gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          <Button
            onClick={() => setShowLibraryModal(true)}
            variant="outline"
            className="h-10 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Library
          </Button>

          <Button
            onClick={() => setShowPresetModal(true)}
            variant="outline"
            className="w-full h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            My Presets
          </Button>

          <Button
            onClick={() => {/* handleSavePreset */}}
            variant="outline"
            className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Preset
          </Button>
        </div>
      </div>

      {/* Phase Selection */}
      <div className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900/50 dark:to-purple-900/20 rounded-xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => setActivePhase('upload')}
            variant={activePhase === 'upload' ? 'default' : 'outline'}
            className={`h-12 ${activePhase === 'upload' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Phase 1: Upload Audio
          </Button>
          <Button
            onClick={() => setActivePhase('elevenlabs')}
            variant={activePhase === 'elevenlabs' ? 'default' : 'outline'}
            className={`h-12 ${activePhase === 'elevenlabs' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            <Mic className="w-4 h-4 mr-2" />
            Phase 2: ElevenLabs Voices
          </Button>
          <Button
            onClick={() => setActivePhase('individual')}
            variant={activePhase === 'individual' ? 'default' : 'outline'}
            className={`h-12 ${activePhase === 'individual' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            <User className="w-4 h-4 mr-2" />
            Phase 3: Individual Voices
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Voice Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase 1: Upload Audio File */}
          {activePhase === 'upload' && (
            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-500" />
                  Upload Audio File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="audio-upload" className="text-sm font-medium">
                    Select audio file to lipsync
                  </Label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-300 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-slate-500">
                        MP3, WAV, M4A up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                {uploadedAudioFile && (
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {uploadedAudioFile.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {(uploadedAudioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setUploadedAudioFile(null);
                          if (uploadedAudioUrl) {
                            URL.revokeObjectURL(uploadedAudioUrl);
                            setUploadedAudioUrl(null);
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phase 2: ElevenLabs Voices */}
          {activePhase === 'elevenlabs' && (
            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-purple-500" />
                  Select from our Voices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-to-speak" className="text-sm font-medium">
                    Type text to say
                  </Label>
                  <Textarea
                    id="text-to-speak"
                    placeholder="Enter the text you want the voice to speak..."
                    value={textToSpeak}
                    onChange={(e) => setTextToSpeak(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Select from our Voices
                  </Label>
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {elevenLabsVoices.map((voice) => (
                        <Card
                          key={voice.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedElevenLabsVoice?.id === voice.id
                              ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleElevenLabsVoiceSelect(voice)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                  {voice.name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  {voice.description}
                                </p>
                                <Badge variant="secondary" className="mt-2">
                                  {voice.category}
                                </Badge>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playVoicePreview(voice);
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 3: Individual Voice per Influencer */}
          {activePhase === 'individual' && (
            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Individual Voice per Influencer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="individual-text" className="text-sm font-medium">
                    Type text to say
                  </Label>
                  <Textarea
                    id="individual-text"
                    placeholder="Enter the text you want the voice to speak..."
                    value={textToSpeak}
                    onChange={(e) => setTextToSpeak(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Select Individual Voice
                  </Label>
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {individualVoices.map((voice) => (
                        <Card
                          key={voice.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            individualVoiceId === voice.id
                              ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleIndividualVoiceSelect(voice.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                  {voice.name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  {voice.description}
                                </p>
                                <Badge variant="secondary" className="mt-2">
                                  {voice.category}
                                </Badge>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playVoicePreview(voice);
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Influencer Video Selection */}
        <div className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-green-500" />
                Influencer Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Please select video to lipsync</Label>
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  {modelData?.image_url ? (
                    <img
                      src={modelData.image_url}
                      alt={`${modelData.name_first} ${modelData.name_last}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Video className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No video selected</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowVaultModal(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardContent className="space-y-4 pt-6">

              <Button
                onClick={() => setShowHistory(true)}
                variant="outline"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Show history
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showVaultModal && (
        <VaultSelector
          open={showVaultModal}
          onOpenChange={setShowVaultModal}
          onImageSelect={(image) => {
            // Convert GeneratedImageData to a format compatible with our modelData
            const selectedVideo = {
              id: image.id,
              image_url: image.file_path,
              name_first: image.user_filename || 'Selected',
              name_last: 'Video',
              influencer_type: 'LipSync Video',
              lorastatus: 0
            };
            setModelData(selectedVideo);
            setShowVaultModal(false);
          }}
          title="Select Video for LipSync"
          description="Choose a video to use for lip-sync generation"
        />
      )}

      {showHistory && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>LipSync Video History</DialogTitle>
              <DialogDescription>
                Your lip-sync video generation history will appear here.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      {showPresetModal && (
        <Dialog open={showPresetModal} onOpenChange={setShowPresetModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>LipSync Video Presets</DialogTitle>
              <DialogDescription>
                Save and load lip-sync video generation presets.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      {showLibraryModal && (
        <Dialog open={showLibraryModal} onOpenChange={setShowLibraryModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>LipSync Video Library</DialogTitle>
              <DialogDescription>
                Browse your lip-sync video library and templates.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ContentCreateLipSyncVideo; 