
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Image as ImageIcon } from 'lucide-react';

const contentData = [
  { month: 'Jan', generated: 12, enhanced: 8 },
  { month: 'Feb', generated: 19, enhanced: 12 },
  { month: 'Mar', generated: 15, enhanced: 10 },
  { month: 'Apr', generated: 25, enhanced: 18 },
  { month: 'May', generated: 32, enhanced: 22 },
  { month: 'Jun', generated: 28, enhanced: 20 },
];

const creditsData = [
  { day: 'Mon', used: 15 },
  { day: 'Tue', used: 8 },
  { day: 'Wed', used: 22 },
  { day: 'Thu', used: 12 },
  { day: 'Fri', used: 18 },
  { day: 'Sat', used: 25 },
  { day: 'Sun', used: 10 },
];

const chartConfig = {
  generated: {
    label: 'Generated',
    color: 'hsl(var(--primary))',
  },
  enhanced: {
    label: 'Enhanced',
    color: 'hsl(var(--muted-foreground))',
  },
  used: {
    label: 'Credits Used',
    color: 'hsl(var(--primary))',
  },
};

export function AnalyticsChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Generation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ImageIcon className="w-5 h-5" />
            Content Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          coming soon...
        </CardContent>
      </Card>

      {/* Credits Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5" />
            Credits Usage (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          coming soon...
        </CardContent>
      </Card>
    </div>
  );
}
