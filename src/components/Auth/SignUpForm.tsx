import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';

interface SignUpFormProps {
  onToggleMode: () => void;
}

function isStrongPassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(password);
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!isStrongPassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions.');
      // alert('Please accept the terms and conditions.');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Sign up:', formData);
    }, 1000);
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
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
              className="pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
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
            <p className="text-sm text-red-500">{errors.password}</p>
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
              className="pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
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
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
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
          disabled={isLoading}
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