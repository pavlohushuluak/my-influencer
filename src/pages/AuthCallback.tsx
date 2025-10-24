import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/supabase';
import { setUser } from '@/store/slices/userSlice';
import { toast } from 'sonner';
import config from '@/config/config';
import { debugSupabaseAuth } from '@/lib/supabaseDebug';

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Debug-Analyse ausführen
        console.log('🔧 Starting OAuth Callback Debug...');
        await debugSupabaseAuth();
        
        // LÖSUNG: Manuelle Token-Extraktion aus URL-Hash da Supabase-Server 401 gibt
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const providerToken = hashParams.get('provider_token');
        
        console.log('Extracted tokens:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          hasProviderToken: !!providerToken 
        });

        // Fallback: Versuche trotzdem Supabase Session zu bekommen
        const { session, error: sessionError } = await auth.getSession();
        
        // Prüfe ob wir Token haben (entweder von Supabase oder aus URL)
        const hasTokens = accessToken || session?.access_token;
        
        if (sessionError && !hasTokens) {
          console.error('Session error und keine Token:', sessionError);
          toast.error('Authentication failed');
          navigate('/signin');
          return;
        }

        // Verwende Supabase Session oder erstelle aus URL-Token
        let userSession = session;
        if (!session && accessToken) {
          // Dekodiere JWT Token um Benutzerinfo zu bekommen
          try {
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            console.log('Token payload:', tokenPayload);
            
            // Extract user_metadata from token payload (Google info is here)
            const userMetadata = tokenPayload.user_metadata || {};
            console.log('Raw user_metadata from token:', userMetadata);
            
            userSession = {
              access_token: accessToken,
              refresh_token: refreshToken || '',
              user: {
                id: tokenPayload.sub,
                email: tokenPayload.email,
                user_metadata: userMetadata,
                app_metadata: tokenPayload.app_metadata || {},
                aud: tokenPayload.aud || 'authenticated',
                created_at: new Date().toISOString()
              }
            } as any;
          } catch (error) {
            console.error('Token decode error:', error);
            toast.error('Invalid authentication token');
            navigate('/signin');
            return;
          }
        }

        if (userSession?.user) {
          // Store tokens in sessionStorage (maintaining existing pattern)
          if (userSession.access_token) {
            sessionStorage.setItem('access_token', userSession.access_token);
          }
          if (userSession.refresh_token) {
            sessionStorage.setItem('refresh_token', userSession.refresh_token);
          }

          // Get or create user profile from your existing backend
          try {
            console.log('🔍 Looking for existing user with UUID:', userSession.user.id);
            
            // First try to get existing user data by UUID
            let userResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userSession.user.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              }
            });

            let userData = await userResponse.json();
            console.log('🔍 User lookup by UUID result:', userData);

            // If not found by UUID, try to find by email (for existing users)
            if (!userData || userData.length === 0) {
              console.log('🔍 No user found by UUID, searching by email:', userSession.user.email);
              userResponse = await fetch(`${config.supabase_server_url}/user?email=eq.${userSession.user.email}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                }
              });
              userData = await userResponse.json();
              console.log('🔍 User lookup by email result:', userData);
              
              // If found by email, update the UUID to match Google OAuth
              if (userData && userData.length > 0) {
                console.log('Found existing user by email, updating UUID');
                await fetch(`${config.supabase_server_url}/user?userid=eq.${userData[0].userid}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer WeInfl3nc3withAI'
                  },
                  body: JSON.stringify({
                    uuid: userSession.user.id
                  })
                });
              }
            }

            if (userData && userData.length > 0) {
              // User exists - check if names need to be updated from Google OAuth
              console.log('✅ Existing user found:', userData[0]);
              
              const user = userData[0];
              let needsNameUpdate = false;
              
              // Check if names are missing or need updating
              if (!user.first_name || !user.last_name || !user.nickname || 
                  user.first_name === null || user.last_name === null || user.nickname === null) {
                needsNameUpdate = true;
                console.log('🔄 User names are missing, extracting from Google OAuth');
                
                // Extract names from Google OAuth data
                const googleUser = userSession.user;
                console.log('User metadata for name extraction:', googleUser.user_metadata);
                
                let firstName = '';
                let lastName = '';
                let displayName = '';
                
                // Get display name and split names
                displayName = googleUser.user_metadata?.full_name || 
                             googleUser.user_metadata?.name || 
                             googleUser.email?.split('@')[0] || 'User';
                
                if (googleUser.user_metadata?.full_name) {
                  const nameParts = googleUser.user_metadata.full_name.split(' ');
                  firstName = nameParts[0] || '';
                  lastName = nameParts.slice(1).join(' ') || '';
                  console.log('Names extracted from full_name:', { firstName, lastName, displayName });
                }
                
                // Override with specific fields if available
                firstName = googleUser.user_metadata?.given_name || 
                           googleUser.user_metadata?.first_name || 
                           firstName || '';
                lastName = googleUser.user_metadata?.family_name || 
                          googleUser.user_metadata?.last_name || 
                          lastName || '';
                
                // Ensure fields are never null - use space " " instead
                firstName = firstName.trim() || ' ';
                lastName = lastName.trim() || ' ';
                const nickname = displayName.trim() || firstName.trim() || 'User';
                
                console.log('Final names for update:', { firstName, lastName, nickname });
                
                // Update user in database
                console.log('🔄 Updating user in database:', {
                  url: `${config.supabase_server_url}/user?userid=eq.${user.userid}`,
                  payload: { first_name: firstName, last_name: lastName, nickname: nickname }
                });
                
                const updateResponse = await fetch(`${config.supabase_server_url}/user?userid=eq.${user.userid}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer WeInfl3nc3withAI'
                  },
                  body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    nickname: nickname
                  })
                });
                
                const updateResponseText = await updateResponse.text();
                console.log('Update response status:', updateResponse.status);
                console.log('Update response:', updateResponseText);
                
                if (updateResponse.ok) {
                  console.log('✅ User names updated successfully');
                  // Update local userData object
                  user.first_name = firstName;
                  user.last_name = lastName;
                  user.nickname = nickname;
                } else {
                  console.error('❌ Failed to update user names:', updateResponse.status, updateResponseText);
                }
              }
              
              // Update Redux store with current/updated user data
              dispatch(setUser({
                id: user.uuid,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                nickname: user.nickname,
                credits: user.credits || 0,
                subscription: user.subscription || 'free',
                billing_date: user.billing_date || 0,
                billed_date: user.billed_date || 0,
                free_purchase: user.free_purchase,
                guide_step: user.guide_step || 1
              }));
            } else {
              // New user from Google OAuth - create user profile
              console.log('🆕 Creating new user from Google OAuth');
              const googleUser = userSession.user;
              console.log('Google user data:', googleUser);
              
              // Extract name from Google OAuth data - multiple possible sources
              console.log('User metadata for name extraction:', googleUser.user_metadata);
              let firstName = '';
              let lastName = '';
              let displayName = '';
              
              // Get display name (for nickname field) - prioritize full_name and name
              displayName = googleUser.user_metadata?.full_name || 
                           googleUser.user_metadata?.name || 
                           googleUser.user_metadata?.display_name || 
                           googleUser.email?.split('@')[0] || 'User';
              
              console.log('Extracted display name:', displayName);
              
              // Split full_name if available
              if (googleUser.user_metadata?.full_name) {
                const nameParts = googleUser.user_metadata.full_name.split(' ');
                firstName = nameParts[0] || '';
                lastName = nameParts.slice(1).join(' ') || '';
                console.log('Name parts from full_name:', { firstName, lastName });
              } else if (googleUser.user_metadata?.name) {
                // Fallback to "name" field
                const nameParts = googleUser.user_metadata.name.split(' ');
                firstName = nameParts[0] || '';
                lastName = nameParts.slice(1).join(' ') || '';
                console.log('Name parts from name:', { firstName, lastName });
              }
              
              // Override with specific fields if available (Google uses given_name/family_name)
              firstName = googleUser.user_metadata?.given_name || 
                         googleUser.user_metadata?.first_name || 
                         firstName || '';
              lastName = googleUser.user_metadata?.family_name || 
                        googleUser.user_metadata?.last_name || 
                        lastName || '';
              
              console.log('Final extracted names:', { firstName, lastName, displayName });
              
              // Ensure fields are never null - use space " " instead of empty string
              firstName = firstName.trim() || ' ';
              lastName = lastName.trim() || ' ';
              
              // Use display name as nickname, fallback to first name
              const nickname = displayName.trim() || firstName.trim() || 'User';
              
              console.log('Extracted names:', { firstName, lastName, nickname, displayName }); // Debug log
              console.log('Creating user with data:', {
                uuid: googleUser.id,
                email: googleUser.email,
                first_name: firstName,
                last_name: lastName,
                nickname: nickname
              });

              // Create user in your database
              const createUserResponse = await fetch(`${config.supabase_server_url}/user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI',
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                  uuid: googleUser.id,
                  email: googleUser.email,
                  first_name: firstName,
                  last_name: lastName,
                  nickname: nickname,
                  credits: 10, // Default starting credits
                  subscription: 'free',
                  guide_step: 1
                })
              });

              const createUserResponseText = await createUserResponse.text();
              console.log('Create user response status:', createUserResponse.status);
              console.log('Create user response:', createUserResponseText);
              
              if (createUserResponse.ok) {
                const newUserData = JSON.parse(createUserResponseText);
                
                // Create folder structure for new user (maintaining existing pattern)
                const folders = ['input', 'models', 'presets', 'output', 'vault', 'vault/Inbox', 'vault/Trash', 'vault/Examples'];
                for (const folder of folders) {
                  await fetch(`${config.backend_url}/createfolder`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer WeInfl3nc3withAI',
                    },
                    body: JSON.stringify({
                      user: googleUser.id,
                      folder: folder,
                    }),
                  });
                }

                // Update Redux store with new user
                dispatch(setUser({
                  id: googleUser.id,
                  email: googleUser.email || '',
                  firstName: firstName,
                  lastName: lastName,
                  nickname: nickname,
                  credits: 10,
                  subscription: 'free',
                  billing_date: 0,
                  billed_date: 0,
                  free_purchase: undefined,
                  guide_step: 1
                }));
              }
            }

            toast.success('Successfully signed in with Google');
            navigate('/start');
          } catch (backendError) {
            console.error('Backend integration error:', backendError);
            toast.error('Profile setup failed');
            navigate('/signin');
          }
        } else {
          console.log('No session found');
          navigate('/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/signin');
      }
    };

    handleAuthCallback();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-ai-purple-500" />
        <p className="text-muted-foreground">Completing Google sign-in...</p>
      </div>
    </div>
  );
}