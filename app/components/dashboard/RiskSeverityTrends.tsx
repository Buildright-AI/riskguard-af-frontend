'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line } from 'recharts';
import { DeviationRecord, RiskSeverityTrendData } from '@/app/types/dashboard';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { DISPLAY_LIMITS, SEVERITY_COLORS, SEVERITY_LEVELS } from '@/lib/constants/dashboardConfig';

interface RiskSeverityTrendsProps {
  deviations: DeviationRecord[];
}

const RiskSeverityTrends: React.FC<RiskSeverityTrendsProps> = ({ deviations }) => {
  const chartData = useMemo(() => {
    const weeks: Date[] = [];
    for (let i = DISPLAY_LIMITS.weeksToDisplay - 1; i >= 0; i--) {
      weeks.push(startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 }));
    }

    // Group deviations by week and severity
    const weeklyData: RiskSeverityTrendData[] = weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekDeviations = deviations.filter(
        (d) => d.date >= weekStart && d.date < weekEnd
      );

      const low = weekDeviations.filter((d) => d.severity === SEVERITY_LEVELS[0]).length;
      const medium = weekDeviations.filter((d) => d.severity === SEVERITY_LEVELS[1]).length;
      const high = weekDeviations.filter((d) => d.severity === SEVERITY_LEVELS[2]).length;
      const critical = weekDeviations.filter((d) => d.severity === SEVERITY_LEVELS[3]).length;
      const economicImpact = weekDeviations.filter((d) => d.hasEconomicImpact).length;

      return {
        week: format(weekStart, 'MMM dd'),
        low,
        medium,
        high,
        critical,
        economicImpact,
      };
    });

    return weeklyData;
  }, [deviations]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};

    SEVERITY_LEVELS.forEach((severity) => {
      const key = severity.toLowerCase();
      config[key] = {
        label: severity,
        color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS],
      };
    });

    config.economicImpact = {
      label: 'Economic Impact',
      color: 'hsl(var(--highlight))',
    };

    return config;
  }, []);

  const totalCritical = chartData.reduce((sum, week) => sum + week.critical, 0);
  const totalHigh = chartData.reduce((sum, week) => sum + week.high, 0);
  const totalEconomicImpact = chartData.reduce((sum, week) => sum + week.economicImpact, 0);

  const latestWeek = chartData[chartData.length - 1];
  const previousWeek = chartData[chartData.length - 2];

  const criticalTrend = latestWeek && previousWeek
    ? latestWeek.critical - previousWeek.critical
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Risk Severity Trends</CardTitle>
        <CardDescription>
          Weekly deviation counts by severity level (last {DISPLAY_LIMITS.weeksToDisplay} weeks)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Area Chart */}
        <div className="w-full lg:w-2/3">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--highlight))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--highlight))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--error))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--error))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--secondary))"
                />
                <YAxis stroke="hsl(var(--secondary))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />

                <Area
                  type="monotone"
                  dataKey="low"
                  stackId="1"
                  stroke="hsl(var(--accent))"
                  fill="url(#colorLow)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="medium"
                  stackId="1"
                  stroke="hsl(var(--highlight))"
                  fill="url(#colorMedium)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stackId="1"
                  stroke="hsl(var(--warning))"
                  fill="url(#colorHigh)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stackId="1"
                  stroke="hsl(var(--error))"
                  fill="url(#colorCritical)"
                  fillOpacity={0.6}
                />

                {/* Economic impact overlay line */}
                <Line
                  type="monotone"
                  dataKey="economicImpact"
                  stroke={chartConfig.economicImpact.color}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Summary ({DISPLAY_LIMITS.weeksToDisplay} weeks)
          </h4>

          <div className="flex flex-col gap-2 pb-3 border-b border-secondary/20">
            <span className="text-xs text-secondary">Critical Deviations</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-error font-heading">
                {totalCritical}
              </span>
              {criticalTrend !== 0 && (
                <span
                  className={`text-xs ${
                    criticalTrend > 0 ? 'text-error' : 'text-accent'
                  }`}
                >
                  {criticalTrend > 0 ? '+' : ''}{criticalTrend} this week
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-3 border-b border-secondary/20">
            <span className="text-xs text-secondary">High Severity</span>
            <span className="text-2xl font-bold text-warning font-heading">
              {totalHigh}
            </span>
          </div>

          <div className="flex flex-col gap-2 pb-3 border-b border-secondary/20">
            <span className="text-xs text-secondary">Economic Impact</span>
            <span className="text-2xl font-bold text-primary font-heading">
              {totalEconomicImpact}
            </span>
            <span className="text-xs text-secondary">
              {((totalEconomicImpact / deviations.length) * 100).toFixed(1)}% of total
            </span>
          </div>

          {latestWeek && (
            <div className="mt-auto pt-3 border-t border-secondary/20">
              <span className="text-xs text-secondary mb-2 block">This Week</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-secondary">Low:</span>
                  <span className="ml-1 text-accent font-medium">{latestWeek.low}</span>
                </div>
                <div>
                  <span className="text-secondary">Medium:</span>
                  <span className="ml-1 text-highlight font-medium">{latestWeek.medium}</span>
                </div>
                <div>
                  <span className="text-secondary">High:</span>
                  <span className="ml-1 text-warning font-medium">{latestWeek.high}</span>
                </div>
                <div>
                  <span className="text-secondary">Critical:</span>
                  <span className="ml-1 text-error font-medium">{latestWeek.critical}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskSeverityTrends;
