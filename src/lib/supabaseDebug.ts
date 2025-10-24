// Systematischer Debug für Supabase OAuth-Probleme
// OHNE bestehenden Code zu zerstören

export const debugSupabaseAuth = async () => {
  console.log('🔧 SUPABASE AUTH DEBUG - Systematische Problemanalyse');
  console.log('====================================================');
  
  // 1. Test der Supabase-Server-Erreichbarkeit
  console.log('\n1. Server-Erreichbarkeit testen...');
  try {
    const response = await fetch('https://supabase.nymia.io/auth/v1/settings', {
      method: 'GET'
    });
    console.log('✓ Supabase Server Status:', response.status);
    console.log('✓ Response OK:', response.ok);
  } catch (error) {
    console.error('❌ Server nicht erreichbar:', error);
  }

  // 2. Test der aktuellen Session
  console.log('\n2. Session-Status überprüfen...');
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('✓ Current Session:', sessionData);
    if (sessionError) {
      console.error('❌ Session Error:', sessionError);
    }
  } catch (error) {
    console.error('❌ Session Check Failed:', error);
  }

  // 3. Test der URL-Parameter (für Callback-Seite)
  console.log('\n3. URL-Parameter analysieren...');
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  console.log('✓ Query Parameters:', Object.fromEntries(urlParams));
  console.log('✓ Hash Parameters:', Object.fromEntries(hashParams));

  // 4. Test der lokalen Storage
  console.log('\n4. Local Storage überprüfen...');
  const accessToken = sessionStorage.getItem('access_token');
  const refreshToken = sessionStorage.getItem('refresh_token');
  console.log('✓ Access Token exists:', !!accessToken);
  console.log('✓ Refresh Token exists:', !!refreshToken);

  // 5. Environment-Check
  console.log('\n5. Environment-Konfiguration...');
  console.log('✓ Current URL:', window.location.href);
  console.log('✓ Redirect URL sollte sein:', 'https://dev.nymia.ai/auth/callback');
  console.log('✓ Supabase URL:', 'https://supabase.nymia.io');

  console.log('\n====================================================');
  console.log('🔧 Debug abgeschlossen. Logs oben analysieren.');
};

// Einfache Funktion zum Testen der Google OAuth ohne bestehenden Code zu beeinträchtigen
export const testGoogleOAuth = async () => {
  console.log('🔧 GOOGLE OAUTH TEST');
  console.log('====================');
  
  try {
    const { supabase } = await import('@/lib/supabase');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://dev.nymia.ai/auth/callback'
      }
    });
    
    console.log('✓ Google OAuth Result:', { data, error });
    
    if (error) {
      console.error('❌ Google OAuth Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Google OAuth Exception:', error);
  }
};

// Global verfügbar machen für Console-Tests
(window as any).debugSupabaseAuth = debugSupabaseAuth;
(window as any).testGoogleOAuth = testGoogleOAuth;