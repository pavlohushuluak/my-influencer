
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/Layout/AppHeader';
import { AppFooter } from '@/components/Layout/AppFooter';
import { useEffect } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme } = useSelector((state: RootState) => state.ui);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-muted", theme)}>
      <AppHeader showAuthButtons={false} />
      
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6">

          {/* Auth Card */}
          <Card className="border-border bg-card">
            <CardHeader className="space-y-1 text-center">
              <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
