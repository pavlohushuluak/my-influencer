import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Clock, CheckCircle, AlertCircle, Play, Loader2, ChevronUp, ChevronDown, Eye, Calendar, FileText, Hash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import config from '@/config/config';

interface TaskStatusData {
  user_uuid: string;
  tasks_state_0: number;
  tasks_state_1: number;
  tasks_state_2: number;
  tasks_state_99: number;
}

interface TaskDetail {
  id: number;
  uuid: string;
  type: string;
  state: number;
  jsonjob: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  priority: number;
  retry_count: number;
  progress: number;
}

interface TaskStatusProps {
  className?: string;
  isCollapsed?: boolean;
}

export function UserTaskStatus({ className, isCollapsed = false }: TaskStatusProps) {
  const [taskStatus, setTaskStatus] = useState<TaskStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<number | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalTasksInModal, setTotalTasksInModal] = useState(0);
  const [cancelingTasks, setCancelingTasks] = useState<Set<number>>(new Set());
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [taskToCancel, setTaskToCancel] = useState<{ id: number; type: string } | null>(null);
  const modalStateRef = useRef(false);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchTaskStatus = async (isInitialLoad = false) => {
      if (!user.id) return;
      
      try {
        // Only show loading state on initial load, not during background refresh when modal is open
        if (isInitialLoad) {
          setIsLoading(true);
        }
        
        const response = await fetch(`${config.supabase_server_url}/user_task_status_counts?user_uuid=eq.${user.id}`, {
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
        if (isInitialLoad) {
          setIsLoading(false);
        }
      }
    };

    // Initial load with loading state
    fetchTaskStatus(true);
    
    // Background refresh every 30 seconds without affecting loading state
    const interval = setInterval(() => {
      // Don't refresh task details if modal is currently open to avoid disrupting user experience
      if (!modalStateRef.current) {
        fetchTaskStatus(false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  // Pagination helper functions
  const totalPages = Math.ceil(totalTasksInModal / pageSize);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && selectedTaskStatus !== null) {
      setCurrentPage(newPage);
      fetchTaskDetails(selectedTaskStatus, newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    if (selectedTaskStatus !== null) {
      fetchTaskDetails(selectedTaskStatus, 1, size);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleCancelClick = (taskId: number, taskType: string) => {
    setTaskToCancel({ id: taskId, type: taskType });
    setShowCancelDialog(true);
  };

  const confirmCancelTask = async () => {
    if (!taskToCancel || !user.id) return;
    
    const taskId = taskToCancel.id;
    setShowCancelDialog(false);
    
    try {
      setCancelingTasks(prev => new Set(prev).add(taskId));
      console.log(taskId);
      
      const response = await fetch(`${config.backend_url}/canceltask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          id: taskId
        })
      });

      if (response.ok) {
        toast.success('Task cancelled successfully');
        // Refresh the current page data
        if (selectedTaskStatus !== null) {
          await fetchTaskDetails(selectedTaskStatus, currentPage, pageSize);
        }
      } else {
        console.error('Failed to cancel task');
        toast.error('Failed to cancel task');
      }
    } catch (error) {
      console.error('Error canceling task:', error);
      toast.error('Failed to cancel task');
    } finally {
      setCancelingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      setTaskToCancel(null);
    }
  };

  const fetchTaskDetails = async (status: number, page: number = 1, size: number = 12) => {
    if (!user.id) return;
    
    setIsLoadingTasks(true);
    setSelectedTaskStatus(status);
    setShowTaskModal(true);
    modalStateRef.current = true;
    
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * size;
      
      // Fetch tasks with pagination
      const response = await fetch(
        `${config.supabase_server_url}/tasks?uuid=eq.${user.id}&state=eq.${status}&order=created_at.desc&limit=${size}&offset=${offset}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        }
      );

      // Fetch total count
      const countResponse = await fetch(
        `${config.supabase_server_url}/tasks?uuid=eq.${user.id}&state=eq.${status}&select=count`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTaskDetails(data || []);
        
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setTotalTasksInModal(countData[0]?.count || 0);
        } else {
          setTotalTasksInModal(data?.length || 0);
        }
      } else {
        console.error('Failed to fetch task details');
        setTaskDetails([]);
        setTotalTasksInModal(0);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      setTaskDetails([]);
      setTotalTasksInModal(0);
    } finally {
      setIsLoadingTasks(false);
    }
  };

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
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-bold', statusInfo.color)}>
                          {count}
                        </span>
                        {count > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPage(1);
                              fetchTaskDetails(state, 1, pageSize);
                            }}
                            className="h-6 w-6 p-0 hover:bg-white/50 dark:hover:bg-black/20"
                          >
                            <Eye className={cn('w-3 h-3', statusInfo.color)} />
                          </Button>
                        )}
                      </div>
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

      {/* Task Details Modal */}
      <Dialog open={showTaskModal} onOpenChange={(open) => {
        setShowTaskModal(open);
        modalStateRef.current = open;
        if (!open) {
          // Reset pagination and states when modal closes
          setCurrentPage(1);
          setTotalTasksInModal(0);
          setTaskDetails([]);
          setCancelingTasks(new Set());
          setShowCancelDialog(false);
          setTaskToCancel(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTaskStatus !== null && (
                <>
                  {(() => {
                    const statusInfo = getStatusInfo(selectedTaskStatus, 0);
                    const IconComponent = statusInfo.icon;
                    return (
                      <>
                        <IconComponent className={cn('w-5 h-5', statusInfo.color)} />
                        <span>
                          {statusInfo.text} Tasks ({taskDetails.length})
                        </span>
                      </>
                    );
                  })()}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
                    <div className="flex flex-col h-[60vh]">
            {/* Pagination Controls - Top */}
            {!isLoadingTasks && taskDetails.length > 0 && (
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalTasksInModal)} to {Math.min(currentPage * pageSize, totalTasksInModal)} of {totalTasksInModal} tasks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Content Area */}
            <ScrollArea className="flex-1 px-4">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading tasks...</span>
                </div>
              ) : taskDetails.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No tasks found for this status</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {taskDetails.map((task) => (
                    <Card key={String(task.id)} className="hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            {String(task.id).slice(-8)}
                          </CardTitle>
                          <Badge 
                            variant={task.state === 2 ? 'default' : 
                                   task.state === 1 ? 'secondary' : 
                                   task.state === 99 ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {task.state === 0 ? 'Scheduled' : 
                             task.state === 1 ? 'Processing' : 
                             task.state === 2 ? 'Completed' : 
                             task.state === 99 ? 'Failed' : 'Unknown'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {/* Task Type */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{task.type}</span>
                          </div>
                          
                          {/* Cancel Button for Scheduled (0) and Processing (1) tasks */}
                          {(task.state === 0 || task.state === 1) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelClick(task.id, task.type);
                                    }}
                                    disabled={cancelingTasks.has(task.id)}
                                    className="h-9 px-3 gap-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    {cancelingTasks.has(task.id) ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Cancelling...</span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-4 h-4" />
                                        <span>Cancel</span>
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cancel this {task.state === 0 ? 'scheduled' : 'running'} task</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        {/* Created Time */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Created: {new Date(task.created_at).toLocaleDateString()} {new Date(task.created_at).toLocaleTimeString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Pagination Controls - Bottom */}
            {!isLoadingTasks && taskDetails.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center p-4 border-t border-border/50">
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>

                  {/* Previous Page */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  ))}

                  {/* Next Page */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Last Page */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Cancel Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the "{taskToCancel?.type}" task? This action cannot be undone and may interrupt ongoing processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">
              Keep Task
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelTask}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Yes, Cancel Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 