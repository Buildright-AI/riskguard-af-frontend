'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { DeviationRecord, WorkflowBottleneckData } from '@/app/types/dashboard';
import { TARGETS, getBottleneckColor } from '@/lib/constants/dashboardConfig';

interface WorkflowBottleneckChartProps {
  deviations: DeviationRecord[];
  availableWorkflows: string[];
}

const WorkflowBottleneckChart: React.FC<WorkflowBottleneckChartProps> = ({ deviations, availableWorkflows }) => {
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

      // Use actual resolution days - each workflow type is independent, not a sequential stage
      data.resolutionDays.push(dev.resolutionDays);
      data.totalHandovers += dev.handoverCount;
    });

    const workflows: WorkflowBottleneckData[] = availableWorkflows.map((workflow) => {
      const data = workflowMap.get(workflow)!;
      const count = data.resolutionDays.length;

      // Calculate median
      let medianDays = 0;
      if (count > 0) {
        const sorted = [...data.resolutionDays].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        medianDays = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      }

      // Calculate mean
      const meanDays = count > 0
        ? data.resolutionDays.reduce((sum, days) => sum + days, 0) / count
        : 0;

      return {
        workflow,
        medianResolutionDays: medianDays,
        meanResolutionDays: meanDays,
        avgHandovers: count > 0 ? data.totalHandovers / count : 0,
        stuckReports: 0, // Deprecated - keeping for interface compatibility
        totalReports: count,
      };
    });

    // Sort by median descending and filter out workflows with no reports
    return workflows
      .filter(w => w.totalReports > 0)
      .sort((a, b) => b.medianResolutionDays - a.medianResolutionDays)
      .slice(0, 15); // Top 15 workflows by median resolution time
  }, [deviations, availableWorkflows]);

  const chartConfig = {
    medianResolutionDays: {
      label: 'Median Resolution Days',
    },
    meanResolutionDays: {
      label: 'Mean Resolution Days',
    },
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: WorkflowBottleneckData }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WorkflowBottleneckData;
      return (
        <div className="bg-background border border-secondary rounded-md p-3 shadow-lg max-w-sm">
          <p className="font-heading font-semibold text-primary mb-2">
            {data.workflow}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Median (typical):</span>
              <span className="text-primary font-bold">
                {data.medianResolutionDays.toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Mean (average):</span>
              <span className="text-primary font-medium">
                {data.meanResolutionDays.toFixed(1)} days
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
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Report Count:</span>
              <span className="text-primary font-medium">{data.totalReports}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-secondary/20 text-xs text-secondary">
            <p className="mb-1"><strong>Median:</strong> Middle value, not affected by outliers (typical case)</p>
            <p><strong>Mean:</strong> Average, affected by long delays (if mean {'>'} median = many outliers)</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find workflow with highest median resolution time (actual bottleneck)
  const bottleneckStage = chartData.length > 0
    ? chartData.reduce((max, curr) =>
        curr.medianResolutionDays > max.medianResolutionDays ? curr : max
      )
    : null;

  const totalReports = chartData.reduce((sum, w) => sum + w.totalReports, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Workflow Resolution Time Analysis</CardTitle>
        <CardDescription>
          Median resolution time by workflow type (top 15, color indicates handover severity)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Bar Chart */}
        <div className="w-full lg:w-2/3">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="workflow"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--secondary))"
                />
                <YAxis
                  label={{ value: 'Median Days', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--secondary))"
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="medianResolutionDays"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBottleneckColor(entry.avgHandovers)} />
                  ))}
                  {/* Report count labels */}
                  <LabelList
                    dataKey="totalReports"
                    position="top"
                    formatter={(value: number) => `n=${value}`}
                    style={{ fontSize: 9, fill: 'hsl(var(--secondary))' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Workflow Metrics
          </h4>

          {bottleneckStage && (
            <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
              <span className="text-xs text-secondary">Slowest Workflow</span>
              <span className="text-sm font-medium text-primary">
                {bottleneckStage.workflow}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-error font-heading">
                  {bottleneckStage.medianResolutionDays.toFixed(1)}
                </span>
                <span className="text-sm text-secondary">median days</span>
              </div>
              <span className="text-xs text-secondary mt-1">
                {bottleneckStage.avgHandovers.toFixed(1)} avg handovers • {bottleneckStage.totalReports} reports
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs text-secondary">Total Reports Analyzed</span>
            <span className="text-2xl font-bold text-primary font-heading">
              {totalReports}
            </span>
            <span className="text-xs text-secondary">
              across {chartData.length} workflow types
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowBottleneckChart;
