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
import Auth from '@/pages/Auth';
import Account from '@/pages/Account';
import { CreateInfluencer } from '@/pages/CreateInfluencer';
import InfluencerTemplates from '@/pages/InfluencerTemplates';
import InfluencerEdit from '@/pages/InfluencerEdit';
import InfluencerUse from '@/pages/InfluencerUse';
import Clothing from '@/pages/Clothing';
import Location from '@/pages/Location';
import Poses from '@/pages/Poses';
import Accessories from '@/pages/Accessories';
import Vault from '@/pages/Vault';
import ContentCreate from '@/pages/ContentCreate';
import ContentEnhance from '@/pages/ContentEnhance';
import ContentEdit from './pages/ContentEdit';
import ContentStory from './pages/ContentStory';
import ContentSchedule from './pages/ContentSchedule';
import ContentBatch from './pages/ContentBatch';
import Settings from './pages/Settings';
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
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/account" element={<Account />} />
                  <Route path='/influencers/create' element={<CreateInfluencer />} />
                  <Route path='/influencers/templates' element={<InfluencerTemplates />} />
                  <Route path='/influencers/edit' element={<InfluencerEdit />} />
                  <Route path='/influencers' element={<InfluencerUse />} />
                  <Route path='/catalog/clothing' element={<Clothing />} />
                  <Route path='/catalog/location' element={<Location />} />
                  <Route path='/catalog/poses' element={<Poses />} />
                  <Route path='/catalog/accessories' element={<Accessories />} />
                  <Route path='/content/vault' element={<Vault />} />
                  <Route path='/content/create' element={<ContentCreate />} />
                  <Route path='/content/enhance' element={<ContentEnhance />} />
                  <Route path='/content/edit' element={<ContentEdit />} />
                  <Route path='/content/story' element={<ContentStory />} />
                  <Route path='/content/schedule' element={<ContentSchedule />} />
                  <Route path='/content/batch' element={<ContentBatch />} />
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

