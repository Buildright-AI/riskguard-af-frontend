'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { DeviationRecord, WorkflowBottleneckData } from '@/app/types/dashboard';
import { MdWarning } from 'react-icons/md';
import { TARGETS, WORKFLOW_CALCULATION, getBottleneckColor } from '@/lib/constants/dashboardConfig';

interface WorkflowBottleneckChartProps {
  deviations: DeviationRecord[];
  availableWorkflows: string[];
}

const WorkflowBottleneckChart: React.FC<WorkflowBottleneckChartProps> = ({ deviations, availableWorkflows }) => {
  const chartData = useMemo(() => {
    const workflowMap = new Map<string, {
      totalDays: number;
      totalHandovers: number;
      count: number;
      stuckCount: number;
    }>();

    // Initialize all workflows
    availableWorkflows.forEach((workflow) => {
      workflowMap.set(workflow, {
        totalDays: 0,
        totalHandovers: 0,
        count: 0,
        stuckCount: 0,
      });
    });

    deviations.forEach((dev) => {
      if (!workflowMap.has(dev.workflow)) return;

      const data = workflowMap.get(dev.workflow)!;

      // Estimate days in this stage (resolution days divided by number of workflow stages)
      // Note: Simplified calculation since per-stage timing isn't available in current data
      const daysInStage = dev.resolutionDays / WORKFLOW_CALCULATION.estimatedStagesCount;

      data.totalDays += daysInStage;
      data.totalHandovers += dev.handoverCount;
      data.count += 1;

      if (dev.resolutionDays > TARGETS.stuckThresholdDays && (dev.status === 'Open' || dev.status === 'In Progress')) {
        data.stuckCount += 1;
      }
    });

    const workflows: WorkflowBottleneckData[] = availableWorkflows.map((workflow) => {
      const data = workflowMap.get(workflow)!;
      return {
        workflow,
        avgDaysInStage: data.count > 0 ? data.totalDays / data.count : 0,
        avgHandovers: data.count > 0 ? data.totalHandovers / data.count : 0,
        stuckReports: data.stuckCount,
        totalReports: data.count,
      };
    });

    return workflows;
  }, [deviations, availableWorkflows]);

  const chartConfig = {
    avgDaysInStage: {
      label: 'Avg Days in Stage',
    },
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: WorkflowBottleneckData }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WorkflowBottleneckData;
      return (
        <div className="bg-background border border-secondary rounded-md p-3 shadow-lg">
          <p className="font-heading font-semibold text-primary mb-2">
            {data.workflow}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Avg Days:</span>
              <span className="text-primary font-medium">
                {data.avgDaysInStage.toFixed(1)} days
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
              <span className="text-secondary">Stuck Reports:</span>
              <span className="text-error font-medium">{data.stuckReports}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Total Reports:</span>
              <span className="text-primary font-medium">{data.totalReports}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const bottleneckStage = chartData.reduce((max, curr) =>
    curr.avgHandovers > max.avgHandovers ? curr : max
  , chartData[0]);

  const totalStuck = chartData.reduce((sum, w) => sum + w.stuckReports, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <div className="w-full flex items-start justify-between">
            <p>Workflow Bottleneck Analysis</p>
            {totalStuck > 0 && (
              <div className="flex items-center gap-1 text-sm text-error">
                <MdWarning />
                <span>{totalStuck} stuck</span>
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Average time per stage with handover counts (color indicates bottleneck severity)
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
                  label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--secondary))"
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="avgDaysInStage"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBottleneckColor(entry.avgHandovers)} />
                  ))}
                  <LabelList
                    dataKey="avgHandovers"
                    position="top"
                    formatter={(value: number) => `${value.toFixed(1)} h/o`}
                    style={{ fontSize: 10, fill: 'hsl(var(--secondary))' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Bottleneck Metrics
          </h4>

          {bottleneckStage && (
            <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
              <span className="text-xs text-secondary">Biggest Bottleneck</span>
              <span className="text-sm font-medium text-primary">
                {bottleneckStage.workflow}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-error font-heading">
                  {bottleneckStage.avgHandovers.toFixed(1)}
                </span>
                <span className="text-sm text-secondary">avg handovers</span>
              </div>
              <span className="text-xs text-secondary mt-1">
                {bottleneckStage.avgDaysInStage.toFixed(1)} days average in stage
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1 pb-3 border-b border-secondary/20">
            <span className="text-xs text-secondary">Total Stuck Reports</span>
            <span className="text-2xl font-bold text-error font-heading">
              {totalStuck}
            </span>
            <span className="text-xs text-secondary">
              {">"}{TARGETS.stuckThresholdDays} days, not closed
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-secondary mb-1">Color Legend</span>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-accent" />
              <span className="text-secondary">{"<"}={TARGETS.moderateHandoverThreshold} handovers (Good)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-warning" />
              <span className="text-secondary">{TARGETS.moderateHandoverThreshold + 1}-{TARGETS.criticalHandoverThreshold} handovers (Moderate)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-error" />
              <span className="text-secondary">{">"}{TARGETS.criticalHandoverThreshold} handovers (Critical)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowBottleneckChart;
