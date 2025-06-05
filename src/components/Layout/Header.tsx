import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/store/store';
import { toggleTheme } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Moon, Sun, User, Settings, LogOut, Star } from 'lucide-react';
import { UserLevelBadge } from '@/components/ui/user-level-badge';
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme } = useSelector((state: RootState) => state.ui);
  const { name, email, credits, subscription } = useSelector((state: RootState) => state.user);

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string; isLast?: boolean }> = [
      { label: 'Dashboard', href: '/dashboard' }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom labels for specific routes
      const customLabels: { [key: string]: string } = {
        'create': 'Create New',
        'use': 'Use Influencer',
        'content': 'Content Library',
        'presets': 'Templates',
        'vault': 'Vault',
        'settings': 'Settings',
        'catalog': 'Catalog',
        'clothing': 'Clothing',
        'location': 'Location',
        'poses': 'Poses',
        'accessories': 'Accessories',
        'enhance': 'Enhance',
        'edit': 'Edit',
        'story': 'Story',
        'schedule': 'Schedule',
        'batch': 'Batch'
      };
      
      if (customLabels[segment]) {
        label = customLabels[segment];
      }
      
      breadcrumbs.push({ 
        label, 
        href: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 items-center justify-between px-12">
          {/* Left side - Sidebar Toggle + Logo */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-8 w-8 hover:bg-accent transition-colors" />
          </div>

          {/* Right side - Credits, Theme toggle and User menu */}
          <div className="flex items-center gap-3">
            {/* Credits display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-200/20 dark:border-purple-800/20">
              <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-foreground">{credits} credits</span>
            </div>

            {/* User Level Badge */}
            <UserLevelBadge level={subscription} />

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="w-9 h-9 hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 transition-all" />
              ) : (
                <Moon className="w-4 h-4 transition-all" />
              )}
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-accent cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-accent cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Breadcrumbs bar */}
      <div className="w-full bg-muted/30 border-b border-border/50 px-4 py-2">
        <div className="container mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator className="text-muted-foreground/50" />}
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="text-foreground font-medium">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={crumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </>
  );
}
