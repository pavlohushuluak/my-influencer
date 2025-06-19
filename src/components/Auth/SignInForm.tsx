import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/userSlice';

interface SignInFormProps {
  onToggleMode: () => void;
}

export function SignInForm({ onToggleMode }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { email: '', password: '' };
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    
    if (newErrors.email || newErrors.password) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://api.nymia.ai/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();
      // console.log('Login response:', data);

      if (response.ok) {
        // Save tokens to session storage
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('refresh_token', data.refresh_token);
        const userResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${data.user.id}`, {
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

        toast.success('Sign in successful');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              className={cn(
                "pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground",
                errors.email && "border-red-500"
              )}
              required
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              className={cn(
                "pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground",
                errors.password && "border-red-500"
              )}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="text-ai-purple-500 hover:text-ai-purple-600 underline">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-ai-gradient hover:bg-ai-gradient-dark text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-border bg-background text-foreground hover:bg-muted"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Button 
          variant="link" 
          className="p-0 h-auto text-ai-purple-500 hover:text-ai-purple-600"
          onClick={onToggleMode}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}
