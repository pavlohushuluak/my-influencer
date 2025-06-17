import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { validatePassword, getStrengthColor, getStrengthProgress } from '@/utils/passwordValidation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SignUpFormProps {
  onToggleMode: () => void;
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  });

  const passwordValidation = validatePassword(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showPasswordErrors = touched.password && formData.password.length > 0;
  const showConfirmPasswordError = touched.confirmPassword && formData.confirmPassword.length > 0 && !passwordsMatch;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    if (!passwordsMatch) {
      setTouched(prev => ({ ...prev, confirmPassword: true }));
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.nymia.ai/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            nickname: formData.nickname,
            level: 0
          }
        })
      });

      const data = await response.json();
      // console.log('Registration response:', data);

      if (response.ok) {
        // Save tokens to session storage
        sessionStorage.setItem('access_token', data.body.access_token);
        sessionStorage.setItem('refresh_token', data.body.refresh_token);

        console.log('User ID:', data.body.user.id);

        const responseData = await fetch('https://db.nymia.ai/rest/v1/user', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            nickname: formData.nickname,
            level: 0,
            uuid: data.body.user.id,
            credits: 10
          })
        });

        if (responseData.ok) {
          console.log('User created successfully');
          const userData = await responseData.json();
          console.log('User data:', userData);
        } else {
          console.error('Error creating user');
        }

        toast.success('Account created successfully');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched(prev => ({ ...prev, confirmPassword: true }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-foreground">Nickname</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="nickname"
              type="text"
              placeholder="Enter nickname"
              value={formData.nickname}
              onChange={(e) => updateFormData('nickname', e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              onBlur={handlePasswordBlur}
              className={cn(
                "pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground",
                showPasswordErrors && !passwordValidation.isValid && "border-red-500"
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

          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Password strength:</span>
                <span className={cn("text-xs font-medium capitalize", getStrengthColor(passwordValidation.strength))}>
                  {passwordValidation.strength}
                </span>
              </div>
              <Progress
                value={getStrengthProgress(passwordValidation.strength)}
                className="h-2"
              />
            </div>
          )}

          {showPasswordErrors && passwordValidation.errors.length > 0 && (
            <div className="space-y-1">
              {passwordValidation.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              onBlur={handleConfirmPasswordBlur}
              className={cn(
                "pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground",
                showConfirmPasswordError && "border-red-500",
                touched.confirmPassword && passwordsMatch && formData.confirmPassword.length > 0 && "border-green-500"
              )}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {/* Confirm Password Validation */}
          {touched.confirmPassword && formData.confirmPassword.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              {passwordsMatch ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">Passwords match</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm text-foreground">
            I agree to the{' '}
            <a href="#" className="text-ai-purple-500 hover:text-ai-purple-600 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-ai-purple-500 hover:text-ai-purple-600 underline">
              Privacy Policy
            </a>
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-ai-gradient hover:bg-ai-gradient-dark text-white"
          disabled={isLoading || !passwordValidation.isValid || !passwordsMatch || !acceptTerms}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
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
        onClick={handleGoogleSignUp}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          variant="link"
          className="p-0 h-auto text-ai-purple-500 hover:text-ai-purple-600"
          onClick={onToggleMode}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
