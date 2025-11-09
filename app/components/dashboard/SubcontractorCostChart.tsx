'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DeviationRecord, SubcontractorCostData } from '@/app/types/dashboard';
import {
  DISPLAY_LIMITS,
  SEVERITY_SCORE_THRESHOLDS,
  getSeverityScore,
  categorizeSeverityScore,
  formatCurrency,
} from '@/lib/constants/dashboardConfig';

interface SubcontractorCostChartProps {
  deviations: DeviationRecord[];
}

const SubcontractorCostChart: React.FC<SubcontractorCostChartProps> = ({ deviations }) => {
  const chartData = useMemo(() => {
    // Group by company and calculate metrics
    const companyMap = new Map<string, SubcontractorCostData>();

    deviations.forEach((dev) => {
      if (!companyMap.has(dev.company)) {
        companyMap.set(dev.company, {
          company: dev.company,
          totalCost: 0,
          deviationCount: 0,
          avgResolutionDays: 0,
          avgSeverity: 0,
        });
      }

      const data = companyMap.get(dev.company)!;
      data.totalCost += dev.estimatedCost;
      data.deviationCount += 1;
      data.avgResolutionDays += dev.resolutionDays;
      data.avgSeverity += getSeverityScore(dev.severity);
    });

    const companies = Array.from(companyMap.values())
      .map((data) => ({
        ...data,
        avgResolutionDays: data.avgResolutionDays / data.deviationCount,
        avgSeverity: data.avgSeverity / data.deviationCount,
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, DISPLAY_LIMITS.topCompanies);

    return companies;
  }, [deviations]);

  const chartConfig = {
    totalCost: {
      label: 'Total Cost',
      color: 'hsl(var(--accent))',
    },
  };

  const getBarColor = (avgSeverity: number) => {
    if (avgSeverity >= SEVERITY_SCORE_THRESHOLDS.critical) return 'hsl(var(--error))';
    if (avgSeverity >= SEVERITY_SCORE_THRESHOLDS.high) return 'hsl(var(--warning))';
    if (avgSeverity >= SEVERITY_SCORE_THRESHOLDS.medium) return 'hsl(var(--highlight))';
    return 'hsl(var(--accent))';
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: SubcontractorCostData }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as SubcontractorCostData;
      return (
        <div className="bg-background border border-secondary rounded-md p-3 shadow-lg">
          <p className="font-heading font-semibold text-primary mb-2">
            {data.company}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Total Cost:</span>
              <span className="text-primary font-medium">
                {data.totalCost.toLocaleString()} NOK
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Deviations:</span>
              <span className="text-primary font-medium">{data.deviationCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Avg Resolution:</span>
              <span className="text-primary font-medium">
                {data.avgResolutionDays.toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Avg Severity:</span>
              <span className="text-primary font-medium">
                {categorizeSeverityScore(data.avgSeverity)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const topCompanies = chartData.slice(0, 3);
  const totalCostAll = chartData.reduce((sum, c) => sum + c.totalCost, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <div className="w-full flex items-start justify-between">
            <p>Subcontractor Cost Impact</p>
            <div className="text-sm font-normal text-secondary">
              Top {DISPLAY_LIMITS.topCompanies} by Total Cost
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Companies ranked by estimated deviation costs (color indicates avg severity)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Chart */}
        <div className="w-full lg:w-2/3">
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={formatCurrency}
                  stroke="hsl(var(--secondary))"
                />
                <YAxis
                  type="category"
                  dataKey="company"
                  width={150}
                  stroke="hsl(var(--secondary))"
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalCost"
                  radius={[0, 4, 4, 0]}
                  fill="hsl(var(--accent))"
                >
                  {chartData.map((entry, index) => (
                    <rect
                      key={`cell-${index}`}
                      fill={getBarColor(entry.avgSeverity)}
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
            Top 3 Cost Drivers
          </h4>
          {topCompanies.map((company, idx) => (
            <div
              key={company.company}
              className="flex flex-col gap-1 pb-3 border-b border-secondary/20 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs text-accent font-bold">#{idx + 1}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    company.avgSeverity >= SEVERITY_SCORE_THRESHOLDS.critical
                      ? 'bg-error/20 text-error'
                      : company.avgSeverity >= SEVERITY_SCORE_THRESHOLDS.high
                      ? 'bg-warning/20 text-warning'
                      : 'bg-highlight/20 text-highlight'
                  }`}
                >
                  {categorizeSeverityScore(company.avgSeverity)}
                </span>
              </div>
              <p className="text-sm font-medium text-primary truncate">
                {company.company}
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Cost:</span>
                <span className="text-primary font-medium">
                  {formatCurrency(company.totalCost)} NOK
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Count:</span>
                <span className="text-primary font-medium">{company.deviationCount}</span>
              </div>
            </div>
          ))}

          <div className="mt-auto pt-3 border-t border-secondary/20">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-secondary">Total (All Companies)</span>
              <span className="text-lg font-bold text-primary font-heading">
                {formatCurrency(totalCostAll)} NOK
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubcontractorCostChart;
