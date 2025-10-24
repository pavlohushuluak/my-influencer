import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { auth } from '@/lib/supabase';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '' });
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { email: '' };
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    
    if (newErrors.email) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await auth.resetPassword(email);
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error(error.message || 'Failed to send reset email');
      } else {
        setIsEmailSent(true);
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Check your email</h3>
          <p className="text-muted-foreground">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-foreground">Reset your password</h3>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="reset-email"
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

        <Button 
          type="submit" 
          className="w-full bg-ai-gradient hover:bg-ai-gradient-dark text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send reset email'}
        </Button>
      </form>

      <Button 
        variant="outline" 
        onClick={onBack}
        className="w-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sign in
      </Button>
    </div>
  );
}