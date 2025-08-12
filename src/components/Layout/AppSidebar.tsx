import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  User,
  Image,
  Plus,
  Calendar,
  Star,
  Shirt,
  MapPin,
  Palette,
  Watch,
  Edit,
  Wand2,
  BookOpen,
  Clock,
  Layers,
  Settings,
  Play,
  ChevronRight,
  Brain,
  Rocket,
  Video,
  Maximize2,
  Users,
  Sparkles,
  FileImage,
  FileVideo,
  FileAudio,
  Palette as PaletteIcon,
  RefreshCw,
  Zap,
  FolderOpen,
  MessageSquare,
  FileText,
  Calendar as CalendarIcon,
  Repeat,
  Heart,
  Cog
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserTaskStatus } from "@/components/UserTaskStatus";

const menuItems = [
  {
    title: "Start",
    icon: Rocket,
    url: "/start",
    isActive: (pathname: string) => pathname === "/start"
  },
  {
    title: "Dashboard",
    icon: Calendar,
    url: "/dashboard",
    isActive: (pathname: string) => pathname === "/dashboard"
  },
  {
    title: "Influencers",
    icon: User,
    items: [
      { title: "New", url: "/influencers/new", icon: Plus, badge: "Wizard" },
      { title: "Profiles", url: "/influencers/profiles", icon: Edit },
      { title: "AI Consistency", url: "/influencers/consistency", icon: Brain },
      { title: "Templates", url: "/influencers/templates", icon: BookOpen },
    ]
  },
  {
    title: "Create",
    icon: Sparkles,
    items: [
      { title: "Images", url: "/create/images", icon: FileImage },
      { title: "Videos", url: "/create/videos", icon: FileVideo },
      { title: "Edit", url: "/create/edit", icon: PaletteIcon },
      { title: "Face Swap", url: "/create/faceswap", icon: RefreshCw, badge: "Future" },
      { title: "Optimizer", url: "/create/optimizer", icon: Zap },
    ]
  },
  {
    title: "Library",
    icon: FolderOpen,
    items: [
      { title: "Images", url: "/library/images", icon: FileImage },
      { title: "Videos", url: "/library/videos", icon: FileVideo },
      { title: "Audios", url: "/library/audios", icon: FileAudio },
    ]
  },
  {
    title: "Social",
    icon: MessageSquare,
    items: [
      { title: "Bio", url: "/social/bio", icon: FileText },
      { title: "Story", url: "/social/story", icon: BookOpen },
      { title: "Schedule", url: "/social/schedule", icon: CalendarIcon },
      { title: "Batch", url: "/social/batch", icon: Repeat },
      { title: "Fanvue", url: "/social/fanvue", icon: Heart, badge: "Primary" },
    ]
  },
  {
    title: "Settings",
    icon: Cog,
    url: "/settings",
    isActive: (pathname: string) => pathname === "/settings"
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  const { firstName, lastName, email } = useSelector((state: RootState) => state.user);
  const fullName = `${firstName} ${lastName}`;
  
  // State to track which menu is currently open
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r border-border/40 bg-gradient-to-b from-background via-background/98 to-background/95 p-0">
      <SidebarHeader
        className="border-b border-border/30 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 cursor-pointer px-0"
        onClick={() => navigate('/')}
      >
        <div className={`${isCollapsed ? "" : "p-4 py-2"} flex items-center justify-center`}>
          <div className="relative">
            {
              isCollapsed ? (
                <div className="flex justify-center bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-200/50 dark:ring-purple-800/30">
                  <img src='/logocol.jpg' alt='logo' className='h-12 rounded-xl' />
                </div>
              ) : (
                <div className="flex justify-center bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-200/50 dark:ring-purple-800/30">
                  <img src='/logo.jpg' alt='logo' className='h-12 rounded-xl' />
                </div>
              )
            }
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-background/50 to-background/80">
        <SidebarGroup className="px-3 py-6 overflow-auto">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-4 px-3">
            {!isCollapsed && "Main Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible 
                      className="group/collapsible" 
                      open={openMenu === item.title}
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenMenu(item.title);
                        } else {
                          setOpenMenu(null);
                        }
                      }}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          className={cn(
                            "w-full hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 transition-all duration-300 rounded-xl py-3 px-3 group",
                          )}
                          tooltip={isCollapsed ? item.title : undefined}
                          onClick={(e) => {
                            if (isCollapsed) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                        >
                          <div className={`${isCollapsed ? "" : "w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 group-hover:scale-105 transition-transform"} flex items-center justify-center`}>
                            <item.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="text-foreground/90 font-medium">{item.title}</span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {
                        isCollapsed ?
                          <div>
                            {item.items.map((subItem) => (
                              <Tooltip key={subItem.title}>
                                <TooltipTrigger asChild>
                                  <div
                                    onClick={() => navigate(subItem.url)}
                                    className={cn(
                                      "hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-blue-50/80 dark:hover:from-purple-950/40 dark:hover:to-blue-950/40 transition-all duration-200 rounded-md py-1 my-1 px-1 cursor-pointer relative",
                                      location.pathname === subItem.url && "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/60 dark:to-blue-900/60 text-purple-700 dark:text-purple-300 font-medium shadow-sm border border-purple-200/50 dark:border-purple-800/30"
                                    )}
                                  >
                                    {subItem.icon && (
                                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/80 dark:bg-gray-800/80 shadow-sm">
                                        <subItem.icon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                      </div>
                                    )}
                                    {subItem.badge && (
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full border border-white dark:border-gray-800"></div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                  {subItem.title}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          :
                          <CollapsibleContent>
                            <SidebarMenuSub className={cn(
                              "ml-6 mt-3 space-y-1 border-l-2 border-gradient-to-b from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 pl-4 cursor-pointer"
                            )}>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    onClick={() => navigate(subItem.url)}
                                    isActive={location.pathname === subItem.url}
                                    className={cn(
                                      "hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-blue-50/80 dark:hover:from-purple-950/40 dark:hover:to-blue-950/40 transition-all duration-200 rounded-md py-2 px-3",
                                      location.pathname === subItem.url && "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/60 dark:to-blue-900/60 text-purple-700 dark:text-purple-300 font-medium shadow-sm border border-purple-200/50 dark:border-purple-800/30"
                                    )}
                                  >
                                    {subItem.icon && (
                                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/80 dark:bg-gray-800/80 shadow-sm">
                                        <subItem.icon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                      </div>
                                    )}
                                    <span className="text-sm">{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                      }
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={item.isActive ? item.isActive(location.pathname) : location.pathname === item.url}
                      className={cn(
                        "hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 transition-all duration-300 rounded-xl py-3 px-3 group",
                        (item.isActive ? item.isActive(location.pathname) : location.pathname === item.url) && "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/60 dark:to-blue-900/60 text-purple-700 dark:text-purple-300 font-medium shadow-lg border border-purple-200/50 dark:border-purple-800/30"
                      )}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <div className={`${isCollapsed ? "" : "w-8 h-8 rounded-lg bg-gradient-to-br"} from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 group-hover:scale-105 transition-transform flex items-center justify-center`}>
                        <item.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      {!isCollapsed && <span className="text-foreground/90 font-medium">{item.title}</span>}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-purple-950/20 dark:to-blue-950/20 p-2 px-4">
        <UserTaskStatus isCollapsed={isCollapsed} />
        <div
          onClick={() => navigate('/account')}
          className={`${isCollapsed ? "flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/40 dark:hover:to-blue-950/40 transition-all duration-300 rounded-lg py-3" : "flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/40 dark:hover:to-blue-950/40 transition-all duration-300 rounded-lg py-3 px-3"}`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-foreground/90">{fullName}</span>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
