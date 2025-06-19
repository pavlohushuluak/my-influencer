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
      dispatch(setLoading(true));
      let accessToken = sessionStorage.getItem('access_token');
      const refreshToken = sessionStorage.getItem('refresh_token');
      
      if (!accessToken && !refreshToken) {
        navigate('/signin');
        return;
      }

      // If no access token but refresh token exists, try to get new access token
      if (!accessToken && refreshToken) {
        try {
          const refreshResponse = await fetch('https://api.nymia.ai/v1/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              refresh_token: refreshToken
            })
          });

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token');
          }

          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;
          sessionStorage.setItem('access_token', accessToken);
        } catch (error) {
          console.error('Error refreshing token:', error);
          sessionStorage.removeItem('refresh_token');
          navigate('/signin');
          return;
        }
      }
      
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

        const userResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${data.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        const userData = await userResponse.json();

        // Update user data in Redux store
        dispatch(setUser({
          id: userData[0].uuid,
          email: userData[0].email,
          firstName: userData[0].first_name,
          lastName: userData[0].last_name,
          nickname: userData[0].nickname,
          credits: userData[0].credits || 0,
          subscription: userData[0].subscription || 'free'
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
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
