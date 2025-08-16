import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from '@/pages/Homepage';
import Dashboard from '@/pages/Dashboard';
import Start from '@/pages/Start';
import Auth from '@/pages/Auth';
import Account from '@/pages/Account';
import { CreateInfluencer } from '@/pages/CreateInfluencer';
import InfluencerTemplates from '@/pages/InfluencerTemplates';
import InfluencerProfiles from '@/pages/InfluencerProfiles';
import InfluencerEdit from '@/pages/InfluencerEdit';
import InfluencerUse from '@/pages/InfluencerUse';
import InfluencerWizardPage from '@/pages/InfluencerWizardPage';
import InfluencerBio from '@/pages/InfluencerBio';
import SocialBio from '@/pages/SocialBio';
import Lora from '@/pages/Lora';
// import InfluencerLoraTraining from '@/pages/InfluencerLoraTraining';
import Clothing from '@/pages/Clothing';
import Location from '@/pages/Location';
import Poses from '@/pages/Poses';
import Accessories from '@/pages/Accessories';
import Vault from '@/pages/Vault';
import ContentCreateImage from '@/pages/ContentCreateImage';
import { useLocation, useNavigate } from 'react-router-dom';

// Wrapper component to pass location state to ContentCreateImage
const ContentCreateImageWrapper = () => {
  const location = useLocation();
  return <ContentCreateImage influencerData={location.state?.influencerData} />;
};

// Wrapper component to pass location state to ContentCreateVideo
const ContentCreateVideoWrapper = () => {
  const location = useLocation();
  return <ContentCreateVideo influencerData={location.state?.influencerData} />;
};
import ContentCreateVideo from '@/pages/ContentCreateVideo';
import ContentUpscaler from '@/pages/ContentUpscaler';
import ContentEdit from '@/pages/ContentEdit';
import ContentStory from '@/pages/ContentStory';
import ContentSchedule from '@/pages/ContentSchedule';
import ContentBatch from '@/pages/ContentBatch';
import FaceSwap from '@/pages/FaceSwap';
import Settings from '@/pages/Settings';
import VideoFolder from '@/components/VideoFolder';
import AudioFolder from '@/components/AudioFolder';

// Wrapper components to provide onBack functionality
const VideoFolderWrapper = () => {
  const navigate = useNavigate();
  return <VideoFolder onBack={() => navigate('/dashboard')} />;
};

const AudioFolderWrapper = () => {
  const navigate = useNavigate();
  return <AudioFolder onBack={() => navigate('/dashboard')} />;
};
import NotFound from '@/pages/NotFound';
import { MainLayout } from '@/components/Layout/MainLayout';
import Pricing from '@/pages/Pricing';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <div className="w-full">
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/signin" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/" element={<Homepage />} />
                <Route element={<MainLayout />}>
                  <Route path="/start" element={<Start />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/account" element={<Account />} />
                  <Route path='/influencers/new' element={<CreateInfluencer />} />
                  <Route path='/influencers/templates' element={<InfluencerTemplates />} />
                  <Route path='/influencers/profiles' element={<InfluencerProfiles />} />
                  <Route path='/influencers/edit' element={<InfluencerEdit />} />
                  <Route path='/influencers' element={<InfluencerUse />} />
                  <Route path='/influencers/wizard' element={<InfluencerWizardPage />} />
                  <Route path='/influencers/bio' element={<InfluencerBio />} />
                  <Route path='/influencers/consistency' element={<Lora />} />
                  {/* <Route path='/influencers/lora-training' element={<InfluencerLoraTraining />} /> */}
                  <Route path='/catalog/clothing' element={<Clothing />} />
                  <Route path='/catalog/location' element={<Location />} />
                  <Route path='/catalog/poses' element={<Poses />} />
                  <Route path='/catalog/accessories' element={<Accessories />} />
                  
                                <Route path='/create/images' element={<ContentCreateImageWrapper />} />
                <Route path='/create/faceswap' element={<FaceSwap />} />
                <Route path='/create/videos' element={<ContentCreateVideoWrapper />} />
                <Route path='/create/optimizer' element={<ContentUpscaler />} />
                                <Route path='/create/edit' element={<ContentEdit />} />
                <Route path='/library/images' element={<Vault />} />
                <Route path='/library/videos' element={<VideoFolderWrapper />} />
                <Route path='/library/audios' element={<AudioFolderWrapper />} />
                <Route path='/social/bio' element={<SocialBio />} />
                <Route path='/social/story' element={<ContentStory />} />
                <Route path='/social/schedule' element={<ContentSchedule />} />
                <Route path='/social/batch' element={<ContentBatch />} />
                  <Route path='/settings' element={<Settings />} />
                  <Route path="/pricing" element={<Pricing />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;

