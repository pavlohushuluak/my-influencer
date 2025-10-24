import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import { CreateInfluencer } from "@/pages/CreateInfluencer";
import Dashboard from "@/pages/Dashboard";
import Fanvue from "@/pages/Fanvue";
import InfluencerBio from "@/pages/InfluencerBio";
import InfluencerEdit from "@/pages/InfluencerEdit";
import InfluencerProfiles from "@/pages/InfluencerProfiles";
import InfluencerTemplates from "@/pages/InfluencerTemplates";
import InfluencerUse from "@/pages/InfluencerUse";
import InfluencerWizardPage from "@/pages/InfluencerWizardPage";
import Lora from "@/pages/Lora";
import SocialBio from "@/pages/SocialBio";
import Start from "@/pages/Start";
import { store } from "@/store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import InfluencerLoraTraining from '@/pages/InfluencerLoraTraining';
import AudioFolder from "@/components/AudioFolder";
import { MainLayout } from "@/components/Layout/MainLayout";
import VideoFolder from "@/components/VideoFolder";
import Accessories from "@/pages/Accessories";
import Clothing from "@/pages/Clothing";
import Composer from "@/pages/Composer";
import ContentBatch from "@/pages/ContentBatch";
import ContentCreateImage from "@/pages/ContentCreateImage";
import ContentCreateVideo from "@/pages/ContentCreateVideo";
import ContentEdit from "@/pages/ContentEdit";
import ContentSchedule from "@/pages/ContentSchedule";
import ContentStory from "@/pages/ContentStory";
import ContentUpscaler from "@/pages/ContentUpscaler";
import FaceSwap from "@/pages/FaceSwap";
import Location from "@/pages/Location";
import NotFound from "@/pages/NotFound";
import Poses from "@/pages/Poses";
import Pricing from "@/pages/Pricing";
import ResetPassword from "@/pages/ResetPassword";
import Settings from "@/pages/Settings";
import Vault from "@/pages/Vault";
import { useLocation, useNavigate } from "react-router-dom";

// Wrapper component to pass location state to ContentCreateImage
const ContentCreateImageWrapper = () => {
  const location = useLocation();
  return <ContentCreateImage />;
};

// Wrapper component to pass location state to ContentCreateVideo
const ContentCreateVideoWrapper = () => {
  const location = useLocation();
  return <ContentCreateVideo influencerData={location.state?.influencerData} />;
};

// Wrapper components to provide onBack functionality
const VideoFolderWrapper = () => {
  const navigate = useNavigate();
  return <VideoFolder onBack={() => navigate("/dashboard")} />;
};

const AudioFolderWrapper = () => {
  const navigate = useNavigate();
  return <AudioFolder onBack={() => navigate("/dashboard")} />;
};

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
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                {/* <Route path="/" element={<Homepage />} /> */}
                <Route element={<MainLayout />}>
                  <Route path="/start" element={<Start />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/influencers/new"
                    element={<CreateInfluencer />}
                  />
                  <Route
                    path="/influencers/templates"
                    element={<InfluencerTemplates />}
                  />
                  <Route
                    path="/influencers/profiles"
                    element={<InfluencerProfiles />}
                  />
                  <Route
                    path="/influencers/edit"
                    element={<InfluencerEdit />}
                  />
                  <Route path="/influencers" element={<InfluencerUse />} />
                  <Route
                    path="/influencers/wizard"
                    element={<InfluencerWizardPage />}
                  />
                  <Route path="/influencers/bio" element={<InfluencerBio />} />
                  <Route path="/influencers/consistency" element={<Lora />} />
                  {/* <Route path='/influencers/lora-training' element={<InfluencerLoraTraining />} /> */}
                  <Route path="/catalog/clothing" element={<Clothing />} />
                  <Route path="/catalog/location" element={<Location />} />
                  <Route path="/catalog/poses" element={<Poses />} />
                  <Route
                    path="/catalog/accessories"
                    element={<Accessories />}
                  />
                  <Route
                    path="/create/images"
                    element={<ContentCreateImageWrapper />}
                  />
                  {/* <Route path="/create/compose" element={<Compose />} /> */}
                  <Route path="/create/composer" element={<Composer />} />
                  <Route path="/create/faceswap" element={<FaceSwap />} />
                  <Route
                    path="/create/videos"
                    element={<ContentCreateVideoWrapper />}
                  />
                  <Route
                    path="/create/optimizer"
                    element={<ContentUpscaler />}
                  />
                  <Route path="/create/edit" element={<ContentEdit />} />
                  <Route path="/library/images" element={<Vault />} />
                  <Route
                    path="/library/videos"
                    element={<VideoFolderWrapper />}
                  />
                  <Route
                    path="/library/audios"
                    element={<AudioFolderWrapper />}
                  />
                  <Route path="/social/bio" element={<SocialBio />} />
                  <Route path="/social/fanvue" element={<Fanvue />} />
                  <Route path="/social/story" element={<ContentStory />} />
                  <Route
                    path="/social/schedule"
                    element={<ContentSchedule />}
                  />
                  <Route path="/social/batch" element={<ContentBatch />} />
                  <Route path="/settings" element={<Settings />} />
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
