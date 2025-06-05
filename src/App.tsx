
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from '@/pages/Homepage';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Account from '@/pages/Account';
import CreateInfluencer from '@/pages/CreateInfluencer';
import InfluencerTemplates from '@/pages/InfluencerTemplates';
import InfluencerEdit from '@/pages/InfluencerEdit';
import InfluencerUse from '@/pages/InfluencerUse';
import Clothing from '@/pages/Clothing';
import Location from '@/pages/Location';
import Poses from '@/pages/Poses';
import Accessories from '@/pages/Accessories';
import Vault from '@/pages/Vault';
import NotFound from '@/pages/NotFound';
import { MainLayout } from '@/components/Layout/MainLayout';

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
          <BrowserRouter>
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
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
