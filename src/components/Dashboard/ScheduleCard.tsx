
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleCardProps {
  className?: string;
}

export function ScheduleCard({ className }: ScheduleCardProps) {

  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Schedule
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        Coming soon...
      </CardContent>
    </Card>
  );
}
