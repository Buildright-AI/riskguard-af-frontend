'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { DeviationRecord } from '@/app/types/dashboard';
import { TARGETS, getBottleneckColor } from '@/lib/constants/dashboardConfig';

interface WorkflowImpactBubbleChartProps {
  deviations: DeviationRecord[];
  availableWorkflows: string[];
}

interface BubbleDataPoint {
  workflow: string;
  medianDays: number;
  reportCount: number;
  totalDelayDays: number; // reportCount × medianDays
  avgHandovers: number;
}

const WorkflowImpactBubbleChart: React.FC<WorkflowImpactBubbleChartProps> = ({ deviations, availableWorkflows }) => {
  const chartData = useMemo(() => {
    const workflowMap = new Map<string, {
      resolutionDays: number[];
      totalHandovers: number;
    }>();

    // Initialize all workflows
    availableWorkflows.forEach((workflow) => {
      workflowMap.set(workflow, {
        resolutionDays: [],
        totalHandovers: 0,
      });
    });

    deviations.forEach((dev) => {
      if (!workflowMap.has(dev.workflow)) return;

      const data = workflowMap.get(dev.workflow)!;
      data.resolutionDays.push(dev.resolutionDays);
      data.totalHandovers += dev.handoverCount;
    });

    const bubbles: BubbleDataPoint[] = availableWorkflows.map((workflow) => {
      const data = workflowMap.get(workflow)!;
      const count = data.resolutionDays.length;

      if (count === 0) {
        return null;
      }

      // Calculate median
      const sorted = [...data.resolutionDays].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const medianDays = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

      const totalDelayDays = medianDays * count;
      const avgHandovers = data.totalHandovers / count;

      return {
        workflow,
        medianDays,
        reportCount: count,
        totalDelayDays,
        avgHandovers,
      };
    }).filter((d): d is BubbleDataPoint => d !== null);

    // Sort by total impact (total delay days) and take top 20
    return bubbles
      .sort((a, b) => b.totalDelayDays - a.totalDelayDays)
      .slice(0, 20);
  }, [deviations, availableWorkflows]);

  const chartConfig = {
    totalDelayDays: {
      label: 'Total Impact (Delay Days)',
    },
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: BubbleDataPoint }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as BubbleDataPoint;
      return (
        <div className="bg-background border border-secondary rounded-md p-3 shadow-lg">
          <p className="font-heading font-semibold text-primary mb-2">
            {data.workflow}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Median Days:</span>
              <span className="text-primary font-medium">
                {data.medianDays.toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Report Count:</span>
              <span className="text-primary font-medium">{data.reportCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Total Impact:</span>
              <span className="text-primary font-bold">
                {data.totalDelayDays.toFixed(0)} delay-days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Avg Handovers:</span>
              <span className={`font-medium ${
                data.avgHandovers > TARGETS.criticalHandoverThreshold ? 'text-error' :
                data.avgHandovers > TARGETS.moderateHandoverThreshold ? 'text-warning' : 'text-accent'
              }`}>
                {data.avgHandovers.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const topImpact = chartData[0];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Workflow Impact Analysis</CardTitle>
        <CardDescription>
          Total impact = Report volume × Median days. Bubble size shows total delay-days. Focus on top-right quadrant (high volume + high delay).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Bubble Chart */}
        <div className="w-full lg:w-2/3">
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="medianDays"
                  name="Median Days"
                  label={{ value: 'Median Resolution Days', position: 'bottom', offset: 40 }}
                  stroke="hsl(var(--secondary))"
                />
                <YAxis
                  type="number"
                  dataKey="reportCount"
                  name="Report Count"
                  label={{ value: 'Report Volume', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--secondary))"
                />
                <ZAxis
                  type="number"
                  dataKey="totalDelayDays"
                  range={[100, 2000]}
                  name="Total Impact"
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Scatter data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBottleneckColor(entry.avgHandovers)}
                      fillOpacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Impact Metrics
          </h4>

          {topImpact && (
            <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
              <span className="text-xs text-secondary">Highest Total Impact</span>
              <span className="text-sm font-medium text-primary">
                {topImpact.workflow}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-error font-heading">
                  {topImpact.totalDelayDays.toFixed(0)}
                </span>
                <span className="text-sm text-secondary">delay-days</span>
              </div>
              <span className="text-xs text-secondary mt-1">
                {topImpact.reportCount} reports × {topImpact.medianDays.toFixed(1)} days
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs text-secondary">Quadrant Guide</span>
            <div className="flex flex-col gap-2 text-xs mt-2">
              <div>
                <span className="font-medium text-error">Top-Right:</span>
                <span className="text-secondary ml-1">High volume + High delay = URGENT</span>
              </div>
              <div>
                <span className="font-medium text-warning">Top-Left:</span>
                <span className="text-secondary ml-1">High volume + Low delay = Monitor</span>
              </div>
              <div>
                <span className="font-medium text-primary">Bottom-Right:</span>
                <span className="text-secondary ml-1">Low volume + High delay = Case-by-case</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowImpactBubbleChart;
