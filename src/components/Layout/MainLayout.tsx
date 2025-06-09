import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setUser, setLoading, setError } from '@/store/slices/userSlice';
import { toast } from 'sonner';

export function MainLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state: RootState) => state.ui);
  const userData = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        navigate('/signin');
        return;
      }

      dispatch(setLoading(true));
      
      try {
        const response = await fetch('https://api.nymia.ai/v1/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            access_token: accessToken
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        dispatch(setUser({
          id: data.id,
          email: data.email,
          firstName: data.user_metadata.first_name,
          lastName: data.user_metadata.last_name,
          nickname: data.user_metadata.nickname,
          level: data.user_metadata.level,
          credits: data.user_metadata.credits || 0,
          subscription: data.user_metadata.subscription || 'free'
        }));
      } catch (error) {
        navigate('/signin');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUserData();
  }, [dispatch, navigate]);

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Log user data from Redux store
  useEffect(() => {
    console.log('User Data from Redux Store:', {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      nickname: userData.nickname,
      level: userData.level,
      credits: userData.credits,
      subscription: userData.subscription,
      loading: userData.loading,
      error: userData.error
    });
  }, [userData]);

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
