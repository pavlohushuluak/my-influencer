import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface DebugInfo {
  timestamp: string;
  step: string;
  data: any;
  error?: any;
}

export default function GoogleOAuthDebug() {
  const [logs, setLogs] = useState<DebugInfo[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const addLog = (step: string, data: any, error?: any) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      step,
      data,
      error
    }]);
  };

  const testSupabaseConnection = async () => {
    addLog('Testing Supabase Connection', 'Starting connection test...');
    
    try {
      // Test 1: Basic Supabase client
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      addLog('Get Session', { sessionData, sessionError });

      // Test 2: Check if we can reach auth endpoint
      const response = await fetch('https://supabase.nymia.io/auth/v1/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      addLog('Auth Settings Check', { status: response.status, ok: response.ok });

      // Test 3: Test environment configuration
      addLog('Environment Check', { 
        supabaseUrl: 'https://supabase.nymia.io',
        currentUrl: window.location.href,
        redirectUrl: 'https://dev.nymia.ai/auth/callback'
      });

    } catch (error) {
      addLog('Connection Test Failed', null, error);
    }
  };

  const testGoogleSignIn = async () => {
    addLog('Testing Google Sign In', 'Starting Google OAuth test...');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://dev.nymia.ai/auth/callback`
        }
      });
      
      addLog('Google OAuth Response', { data, error });
    } catch (error) {
      addLog('Google OAuth Failed', null, error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isDebugMode) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsDebugMode(true)}
        className="mt-4"
      >
        🔧 OAuth Debug
      </Button>
    );
  }

  return (
    <Card className="mt-4 max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Google OAuth Debug Console
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsDebugMode(false)}
          >
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <Button onClick={testSupabaseConnection} size="sm">
            Test Supabase Connection
          </Button>
          <Button onClick={testGoogleSignIn} size="sm">
            Test Google Sign In
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            Clear Logs
          </Button>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
          <pre className="text-xs">
            {logs.length === 0 && 'No logs yet. Click buttons above to start debugging.'}
            {logs.map((log, index) => (
              <div key={index} className="mb-2 border-b pb-2">
                <div className="font-semibold text-blue-600">
                  [{log.timestamp}] {log.step}
                </div>
                {log.data && (
                  <div className="text-green-600">
                    Data: {JSON.stringify(log.data, null, 2)}
                  </div>
                )}
                {log.error && (
                  <div className="text-red-600">
                    Error: {JSON.stringify(log.error, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}