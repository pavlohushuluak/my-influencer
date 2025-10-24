import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Image as ImageIcon, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis } from "recharts";

const contentData = [
  { month: "Jan", generated: 12, enhanced: 8 },
  { month: "Feb", generated: 19, enhanced: 12 },
  { month: "Mar", generated: 15, enhanced: 10 },
  { month: "Apr", generated: 25, enhanced: 18 },
  { month: "May", generated: 32, enhanced: 22 },
  { month: "Jun", generated: 28, enhanced: 20 },
];

const gemsData = [
  { day: "Mon", used: 15 },
  { day: "Tue", used: 8 },
  { day: "Wed", used: 22 },
  { day: "Thu", used: 12 },
  { day: "Fri", used: 18 },
  { day: "Sat", used: 25 },
  { day: "Sun", used: 10 },
];

const chartConfig = {
  generated: {
    label: "Generated",
    color: "hsl(var(--primary))",
  },
  enhanced: {
    label: "Enhanced",
    color: "hsl(var(--muted-foreground))",
  },
  used: {
    label: "Gems Used",
    color: "hsl(var(--primary))",
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
          <ChartContainer config={chartConfig}>
            <AreaChart data={contentData}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="generated"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="enhanced"
                stroke="hsl(var(--muted-foreground))"
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gems Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5" />
            Gems Usage (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={gemsData}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="used"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
