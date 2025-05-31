import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';

export function MainLayout() {
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'dark' : ''}`}>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <Header />
            <main className="flex-1 overflow-auto p-6 bg-background">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
