import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import config from '@/config/config';
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
import { Mic, Upload, Play, Pause, Volume2, ArrowLeft, Wand2, Loader2, RotateCcw, Calendar, BookOpen, Save, FolderOpen, Star, User, Settings, Video, X, Search, Clock, Eye, Download, Share2, Sparkles, Square } from 'lucide-react';
import VaultSelector from '@/components/VaultSelector';
import VideoSelector from '@/components/VideoSelector';
import { AudioPlayer } from '@/components/ui/audio-player';
import LipsyncPresetsManager from '@/components/LipsyncPresetsManager';
import LipsyncLibraryManager from '@/components/LipsyncLibraryManager';

interface ContentCreateLipSyncVideoProps {
  influencerData?: any;
  onBack?: () => void;
}

interface VoiceOption {
  id: number;
  elevenlabs_id: string;
  name: string;
  description: string;
  internal_hint: string;
  speed: number;
  category?: string;
  preview_url?: string;
  isPlaying?: boolean;
}

interface GeneratedAudioData {
  audio_id: string;
  user_uuid: string;
  created_at: string;
  elevenlabs_id: string;
  prompt: string;
  filename: string;
  status: string;
  character_cost: number;
  voice_name: string;
  voice_description: string;
  voice_speed: number;
}

function ContentCreateLipSyncVideo({ influencerData, onBack }: ContentCreateLipSyncVideoProps) {
  const userData = useSelector((state: RootState) => state.user);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [activePhase, setActivePhase] = useState<'upload' | 'elevenlabs' | 'individual'>('upload');

  // Model data state to store influencer or selected video information
  const [modelData, setModelData] = useState<any>(null);

  // Video selection state
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const [videoFilterStatus, setVideoFilterStatus] = useState<string>('all');
  const [videoSortBy, setVideoSortBy] = useState<string>('newest');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Audio playback state
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playingVoiceSample, setPlayingVoiceSample] = useState<string | null>(null);
  const [voiceAudioElements, setVoiceAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const voiceAudioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Generated audio data state
  const [generatedAudioData, setGeneratedAudioData] = useState<GeneratedAudioData | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);

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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<any>(null);

  // Lipsync presets state
  const [showLipsyncPresetsModal, setShowLipsyncPresetsModal] = useState(false);
  const [showLipsyncLibraryModal, setShowLipsyncLibraryModal] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<any>(null);
  const [presetImageSource, setPresetImageSource] = useState<'vault' | 'upload' | 'recent'>('vault');
  const [showVaultSelectorForPreset, setShowVaultSelectorForPreset] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  // ElevenLabs voices (will be fetched from voice table)
  const [elevenLabsVoices, setElevenLabsVoices] = useState<VoiceOption[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');

  // Individual voices per influencer (mock data)
  const [individualVoices, setIndividualVoices] = useState<VoiceOption[]>([
    {
      id: 1,
      elevenlabs_id: 'ind_voice_1',
      name: 'Custom Voice 1',
      description: 'Personalized voice for influencer',
      internal_hint: 'Custom voice option',
      speed: 1.0,
      category: 'Custom',
      preview_url: 'https://example.com/custom1.mp3'
    },
    {
      id: 2,
      elevenlabs_id: 'ind_voice_2',
      name: 'Custom Voice 2',
      description: 'Another personalized voice option',
      internal_hint: 'Custom voice option',
      speed: 1.0,
      category: 'Custom',
      preview_url: 'https://example.com/custom2.mp3'
    }
  ]);

  // Fetch videos from Supabase
  useEffect(() => {
    const fetchVideos = async () => {
      if (!userData.id) return;

      try {
        setLoadingVideos(true);
        const response = await fetch(`${config.supabase_server_url}/video?user_uuid=eq.${userData.id}&status=eq.completed&order=task_created_at.desc`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched videos for LipSync:', data);
          setVideos(data);
        } else {
          throw new Error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [userData.id]);

  // Filter videos for lip sync history (lip_flag === true)
  const lipSyncVideos = videos.filter(video => video.lip_flag === true);

  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      // Stop all playing audio when component unmounts
      Object.values(voiceAudioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      setAudioUrls({});
      setPlayingAudioId(null);
      setPlayingVoiceSample(null);
      setVoiceAudioElements({});
      voiceAudioElementsRef.current = {};
      setGeneratedAudioData(null);
      setGeneratedAudioUrl(null);
    };
  }, []);

  // Debug selectedAudioUrl changes
  useEffect(() => {
    console.log('selectedAudioUrl changed to:', selectedAudioUrl);
  }, [selectedAudioUrl]);

  // Fetch voices from voice table
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoadingVoices(true);
        const response = await fetch(`${config.supabase_server_url}/voice?order=name.asc`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched voices:', data);

          // Transform the data to match our interface
          const transformedVoices = data.map((voice: any) => ({
            ...voice,
            category: voice.internal_hint || 'General',
            preview_url: undefined, // Will be added later if needed
            isPlaying: false
          }));

          setElevenLabsVoices(transformedVoices);
        } else {
          throw new Error('Failed to fetch voices');
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
        toast.error('Failed to load voices');
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

  useEffect(() => {
    if (influencerData) {
      setModelData(influencerData);
      toast.success(`Using ${influencerData.name_first} ${influencerData.name_last} for lip sync video generation`);
    }
  }, [influencerData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      try {
        setIsUploadingAudio(true);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);

        // Generate a unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const filename = `uploaded_audio_${timestamp}.${fileExtension}`;

        // Upload file to the API
        const uploadUrl = `${config.backend_url}/uploadfile?user=${userData.id}&filename=audio/${filename}`;
        
        console.log('Uploading file to:', uploadUrl);
        console.log('Filename:', filename);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log('File upload response:', result);

          // Set the uploaded file and URL
          setUploadedAudioFile(file);
          setValidationErrors([]);
          
          // Create the audio URL for the uploaded file
          const audioUrl = `${config.data_url}/${userData.id}/audio/${filename}`;
          setUploadedAudioUrl(audioUrl);
          
          // Also set as selected audio for lip sync
          setSelectedAudioUrl(audioUrl);
          setSelectedAudioId(`uploaded_${timestamp}`);

          toast.success('Audio file uploaded and saved successfully');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload audio file');
        }
      } catch (error) {
        console.error('Error uploading audio file:', error);
        toast.error(`Failed to upload audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsUploadingAudio(false);
      }
    }
  };

  const handleElevenLabsVoiceSelect = (voice: VoiceOption) => {
    setSelectedElevenLabsVoice(voice);
    console.log('voice', voice);
    const selectedUrl = `${config.data_url}/wizard/mappings/${voice.elevenlabs_id}.mp3`;
    setSelectedAudioUrl(selectedUrl);
    setSelectedAudioId(voice.elevenlabs_id);
    setValidationErrors([]);
    toast.success(`Selected voice: ${voice.name}`);
  };

  const handleIndividualVoiceSelect = (voiceId: number) => {
    setIndividualVoiceId(voiceId.toString());
    setValidationErrors([]);
    const voice = individualVoices.find(v => v.id === voiceId);
    if (voice) {
      toast.success(`Selected individual voice: ${voice.name}`);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Check if video is selected
    if (!selectedVideo) {
      errors.push('Please select a video to apply lip-sync to');
    }

    // Phase-specific validation
    if (activePhase === 'upload') {
      if (!uploadedAudioFile || !selectedAudioUrl) {
        errors.push('Please upload an audio file');
      }
    } else {
      // Check if audio is selected for other phases
      if (!selectedAudioUrl) {
        errors.push('Please select an audio file for lip-sync video generation');
      }
    }

    if (activePhase === 'elevenlabs') {
      if (!selectedElevenLabsVoice) {
        errors.push('Please select a voice from the available options');
      }
      if (!textToSpeak.trim()) {
        errors.push('Please enter text for voice generation');
      }
      if (textToSpeak.trim().length < 10) {
        errors.push('Text should be at least 10 characters long');
      }
      if (textToSpeak.trim().length > 500) {
        errors.push('Text should be less than 500 characters');
      }
    }

    if (activePhase === 'individual') {
      if (!individualVoiceId) {
        errors.push('Please select an individual voice');
      }
      if (!textToSpeak.trim()) {
        errors.push('Please enter text for voice generation');
      }
    }

    // Update validation errors state
    setValidationErrors(errors);

    // Show first error as toast and return validation result
    if (errors.length > 0) {
      toast.error(errors[0]);
      return false;
    }

    return true;
  };

  // Silent validation for button disabled state
  const isFormValid = () => {
    if (!selectedVideo) return false;
    if (!selectedAudioUrl) return false;

    if (activePhase === 'upload' && !uploadedAudioFile) return false;

    if (activePhase === 'elevenlabs') {
      if (!selectedElevenLabsVoice || !textToSpeak.trim()) return false;
      if (textToSpeak.trim().length < 10 || textToSpeak.trim().length > 500) return false;
    }

    if (activePhase === 'individual') {
      if (!individualVoiceId || !textToSpeak.trim()) return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      // Validate required data
      if (!selectedVideo) {
        toast.error('Please select a video for lip-sync');
        return;
      }

      // if (!generatedAudioData) {
      //   toast.error('Please generate audio first');
      //   return;
      // }

      // Prepare the lip-sync generation data
      const lipSyncData = {
        user_uuid: userData.id,
        model: "kwaivgi/kling-lip-sync",
        audio_url: selectedAudioUrl,
        video_url: getVideoUrl(selectedVideo.video_id),
        audio: selectedAudioId,
        prompt: textToSpeak,
        status: "new"
      };

      console.log('Generating lip-sync video:', lipSyncData);

              const response = await fetch(`${config.backend_url}/generatelipsyncvideo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(lipSyncData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Lip-sync generation response:', result);
        toast.success('Lip-sync video generation started! Check your history for progress.');
        handleClear();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start lip-sync generation');
      }
    } catch (error) {
      console.error('Error generating lip-sync video:', error);
      toast.error(`Failed to generate lip-sync video: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    setSelectedVideo(null);
    setValidationErrors([]);
    setIsUploadingAudio(false);

    // Stop and clean up any playing audio
    if (playingAudioId) {
      stopAudioPlayback(playingAudioId);
    }
    setAudioUrls({});

    // Clear generated audio data
    setGeneratedAudioData(null);
    setGeneratedAudioUrl(null);
    setSelectedAudioUrl(null);
    setSelectedAudioId('');

    if (uploadedAudioUrl) {
      URL.revokeObjectURL(uploadedAudioUrl);
    }
  };

  const playVoicePreview = async (voice: VoiceOption) => {
    if (!textToSpeak.trim()) {
      toast.error('Please enter some text to generate voice preview');
      return;
    }

    setIsGeneratingVoice(voice.elevenlabs_id);

    try {
      const voiceGenerationData = {
        user_uuid: userData.id,
        voice_id: voice.elevenlabs_id,
        speed: voice.speed,
        prompt: textToSpeak
      };

      console.log('Generating voice preview:', voiceGenerationData);

              const response = await fetch(`${config.backend_url}/generateaudio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(voiceGenerationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Voice generation response:', result);

        toast.success(`Voice preview generated for ${voice.name}! Audio ID: ${result.audio_id}`);

        // Save the generated audio data
        const audioData: GeneratedAudioData = {
          audio_id: result.audio_id,
          user_uuid: result.user_uuid,
          created_at: result.created_at,
          elevenlabs_id: result.elevenlabs_id,
          prompt: result.prompt,
          filename: result.filename,
          status: result.status,
          character_cost: result.character_cost,
          voice_name: voice.name,
          voice_description: voice.description,
          voice_speed: voice.speed
        };

        setGeneratedAudioData(audioData);

        // Wait a moment for the audio file to be ready, then store the URL
        setTimeout(() => {
          const audioUrl = `${config.data_url}/${userData.id}/audio/${result.filename}`;
          console.log('Setting audioUrl for audio_id:', result.audio_id, 'URL:', audioUrl);

          // Store the audio URL for the AudioPlayer component
          setAudioUrls(prev => {
            const newAudioUrls = {
              ...prev,
              [result.audio_id]: audioUrl
            };
            console.log('Updated audioUrls state:', newAudioUrls);
            return newAudioUrls;
          });

          // Set as currently playing
          setPlayingAudioId(result.audio_id);

          // Set the generated audio URL for the persistent player
          setGeneratedAudioUrl(audioUrl);

        }, 2000); // Wait 2 seconds for the file to be ready

      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate voice preview');
      }
    } catch (error) {
      console.error('Error generating voice preview:', error);
      toast.error(`Failed to generate voice preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingVoice(null);
    }
  };

  const stopAudioPlayback = (audioId: string) => {
    setPlayingAudioId(null);
  };

  const handleAudioSelect = (audioId: string) => {
    console.log('handleAudioSelect called with audioId:', audioId);
    console.log('Current audioUrls state:', audioUrls);
    console.log('Available audio IDs:', Object.keys(audioUrls));
    
    const audioUrl = audioUrls[audioId];
    console.log('Found audioUrl:', audioUrl);
    
    if (audioUrl) {
      console.log('Setting selectedAudioUrl to:', audioUrl);
      setSelectedAudioUrl(audioUrl);
      toast.success('Audio selected for lip sync video generation');
    } else {
      console.log('No audioUrl found for audioId:', audioId);
      toast.error('Audio not found. Please try again.');
    }
  };

  // Video helper functions
  const getVideoUrl = (videoId: string) => {
    return `${config.data_url}/${userData.id}/video/${videoId}.mp4`;
  };

  const formatVideoDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatVideoDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVideoStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'processing': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'failed': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getVideoModelDisplayName = (model: string) => {
    switch (model) {
      case 'kling-v2.1': return 'Kling 2.1';
      case 'wan-v2.1': return 'WAN 2.1';
      default: return model;
    }
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      const matchesStatus = videoFilterStatus === 'all' || video.status === videoFilterStatus;
      const matchesSearch = video.prompt.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
        video.model.toLowerCase().includes(videoSearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (videoSortBy) {
        case 'newest':
          return new Date(b.task_created_at).getTime() - new Date(a.task_created_at).getTime();
        case 'oldest':
          return new Date(a.task_created_at).getTime() - new Date(b.task_created_at).getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'model':
          return a.model.localeCompare(b.model);
        default:
          return 0;
      }
    });

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
    setShowVideoSelector(false);
    setValidationErrors([]);
    toast.success(`Selected video: ${video.prompt.substring(0, 50)}...`);
  };

  const handleVideoClick = (video: any) => {
    setSelectedVideoForModal(video);
    setShowVideoModal(true);
  };

  const handleDownload = (video: any) => {
    const videoUrl = getVideoUrl(video.video_id);
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `lipsync-video-${video.video_id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleShare = (video: any) => {
    const videoUrl = getVideoUrl(video.video_id);
    navigator.clipboard.writeText(videoUrl);
    toast.success('Video URL copied to clipboard');
  };

  // Lipsync preset functions
  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    if (!selectedPresetImage) {
      toast.error('Please select a preset image');
      return;
    }

    try {
      setIsSavingPreset(true);

      // Determine upload_flag based on active phase
      const upload_flag = activePhase === 'upload';

      // Get the appropriate URLs and voice name based on the active phase
      let video_url = '';
      let voice_url = '';
      let voice_name = '';

      if (activePhase === 'upload') {
        voice_url = uploadedAudioUrl || '';
      } else if (activePhase === 'elevenlabs') {
        voice_url = selectedElevenLabsVoice?.preview_url || '';
        voice_name = selectedElevenLabsVoice?.name || '';
      }

      // Get video URL from selected video
      if (selectedVideo) {
        video_url = `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${selectedVideo.user_filename === "" ? "output" : "vault/" + selectedVideo.user_filename}/${selectedVideo.system_filename}`;
      }

      // Validate required fields
      if (!userData.id) {
        throw new Error('User ID is required');
      }
      if (!presetName.trim()) {
        throw new Error('Preset name is required');
      }
      if (!textToSpeak.trim()) {
        throw new Error('Prompt is required');
      }

      // Create preset data with voice_name if available
      const presetData: any = {
        user_id: userData.id,
        name: presetName.trim(),
        description: presetDescription.trim() || null, // Ensure description is null if empty
        prompt: textToSpeak.trim(),
        video_url: video_url || null, // Ensure null if empty
        voice_url: voice_url || null, // Ensure null if empty
        preset_image: selectedPresetImage.preview_url || `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${selectedPresetImage.user_filename === "" ? "output" : "vault/" + selectedPresetImage.user_filename}/${selectedPresetImage.system_filename}`,
        upload_flag: upload_flag
      };

      // Add voice_name if we have it and it's not empty
      if (voice_name && voice_name.trim()) {
        presetData.voice_name = voice_name.trim();
      }

      console.log('Preset data:', presetData);
      console.log('Preset data JSON:', JSON.stringify(presetData, null, 2));

      // Test database connection and table structure
      try {
        const testResponse = await fetch(`${config.supabase_server_url}/lipsync_presets?select=id&limit=1`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        console.log('Database connection test:', testResponse.status, testResponse.statusText);
      } catch (error) {
        console.error('Database connection test failed:', error);
      }

      // Try to save the preset
      let response;
      try {
        response = await fetch(`${config.supabase_server_url}/lipsync_presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(presetData)
      });
      } catch (error) {
        console.error('Network error:', error);
        throw new Error(`Network error: ${error}`);
      }

      if (response.ok) {
        toast.success('Lipsync preset saved successfully!');
        setShowSavePresetModal(false);
        setPresetName('');
        setPresetDescription('');
        setSelectedPresetImage(null);
      } else {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to save lipsync preset: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving lipsync preset:', error);
      toast.error('Failed to save lipsync preset');
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleApplyLipsyncPreset = (preset: any) => {
    // Apply the preset data to the form
    setTextToSpeak(preset.prompt || '');
    
    // Set the appropriate phase based on upload_flag
    if (preset.upload_flag) {
      setActivePhase('upload');
      // For upload phase, set the voice URL
      if (preset.voice_url) {
        setUploadedAudioUrl(preset.voice_url);
        setSelectedAudioUrl(preset.voice_url);
      }
    } else {
      setActivePhase('elevenlabs');
      // For ElevenLabs phase, find and select the voice by name
      if (preset.voice_name) {
        const voice = elevenLabsVoices.find(v => v.name === preset.voice_name);
        if (voice) {
          setSelectedElevenLabsVoice(voice);
          const selectedUrl = `${config.data_url}/wizard/mappings/${voice.elevenlabs_id}.mp3`;
          setSelectedAudioUrl(selectedUrl);
          setSelectedAudioId(voice.elevenlabs_id);
          console.log(`Applied voice: ${voice.name} (${voice.elevenlabs_id})`);
        } else {
          // If voice not found, try to use the voice_url as fallback
      if (preset.voice_url) {
            setSelectedAudioUrl(preset.voice_url);
            console.log(`Voice not found by name, using URL fallback: ${preset.voice_url}`);
          }
        }
      } else if (preset.voice_url) {
        // Fallback to voice_url if voice_name is not available
        setSelectedAudioUrl(preset.voice_url);
        console.log(`No voice name available, using URL: ${preset.voice_url}`);
      }
    }

    // Apply video if available
    if (preset.video_url) {
      // This would need to be handled based on your video selection logic
      // For now, we'll just store the URL
    }

    toast.success(`Applied lipsync preset: ${preset.name}`);
  };

  // Helper functions for preset image selection
  const handlePresetImageSelect = (image: any, source: 'vault' | 'upload' | 'recent') => {
    setSelectedPresetImage(image);
    setPresetImageSource(source);
  };

  const handlePresetFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a mock image object for uploaded files
      const uploadedImage = {
        task_id: `upload_${Date.now()}`,
        system_filename: file.name,
        user_filename: '',
        preview_url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        rating: 0,
        favorite: false,
        file_type: 'image'
      };
      handlePresetImageSelect(uploadedImage, 'upload');
    }
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
              onClick={() => setShowLipsyncLibraryModal(true)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Lipsync Library
            </Button>

            <Button
              onClick={() => setShowLipsyncPresetsModal(true)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Presets
            </Button>

            <Button
              onClick={() => setShowSavePresetModal(true)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Preset
            </Button>
          </div>
        </div>
        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium mb-2">Please fix the following issues:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid() || isGenerating}
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
            onClick={() => setShowLipsyncLibraryModal(true)}
            variant="outline"
            className="h-10 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Lipsync Library
          </Button>

          <Button
            onClick={() => setShowLipsyncPresetsModal(true)}
            variant="outline"
            className="w-full h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            My Presets
          </Button>

          <Button
            onClick={() => setShowSavePresetModal(true)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => setActivePhase('upload')}
            variant={activePhase === 'upload' ? 'default' : 'outline'}
            className={`h-12 ${activePhase === 'upload' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bring your own audio
          </Button>
          <Button
            onClick={() => setActivePhase('elevenlabs')}
            variant={activePhase === 'elevenlabs' ? 'default' : 'outline'}
            className={`h-12 ${activePhase === 'elevenlabs' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            <Mic className="w-4 h-4 mr-2" />
            Use nymia voices
          </Button>
          {/* <Button
            onClick={() => setActivePhase('individual')}
            variant={activePhase === 'individual' ? 'default' : 'outline'}
            className={`h-12 ${activePhase === 'individual' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            <User className="w-4 h-4 mr-2" />
            Individual Voices
          </Button> */}
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
                  Nymia Voice Generation
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate custom audio using our professional voice collection
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Input Section */}
                <div className="space-y-3">
                  <Label htmlFor="text-to-speak" className="text-sm font-medium">
                    Text for Voice Generation
                  </Label>
                  <Textarea
                    id="text-to-speak"
                    placeholder="Enter the text you want the voice to speak... (e.g., 'Hello everyone, welcome to my channel!')"
                    value={textToSpeak}
                    onChange={(e) => {
                      setTextToSpeak(e.target.value);
                      setValidationErrors([]);
                    }}
                    rows={4}
                    className="resize-none border-2 focus:border-purple-500 transition-colors"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{textToSpeak.length} characters</span>
                    <span>Recommended: 50-200 characters</span>
                  </div>
                </div>

                {/* Voice Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Select Voice & Generate Preview ({elevenLabsVoices.length})
                    </Label>
                    {loadingVoices && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        Loading voices...
                      </div>
                    )}
                  </div>

                  {loadingVoices ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                        {elevenLabsVoices.map((voice) => (
                          <Card
                            key={voice.id}
                            className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${selectedElevenLabsVoice?.id === voice.id
                              ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg'
                              : playingAudioId
                                ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg'
                                : 'hover:ring-2 hover:ring-purple-200 dark:hover:ring-purple-800'
                              }`}
                            onClick={() => handleElevenLabsVoiceSelect(voice)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Voice Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {voice.name}
                                      </h4>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                                      {voice.description}
                                    </p>
                                  </div>
                                  
                                  {/* Play/Stop Button */}
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      
                                      // If this voice is currently playing, stop it
                                      if (playingVoiceSample === voice.id.toString()) {
                                        console.log('Stopping voice:', voice.id.toString());
                                        
                                        const currentAudio = voiceAudioElementsRef.current[voice.id.toString()];
                                        console.log('Found audio element:', currentAudio);
                                        
                                        if (currentAudio) {
                                          currentAudio.pause();
                                          currentAudio.currentTime = 0;
                                          console.log('Audio stopped successfully');
                                        } else {
                                          console.log('No audio element found, trying to stop all audio');
                                          // Fallback: try to stop all audio elements
                                          Object.values(voiceAudioElementsRef.current).forEach(audio => {
                                            audio.pause();
                                            audio.currentTime = 0;
                                          });
                                        }
                                        
                                        setPlayingVoiceSample(null);
                                        return;
                                      }
                                      
                                      // Stop any other currently playing voice sample
                                      if (playingVoiceSample) {
                                        const currentAudio = voiceAudioElementsRef.current[playingVoiceSample];
                                        if (currentAudio) {
                                          currentAudio.pause();
                                          currentAudio.currentTime = 0;
                                        }
                                        setPlayingVoiceSample(null);
                                      }
                                      
                                      const audioUrl = `${config.data_url}/wizard/mappings/${voice.elevenlabs_id}.mp3`;
                                      const audio = new Audio(audioUrl);
                                      
                                      // Store the audio element reference
                                      console.log('Storing audio element for voice:', voice.id.toString());
                                      voiceAudioElementsRef.current[voice.id.toString()] = audio;
                                      setVoiceAudioElements(prev => {
                                        const newElements = {
                                          ...prev,
                                          [voice.id.toString()]: audio
                                        };
                                        console.log('Updated voiceAudioElements:', newElements);
                                        return newElements;
                                      });
                                      
                                      // Set up audio event listeners
                                      audio.addEventListener('ended', () => {
                                        setPlayingVoiceSample(null);
                                        // Clean up the audio element reference
                                        delete voiceAudioElementsRef.current[voice.id.toString()];
                                        setVoiceAudioElements(prev => {
                                          const newElements = { ...prev };
                                          delete newElements[voice.id.toString()];
                                          return newElements;
                                        });
                                      });
                                      audio.addEventListener('error', () => {
                                        setPlayingVoiceSample(null);
                                        // Clean up the audio element reference
                                        delete voiceAudioElementsRef.current[voice.id.toString()];
                                        setVoiceAudioElements(prev => {
                                          const newElements = { ...prev };
                                          delete newElements[voice.id.toString()];
                                          return newElements;
                                        });
                                        toast.error('Failed to play voice sample');
                                      });
                                      
                                      // Play the audio
                                      audio.play().then(() => {
                                        setPlayingVoiceSample(voice.id.toString());
                                      }).catch((error) => {
                                        console.error('Error playing audio:', error);
                                        setPlayingVoiceSample(null);
                                        // Clean up the audio element reference
                                        delete voiceAudioElementsRef.current[voice.id.toString()];
                                        setVoiceAudioElements(prev => {
                                          const newElements = { ...prev };
                                          delete newElements[voice.id.toString()];
                                          return newElements;
                                        });
                                        toast.error('Failed to play voice sample');
                                      });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                  >
                                    {playingVoiceSample === voice.id.toString() ? (
                                      <Square className="w-3 h-3" />
                                    ) : (
                                      <Play className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>

                                {/* Voice Details */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700"
                                    >
                                      {voice.category}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-green-200 dark:border-green-700 text-green-700 dark:text-green-400"
                                    >
                                      Speed: {voice.speed}x
                                    </Badge>
                                  </div>

                                  {voice.internal_hint && (
                                    <p className="text-xs text-muted-foreground italic">
                                      "{voice.internal_hint}"
                                    </p>
                                  )}
                                </div>

                                {/* Selection Indicator */}
                                {selectedElevenLabsVoice?.id === voice.id && (
                                  <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium">Selected</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>



                {/* Generate Audio Button */}
                <div className="mt-6">
                  <div className={`rounded-xl p-6 shadow-lg border transition-all duration-300 ${
                    selectedElevenLabsVoice 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/20' 
                      : 'bg-gradient-to-r from-slate-400 to-slate-500 border-slate-300/20'
                  }`}>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                          selectedElevenLabsVoice ? 'bg-white/20' : 'bg-white/10'
                        }`}>
                          <Mic className={`w-6 h-6 ${selectedElevenLabsVoice ? 'text-white' : 'text-white/70'}`} />
                        </div>
                        <div className="text-left">
                          <h3 className={`text-xl font-bold ${selectedElevenLabsVoice ? 'text-white' : 'text-white/90'}`}>
                            Generate Audio
                          </h3>
                          <p className={`text-sm ${selectedElevenLabsVoice ? 'text-purple-100' : 'text-white/70'}`}>
                            {selectedElevenLabsVoice 
                              ? `${selectedElevenLabsVoice.name} • ${textToSpeak.length} characters`
                              : 'Select a voice first • ' + textToSpeak.length + ' characters'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => selectedElevenLabsVoice && playVoicePreview(selectedElevenLabsVoice)}
                        disabled={!selectedElevenLabsVoice || isGeneratingVoice === selectedElevenLabsVoice?.elevenlabs_id}
                        size="lg"
                        className={`font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 ${
                          selectedElevenLabsVoice 
                            ? 'bg-white text-purple-600 hover:bg-purple-50' 
                            : 'bg-white/50 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isGeneratingVoice === selectedElevenLabsVoice?.elevenlabs_id ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Generating Audio...
                          </>
                        ) : selectedElevenLabsVoice ? (
                          <>
                            <Wand2 className="w-5 h-5 mr-3" />
                            Generate Audio Now
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-3" />
                            Select a Voice First
                          </>
                        )}
                      </Button>
                      
                      <p className={`text-xs mt-3 ${selectedElevenLabsVoice ? 'text-purple-200' : 'text-white/60'}`}>
                        {selectedElevenLabsVoice 
                          ? `This will create a ${selectedElevenLabsVoice.speed}x speed audio using ${selectedElevenLabsVoice.name}`
                          : 'Please select a voice from the options above to generate audio'
                        }
                      </p>
                    </div>
                  </div>
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
                          className={`cursor-pointer transition-all duration-200 ${individualVoiceId === voice.id.toString()
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

        {/* Right Column - Video Selection */}
        <div className="space-y-6">
          {generatedAudioData && generatedAudioUrl && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Generated Audio Preview
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Voice: {generatedAudioData.voice_name} • Speed: {generatedAudioData.voice_speed}x • Cost: {generatedAudioData.character_cost} characters
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                  {generatedAudioData.status}
                </Badge>
              </div>

              <div className="mb-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  "{generatedAudioData.prompt}"
                </p>
              </div>
              <AudioPlayer
                src={generatedAudioUrl}
                onPlay={() => setPlayingAudioId(generatedAudioData.audio_id)}
                onPause={() => setPlayingAudioId(null)}
                onEnded={() => setPlayingAudioId(null)}
                onError={(error) => {
                  console.error('Generated audio player error:', error);
                  setPlayingAudioId(null);
                  toast.error('Failed to play generated audio');
                }}
                className="w-full"
              />

              <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Generated: {new Date(generatedAudioData.created_at).toLocaleString()}</span>
                <span>Audio ID: {generatedAudioData.audio_id}</span>
              </div>
            </div>
          )}

          {/* Audio Selection Section */}
          {Object.keys(audioUrls).length > 0 && (
            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-green-500" />
                  Select Audio for LipSync (Debug: {Object.keys(audioUrls).length} available)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Debug info */}
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                  <p>Debug: audioUrls keys: {Object.keys(audioUrls).join(', ')}</p>
                  <p>Debug: selectedAudioUrl: {selectedAudioUrl || 'null'}</p>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      const firstAudioId = Object.keys(audioUrls)[0];
                      if (firstAudioId) {
                        console.log('Manual test: setting selectedAudioUrl to first audio');
                        setSelectedAudioUrl(audioUrls[firstAudioId]);
                      }
                    }}
                    className="mt-2"
                  >
                    Test Set First Audio
                  </Button>
                </div>
                <div className="space-y-3">
                  {Object.entries(audioUrls).map(([audioId, audioUrl]) => (
                    <div
                      key={audioId}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedAudioUrl === audioUrl
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => {
                        console.log('Audio card clicked with audioId:', audioId);
                        handleAudioSelect(audioId);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Audio {audioId}
                          </span>
                          {selectedAudioUrl === audioUrl && (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-400">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (playingAudioId === audioId) {
                              stopAudioPlayback(audioId);
                            } else {
                              setPlayingAudioId(audioId);
                            }
                          }}
                        >
                          {playingAudioId === audioId ? (
                            <>
                              <Square className="w-3 h-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </>
                          )}
                        </Button>
                      </div>
                      <AudioPlayer
                        src={audioUrl}
                        onPlay={() => setPlayingAudioId(audioId)}
                        onPause={() => setPlayingAudioId(null)}
                        onEnded={() => setPlayingAudioId(null)}
                        onError={(error) => {
                          console.error('Audio player error:', error);
                          setPlayingAudioId(null);
                          toast.error('Failed to play audio');
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
                {selectedAudioUrl && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Selected Audio:</strong> {Object.keys(audioUrls).find(key => audioUrls[key] === selectedAudioUrl)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      This audio will be used for lip sync video generation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Select Video for LipSync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Choose a video to apply lip-sync to</Label>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  {selectedVideo ? (
                    <div className="w-full h-full relative">
                      <video
                        src={getVideoUrl(selectedVideo.video_id)}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                        loop
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <Video className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No video selected</p>
                      <p className="text-xs text-slate-400">Choose from your completed videos</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowVideoSelector(true)}
                  className="w-full"
                  variant="outline"
                  disabled={loadingVideos}
                >
                  {loadingVideos ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading videos...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Select Video ({videos.length})
                    </>
                  )}
                </Button>
                {selectedVideo && (
                  <Button
                    onClick={() => setSelectedVideo(null)}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Selection
                  </Button>
                )}
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
      {/* Video Selector Modal */}
      <VideoSelector
        open={showVideoSelector}
        onOpenChange={setShowVideoSelector}
        onVideoSelect={(video) => {
          setSelectedVideo(video);
          setShowVideoSelector(false);
        }}
        title="Select Video for LipSync"
        description="Choose an existing video to apply lip-sync audio to"
      />

      {showHistory && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-500" />
                LipSync Video History
              </DialogTitle>
              <DialogDescription>
                Your lip-sync video generation history. Showing {lipSyncVideos.length} videos.
              </DialogDescription>
            </DialogHeader>

            {/* Search and Filter Controls */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search lip-sync videos by prompt or model..."
                      value={videoSearchTerm}
                      onChange={(e) => setVideoSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={videoFilterStatus} onValueChange={setVideoFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Videos</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={videoSortBy} onValueChange={setVideoSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Video Grid */}
            <ScrollArea className="h-[400px]">
              {loadingVideos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : lipSyncVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lipSyncVideos
                    .filter(video => {
                      const matchesStatus = videoFilterStatus === 'all' || video.status === videoFilterStatus;
                      const matchesSearch = video.prompt.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
                        video.model.toLowerCase().includes(videoSearchTerm.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .sort((a, b) => {
                      switch (videoSortBy) {
                        case 'newest':
                          return new Date(b.task_created_at).getTime() - new Date(a.task_created_at).getTime();
                        case 'oldest':
                          return new Date(a.task_created_at).getTime() - new Date(b.task_created_at).getTime();
                        case 'duration':
                          return b.duration - a.duration;
                        case 'model':
                          return a.model.localeCompare(b.model);
                        default:
                          return 0;
                      }
                    })
                    .map((video) => (
                      <Card
                        key={video.video_id}
                        className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handleVideoClick(video)}
                      >
                        <CardContent className="p-3">
                          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 relative overflow-hidden">
                            <video
                              src={getVideoUrl(video.video_id)}
                              className="w-full h-full object-cover"
                              muted
                              loop
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-2">
                                <Play className="w-6 h-6 text-purple-600" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {video.prompt.substring(0, 60)}...
                              </h4>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getVideoStatusColor(video.status)}`}
                                >
                                  {video.status}
                                </Badge>
                                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-sm text-xs">
                                  <Sparkles className="w-2 h-2 mr-1" />
                                  LipSync
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{getVideoModelDisplayName(video.model)}</span>
                              <span>{formatVideoDuration(video.duration)}</span>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {formatVideoDate(video.task_created_at)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No lip-sync videos found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {videoSearchTerm || videoFilterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first lip-sync video to get started.'
                    }
                  </p>
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {lipSyncVideos.filter(video => {
                  const matchesStatus = videoFilterStatus === 'all' || video.status === videoFilterStatus;
                  const matchesSearch = video.prompt.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
                    video.model.toLowerCase().includes(videoSearchTerm.toLowerCase());
                  return matchesStatus && matchesSearch;
                }).length} of {lipSyncVideos.length} lip-sync videos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(false)}
                >
                  Close
                </Button>
              </div>
            </div>
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

      {/* Video Playback Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" />
              LipSync Video Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideoForModal && (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={getVideoUrl(selectedVideoForModal.video_id)}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              </div>

              {/* Video Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Prompt</Label>
                    <p className="text-sm mt-1">{selectedVideoForModal.prompt}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                      <p className="text-sm mt-1">{getVideoModelDisplayName(selectedVideoForModal.model)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                      <p className="text-sm mt-1">{formatVideoDuration(selectedVideoForModal.duration)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <p className="text-sm mt-1">{selectedVideoForModal.status}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <p className="text-sm mt-1">LipSync Video</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm mt-1">{formatVideoDate(selectedVideoForModal.task_created_at)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getVideoStatusColor(selectedVideoForModal.status)} border`}>
                        {selectedVideoForModal.status}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        LipSync
                      </Badge>
                    </div>
                  </div>

                  {selectedVideoForModal.audio && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Audio Used</Label>
                      <p className="text-sm mt-1">{selectedVideoForModal.audio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleDownload(selectedVideoForModal)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handleShare(selectedVideoForModal)}
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Lipsync Preset Modal */}
      <Dialog open={showSavePresetModal} onOpenChange={setShowSavePresetModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                <Save className="w-5 h-5 text-white" />
              </div>
              Save as Lipsync Preset
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Save your current lipsync generation settings as a reusable preset with an image
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preset Name Input */}
            <div className="space-y-2">
              <Label htmlFor="preset-name" className="text-sm font-medium">
                Preset Name
              </Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter a descriptive name for your lipsync preset..."
                className="w-full"
              />
            </div>

            {/* Preset Description Input */}
            <div className="space-y-2">
              <Label htmlFor="preset-description" className="text-sm font-medium flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Preset Description
              </Label>
              <Textarea
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Describe your lipsync preset's purpose, style, or any special notes..."
                className="w-full min-h-[80px] resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Add context to help you remember what this preset is for</span>
                <span>{presetDescription.length}/500</span>
              </div>
            </div>

            {/* Image Selection Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Preset Image</Label>

              {/* Selected Image Display */}
              {selectedPresetImage && (
                <div className="relative">
                  <Card className={`justify-center flex group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-yellow-500/30 backdrop-blur-sm ${selectedPresetImage.task_id?.startsWith('upload_')
                    ? 'bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 hover:border-purple-500/30'
                    : 'bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5'
                    }`}>
                    <CardContent className="p-4">
                      {/* Top Row: File Type, Ratings, Favorite */}
                      <div className="flex items-center justify-between mb-3">
                        {/* File Type Icon */}
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center shadow-md ${selectedPresetImage.task_id?.startsWith('upload_')
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                          {selectedPresetImage.task_id?.startsWith('upload_') ? (
                            <Upload className="w-4 h-4 text-white" />
                          ) : (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8" />
                            </svg>
                          )}
                        </div>

                        {/* Rating Stars */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= (selectedPresetImage.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>

                        {/* Favorite Heart */}
                        <div>
                          {selectedPresetImage.favorite ? (
                            <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                        {/* Source Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge variant="secondary" className="bg-black/70 text-white text-xs font-medium shadow-lg">
                            {presetImageSource}
                          </Badge>
                        </div>

                        <img
                          src={selectedPresetImage.preview_url || `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${selectedPresetImage.user_filename === "" ? "output" : "vault/" + selectedPresetImage.user_filename}/${selectedPresetImage.system_filename}`}
                          alt="Selected preset image"
                          className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                        />
                      </div>

                      {/* Filename and Date */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                          {selectedPresetImage.system_filename}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(selectedPresetImage.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-1.5 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs font-medium"
                          onClick={() => setSelectedPresetImage(null)}
                        >
                          <X className="w-3 h-3 mr-1.5" />
                          Remove Image
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Image Source Selection */}
              {!selectedPresetImage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-300 hover:border-emerald-500"
                    onClick={() => setShowVaultSelectorForPreset(true)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">From Vault</h3>
                      <p className="text-sm text-muted-foreground">
                        Select from your saved images
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-300 hover:border-emerald-500"
                    onClick={() => {
                      // Trigger file selection directly
                      document.getElementById('preset-file-upload-direct')?.click();
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Upload Image</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a new image
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowSavePresetModal(false);
                  setPresetName('');
                  setPresetDescription('');
                  setSelectedPresetImage(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePreset}
                disabled={!presetName.trim() || !selectedPresetImage || isSavingPreset}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                {isSavingPreset ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preset
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for direct upload */}
      <input
        type="file"
        id="preset-file-upload-direct"
        accept="image/*"
        onChange={handlePresetFileUpload}
        className="hidden"
      />

      {/* Vault Selector for Preset */}
      {showVaultSelectorForPreset && (
        <VaultSelector
          open={showVaultSelectorForPreset}
          onOpenChange={setShowVaultSelectorForPreset}
          onImageSelect={(image) => {
            handlePresetImageSelect(image, 'vault');
            setShowVaultSelectorForPreset(false);
          }}
          title="Select Preset Image"
          description="Choose an image to represent your lipsync preset"
        />
      )}

      {/* Lipsync Presets Manager Modal */}
      {showLipsyncPresetsModal && (
        <LipsyncPresetsManager
          onClose={() => setShowLipsyncPresetsModal(false)}
          onApplyPreset={handleApplyLipsyncPreset}
        />
      )}

      {/* Lipsync Library Manager Modal */}
      {showLipsyncLibraryModal && (
        <LipsyncLibraryManager
          onClose={() => setShowLipsyncLibraryModal(false)}
          onApplyPreset={handleApplyLipsyncPreset}
        />
      )}
    </div>
  );
}

export default ContentCreateLipSyncVideo; 