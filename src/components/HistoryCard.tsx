import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Calendar } from 'lucide-react';

export default function HistoryCard({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [imagesByTask, setImagesByTask] = useState<{ [taskId: string]: any[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [jumpPage, setJumpPage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`https://db.nymia.ai/rest/v1/tasks?uuid=eq.${userId}&type=eq.generate_image&order=id.desc`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      }
    })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => setError('Failed to fetch history.'))
      .finally(() => setIsLoading(false));
  }, [userId, refreshKey]);

  useEffect(() => {
    if (!tasks.length) return;
    setIsImagesLoading(true);
    const start = pageSize === -1 ? 0 : (page - 1) * pageSize;
    const end = pageSize === -1 ? tasks.length : start + pageSize;
    const pageTasks = tasks.slice(start, end);
    Promise.all(
      pageTasks.map(task =>
        imagesByTask[task.id]
          ? Promise.resolve()
          : fetch(`https://db.nymia.ai/rest/v1/generated_images?task_id=eq.${task.id}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              }
            })
              .then(res => res.json())
              .then(imgs => setImagesByTask(prev => ({ ...prev, [task.id]: imgs })))
              .catch(() => {})
      )
    ).finally(() => setIsImagesLoading(false));
    // eslint-disable-next-line
  }, [tasks, page, pageSize]);

  const start = pageSize === -1 ? 0 : (page - 1) * pageSize;
  const end = pageSize === -1 ? tasks.length : start + pageSize;
  const pageTasks = tasks.slice(start, end);
  const pageCount = pageSize === -1 ? 1 : Math.ceil(tasks.length / pageSize);

  const handleRefresh = () => {
    setImagesByTask({});
    setRefreshKey(k => k + 1);
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpPage, 10);
    if (!isNaN(num) && num >= 1 && num <= pageCount) setPage(num);
    setJumpPage('');
  };

  return (
    <div className="mt-12 mb-8 w-full max-w-6xl mx-auto bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl shadow-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">Generation History</h3>
          <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh history">
            <RefreshCw className="w-5 h-5 text-blue-400" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <label className="text-sm text-slate-300 mr-2">Show per page:</label>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded-md px-2 py-1 bg-slate-800 text-white border border-slate-700 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={-1}>ALL</option>
          </select>
          {pageCount > 1 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <span className="text-slate-300">Page {page} / {pageCount}</span>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</Button>
              <form onSubmit={handleJump} className="inline-flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={jumpPage}
                  onChange={e => setJumpPage(e.target.value)}
                  className="w-14 rounded-md px-2 py-1 bg-slate-800 text-white border border-slate-700 focus:outline-none"
                  placeholder="Go to"
                  aria-label="Jump to page"
                />
                <Button type="submit" size="sm" variant="outline" className="px-2 py-1">Go</Button>
              </form>
            </>
          )}
        </div>
      </div>
      {error && <div className="text-center py-8 text-red-400">{error}</div>}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-2" />
          <div className="text-slate-400">Loading history...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-slate-400 text-lg mb-2">No generation history found.</div>
          <div className="text-slate-500 text-sm">Your generated images will appear here.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {pageTasks.map(task => (
            (imagesByTask[task.id] || []).map(image => (
              <Card
                key={image.id}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/50 backdrop-blur-sm bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-blue-950/10 dark:hover:to-purple-950/10 cursor-pointer"
              >
                <CardContent className="p-4">
                  {/* Image */}
                  <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                    <img
                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/${image.file_path}`}
                      alt={image.system_filename}
                      className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  {/* Filename and Date */}
                  <div className="space-y-2 mb-2">
                    <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                      {image.system_filename}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(image.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {/* Prompt and Task ID */}
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      <span className="font-semibold">Prompt:</span> {image.prompt || <em>None</em>}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Task ID:</span> {task.id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ))}
        </div>
      )}
    </div>
  );
} 