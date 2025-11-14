'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { DeviationRecord, ResolutionTimeData } from '@/app/types/dashboard';
import { DISPLAY_LIMITS, getDynamicColor } from '@/lib/constants/dashboardConfig';

interface ResolutionTimeChartProps {
  deviations: DeviationRecord[];
}

const ResolutionTimeChart: React.FC<ResolutionTimeChartProps> = ({ deviations }) => {
  const chartData = useMemo(() => {
    // Group by installation type
    const installationTypeMap = new Map<
      string,
      {
        resolutionDays: number[];
        workflows: Map<string, number>;
      }
    >();

    // Only include resolved/closed deviations
    const resolvedDeviations = deviations.filter(
      (d) => d.status === 'Resolved' || d.status === 'Closed'
    );

    resolvedDeviations.forEach((dev) => {
      if (!installationTypeMap.has(dev.installationType)) {
        installationTypeMap.set(dev.installationType, {
          resolutionDays: [],
          workflows: new Map(),
        });
      }

      const data = installationTypeMap.get(dev.installationType)!;
      data.resolutionDays.push(dev.resolutionDays);

      const workflowCount = data.workflows.get(dev.workflow) || 0;
      data.workflows.set(dev.workflow, workflowCount + 1);
    });

    // Calculate metrics for each installation type
    const installationTypes: ResolutionTimeData[] = Array.from(installationTypeMap.entries())
      .map(([installationType, data]) => {
        const sorted = [...data.resolutionDays].sort((a, b) => a - b);
        const avgDays = sorted.reduce((sum, d) => sum + d, 0) / sorted.length;
        const minDays = sorted[0];
        const maxDays = sorted[sorted.length - 1];
        const medianDays = sorted[Math.floor(sorted.length / 2)];

        // Find primary workflow (most common)
        let primaryWorkflow: string = 'Unknown';
        let maxCount = 0;
        data.workflows.forEach((count, workflow) => {
          if (count > maxCount) {
            maxCount = count;
            primaryWorkflow = workflow;
          }
        });

        return {
          category: installationType, // Using 'category' field for consistency with interface
          avgDays,
          minDays,
          maxDays,
          medianDays,
          count: sorted.length,
          primaryWorkflowStage: primaryWorkflow,
        };
      })
      .sort((a, b) => b.avgDays - a.avgDays)
      .slice(0, DISPLAY_LIMITS.topResolutionCategories);

    return installationTypes;
  }, [deviations]);

  const chartConfig = {
    avgDays: {
      label: 'Avg Resolution Days',
    },
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ResolutionTimeData }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ResolutionTimeData;
      return (
        <div className="bg-background border border-secondary rounded-md p-3 shadow-lg">
          <p className="font-heading font-semibold text-primary mb-2">
            {data.category}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Average:</span>
              <span className="text-primary font-medium">
                {data.avgDays.toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Median:</span>
              <span className="text-primary font-medium">
                {data.medianDays.toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Range:</span>
              <span className="text-primary font-medium">
                {data.minDays} - {data.maxDays} days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Count:</span>
              <span className="text-primary font-medium">{data.count}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Primary Stage:</span>
              <span className="text-primary font-medium text-xs">
                {data.primaryWorkflowStage}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const longestCategory = chartData[0];
  const avgOverall = chartData.reduce((sum, cat) => sum + cat.avgDays, 0) / chartData.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resolution Time by Installation Type</CardTitle>
        <CardDescription>
          Average days to close by installation type (color-coded by type)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Bar Chart */}
        <div className="w-full lg:w-2/3">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                  stroke="hsl(var(--secondary))"
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={120}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--secondary))"
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="avgDays"
                  radius={[0, 4, 4, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getDynamicColor(index)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Key Insights
          </h4>

          {longestCategory && (
            <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
              <span className="text-xs text-secondary">Longest Resolution</span>
              <span className="text-sm font-medium text-primary">
                {longestCategory.category}
              </span>
              <span className="text-2xl font-bold text-error font-heading">
                {longestCategory.avgDays.toFixed(1)}
                <span className="text-sm text-secondary ml-1">days avg</span>
              </span>
              <span className="text-xs text-secondary mt-1">
                Primary stage: {longestCategory.primaryWorkflowStage}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs text-secondary">Overall Average</span>
            <span className="text-2xl font-bold text-primary font-heading">
              {avgOverall.toFixed(1)}
              <span className="text-sm text-secondary ml-1">days</span>
            </span>
            <span className="text-xs text-secondary mt-2">
              Across all installation types
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResolutionTimeChart;
