import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Clock, CheckCircle, AlertCircle, Play, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface TaskStatusData {
  user_uuid: string;
  tasks_state_0: number;
  tasks_state_1: number;
  tasks_state_2: number;
  tasks_state_99: number;
}

interface TaskStatusProps {
  className?: string;
  isCollapsed?: boolean;
}

export function UserTaskStatus({ className, isCollapsed = false }: TaskStatusProps) {
  const [taskStatus, setTaskStatus] = useState<TaskStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchTaskStatus = async () => {
      if (!user.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`https://db.nymia.ai/rest/v1/user_task_status_counts?user_uuid=eq.${user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setTaskStatus(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching task status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTaskStatus, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  const getStatusInfo = (state: number, count: number) => {
    switch (state) {
      case 0:
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          text: 'Scheduled',
          description: 'Tasks waiting to be processed'
        };
      case 1:
        return {
          icon: Play,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          text: 'Processing',
          description: 'AI optimized and queued for rendering'
        };
      case 2:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          text: 'Completed',
          description: 'Tasks successfully completed'
        };
      case 99:
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          text: 'Error',
          description: 'Tasks with errors or cancelled'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800',
          text: 'Unknown',
          description: 'Unknown status'
        };
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-3', className)}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!taskStatus) {
    return null;
  }

  const totalTasks = taskStatus.tasks_state_0 + taskStatus.tasks_state_1 + taskStatus.tasks_state_2 + taskStatus.tasks_state_99;
  
  // Show all statuses even if count is 0, but don't show anything if no task data
  const statuses = [
    { state: 0, count: taskStatus.tasks_state_0 },
    { state: 1, count: taskStatus.tasks_state_1 },
    { state: 2, count: taskStatus.tasks_state_2 },
    { state: 99, count: taskStatus.tasks_state_99 }
  ];

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex flex-col items-center gap-1 p-2', className)}>
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                {totalTasks > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalTasks}
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Task Status</p>
              {statuses.map(({ state, count }) => {
                const statusInfo = getStatusInfo(state, count);
                const IconComponent = statusInfo.icon;
                return (
                  <div key={state} className="flex items-center gap-2">
                    <IconComponent className={cn('w-3 h-3', statusInfo.color)} />
                    <span className="text-xs">{statusInfo.text}: {count}</span>
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('space-y-3 p-3 border-t border-border/30', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Task Status
        </span>
        <div className="flex items-center gap-2">
          {totalTasks > 0 && (
            <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {totalTasks}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            ) : (
              <ChevronUp className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            )}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {statuses.map(({ state, count }) => {
            const statusInfo = getStatusInfo(state, count);
            const IconComponent = statusInfo.icon;
            
            return (
              <TooltipProvider key={state}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      'flex items-center justify-between p-2 rounded-lg border transition-all duration-200 hover:shadow-sm',
                      statusInfo.bgColor,
                      statusInfo.borderColor,
                      count === 0 && 'opacity-60'
                    )}>
                      <div className="flex items-center gap-2">
                        <IconComponent className={cn('w-3 h-3', statusInfo.color)} />
                        <span className="text-xs font-medium text-foreground/80">
                          {statusInfo.text}
                        </span>
                      </div>
                      <span className={cn('text-xs font-bold', statusInfo.color)}>
                        {count}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{statusInfo.text}</p>
                      <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
                      <p className="text-xs font-medium">Count: {count}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}
    </div>
  );
} 