
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/Auth/AuthLayout';
import { SignInForm } from '@/components/Auth/SignInForm';
import { SignUpForm } from '@/components/Auth/SignUpForm';

export default function Auth() {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    setIsSignUp(location.pathname === '/signup');
  }, [location.pathname]);

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <AuthLayout
      title={isSignUp ? 'Create your account' : 'Welcome back'}
      subtitle={isSignUp ? 'Start creating AI influencers today' : 'Sign in to your account'}
    >
      {isSignUp ? (
        <SignUpForm onToggleMode={toggleMode} />
      ) : (
        <SignInForm onToggleMode={toggleMode} />
      )}
    </AuthLayout>
  );
}
