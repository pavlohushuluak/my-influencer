import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleTheme } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Star, Moon, Sun, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface AppHeaderProps {
  showAuthButtons?: boolean;
}

export function AppHeader({ showAuthButtons = true }: AppHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isLoggedIn = sessionStorage.getItem('access_token') !== null;

  const navigationItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setIsSheetOpen(false);
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src='/logo.jpg' alt='logo' className='h-10 rounded-xl' />
        </div>

        {/* Desktop Navigation */}
        {!isMobile && showAuthButtons && (
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </button>
            ))}
          </nav>
        )}

        {/* Desktop Actions */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="w-9 h-9 hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-foreground" />
              )}
            </Button>
            {showAuthButtons && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/signin')}
                  className="px-8 py-3 border-border border-neutral-300 hover:bg-accent dark:border-neutral-600 text-neutral-800 dark:text-neutral-100 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {isLoggedIn ? 'Sign Out' : 'Sign In'}
                </Button>
                <Button
                  className="bg-ai-gradient hover:opacity-90 transition-opacity shadow-lg"
                  onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signup')}
                >
                  {isLoggedIn ? 'Dashboard' : 'Get Started'}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && showAuthButtons && (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="w-9 h-9 hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-foreground" />
              )}
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Menu className="w-5 h-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-ai-gradient rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="bg-ai-gradient bg-clip-text text-transparent">AI Influence</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 mt-8">
                  {/* Navigation */}
                  <nav className="flex flex-col gap-3">
                    {navigationItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-accent text-left"
                      >
                        {item.name}
                      </button>
                    ))}
                  </nav>

                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/signin');
                      setIsSheetOpen(false);
                    }}
                    className="w-full"
                  >
                    {isLoggedIn ? 'Sign Out' : 'Sign In'}
                  </Button>
                  <Button
                    className="w-full bg-ai-gradient hover:opacity-90 transition-opacity"
                    onClick={() => {
                      navigate(isLoggedIn ? '/dashboard' : '/signup');
                      setIsSheetOpen(false);
                    }}
                  >
                    {isLoggedIn ? 'Dashboard' : 'Get Started'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}
