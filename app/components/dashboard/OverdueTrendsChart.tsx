'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DeviationRecord, OverdueTrendsData } from '@/app/types/dashboard';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { DISPLAY_LIMITS } from '@/lib/constants/dashboardConfig';

interface OverdueTrendsChartProps {
  deviations: DeviationRecord[];
}

const OverdueTrendsChart: React.FC<OverdueTrendsChartProps> = ({ deviations }) => {
  const chartData = useMemo(() => {
    const weeks: Date[] = [];
    for (let i = DISPLAY_LIMITS.weeksToDisplay - 1; i >= 0; i--) {
      weeks.push(startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 }));
    }

    // Track cumulative overdue count
    let cumulativeOverdue = 0;

    const weeklyData: OverdueTrendsData[] = weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Count new overdue reports in this week
      // (reports that became overdue during this week)
      const newOverdueThisWeek = deviations.filter((d) => {
        if (d.overdueDays === 0) return false;

        // Estimate when it became overdue
        const becameOverdueDate = new Date(d.date);
        becameOverdueDate.setDate(becameOverdueDate.getDate() + d.resolutionDays + d.overdueDays);

        return becameOverdueDate >= weekStart && becameOverdueDate < weekEnd;
      }).length;

      cumulativeOverdue += newOverdueThisWeek;

      return {
        week: format(weekStart, 'MMM dd'),
        newOverdue: newOverdueThisWeek,
        totalOverdue: cumulativeOverdue,
      };
    });

    return weeklyData;
  }, [deviations]);

  const chartConfig = {
    newOverdue: {
      label: 'New Overdue',
      color: 'hsl(var(--error))',
    },
    totalOverdue: {
      label: 'Total Overdue',
      color: 'hsl(var(--warning))',
    },
  };

  const currentOverdue = chartData[chartData.length - 1]?.totalOverdue || 0;
  const previousWeekOverdue = chartData[chartData.length - 2]?.totalOverdue || 0;
  const weeklyChange = currentOverdue - previousWeekOverdue;

  const peakWeek = chartData.reduce((max, curr) =>
    curr.newOverdue > max.newOverdue ? curr : max
  , chartData[0]);

  const totalNewOverdue = chartData.reduce((sum, week) => sum + week.newOverdue, 0);
  const avgPerWeek = totalNewOverdue / chartData.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <div className="w-full flex items-start justify-between">
            <p>Overdue Trends Timeline</p>
            <div className="text-sm font-normal text-secondary">
              Last {DISPLAY_LIMITS.weeksToDisplay} weeks
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          New overdue reports per week (bars) vs cumulative total (line)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Combo Chart */}
        <div className="w-full lg:w-2/3">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorNewOverdue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--error))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--error))" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--secondary))"
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--secondary))"
                  label={{ value: 'New Overdue', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--secondary))"
                  label={{ value: 'Total Overdue', angle: 90, position: 'insideRight', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />

                <Bar
                  yAxisId="left"
                  dataKey="newOverdue"
                  fill="url(#colorNewOverdue)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalOverdue"
                  stroke="hsl(var(--warning))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--warning))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Overdue Summary
          </h4>

          <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
            <span className="text-xs text-secondary">Current Total Overdue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-error font-heading">
                {currentOverdue}
              </span>
              {weeklyChange !== 0 && (
                <span className={`text-sm ${weeklyChange > 0 ? 'text-error' : 'text-accent'}`}>
                  {weeklyChange > 0 ? '+' : ''}{weeklyChange} this week
                </span>
              )}
            </div>
          </div>

          {peakWeek && (
            <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
              <span className="text-xs text-secondary">Peak Week</span>
              <span className="text-sm font-medium text-primary">{peakWeek.week}</span>
              <span className="text-lg font-bold text-warning font-heading">
                {peakWeek.newOverdue}
                <span className="text-sm text-secondary ml-1">new overdue</span>
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
            <span className="text-xs text-secondary">Average per Week</span>
            <span className="text-lg font-bold text-primary font-heading">
              {avgPerWeek.toFixed(1)}
              <span className="text-sm text-secondary ml-1">reports</span>
            </span>
          </div>

          <div className="mt-auto pt-3 border-t border-secondary/20">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-secondary">Total Period</span>
              <span className="text-lg font-bold text-primary font-heading">
                {totalNewOverdue}
              </span>
              <span className="text-xs text-secondary">
                New overdue reports in {DISPLAY_LIMITS.weeksToDisplay} weeks
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverdueTrendsChart;
