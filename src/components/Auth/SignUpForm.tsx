import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star, Users, Zap } from 'lucide-react';

interface SignUpFormProps {
  onToggleMode: () => void;
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            Coming Soon
          </span>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Influencer Platform
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          The future of influencer marketing is here. Create, train, and manage AI-powered influencers with unprecedented ease.
        </p>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4 p-6 rounded-lg border border-border bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Launch Date: Coming Soon</span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Be among the first to experience the future of influencer marketing. 
          Sign up for early access and exclusive updates.
        </p>

        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          disabled
        >
          Join Waitlist (Coming Soon)
        </Button>
      </div>

      {/* Sign In Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          variant="link"
          className="p-0 h-auto text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          onClick={onToggleMode}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
