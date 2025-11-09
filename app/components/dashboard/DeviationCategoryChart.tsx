'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { DeviationRecord, DeviationCategoryData } from '@/app/types/dashboard';
import { DISPLAY_LIMITS, getCategoryColor } from '@/lib/constants/dashboardConfig';

interface DeviationCategoryChartProps {
  deviations: DeviationRecord[];
}

const DeviationCategoryChart: React.FC<DeviationCategoryChartProps> = ({ deviations }) => {
  const { chartData, statsData } = useMemo(() => {
    // Group by category
    const categoryMap = new Map<string, DeviationCategoryData>();

    deviations.forEach((dev) => {
      if (!categoryMap.has(dev.category)) {
        categoryMap.set(dev.category, {
          category: dev.category,
          withEconomicImpact: 0,
          withoutEconomicImpact: 0,
          totalCount: 0,
        });
      }

      const data = categoryMap.get(dev.category)!;
      if (dev.hasEconomicImpact) {
        data.withEconomicImpact += 1;
      } else {
        data.withoutEconomicImpact += 1;
      }
      data.totalCount += 1;
    });

    const categories = Array.from(categoryMap.values())
      .sort((a, b) => b.totalCount - a.totalCount);

    // Prepare data for pie chart
    const pieData = categories.map((cat) => ({
      name: cat.category,
      value: cat.totalCount,
      withEconomicImpact: cat.withEconomicImpact,
      percentage: (cat.totalCount / deviations.length) * 100,
    }));

    return {
      chartData: pieData,
      statsData: categories.slice(0, DISPLAY_LIMITS.topCategories),
    };
  }, [deviations]);

  const chartConfig = {
    count: {
      label: 'Count',
    },
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { name: string; value: number; withEconomicImpact: number; percentage: number } }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-secondary rounded-md p-3 shadow-lg">
          <p className="font-heading font-semibold text-primary mb-2">
            {data.name}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Total:</span>
              <span className="text-primary font-medium">{data.value}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">Percentage:</span>
              <span className="text-primary font-medium">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-secondary">With Cost Impact:</span>
              <span className="text-warning font-medium">{data.withEconomicImpact}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: { percentage: number }) => {
    return `${entry.percentage.toFixed(0)}%`;
  };

  const totalWithEconomicImpact = chartData.reduce(
    (sum, cat) => sum + cat.withEconomicImpact,
    0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Deviation Category Breakdown</CardTitle>
        <CardDescription>
          Distribution of deviation types with economic impact highlighted
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Donut Chart */}
        <div className="w-full lg:w-2/3 flex items-center justify-center">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  innerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getCategoryColor(entry.name)}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Top {DISPLAY_LIMITS.topCategories} Categories
          </h4>
          {statsData.map((cat) => (
            <div
              key={cat.category}
              className="flex flex-col gap-1 pb-3 border-b border-secondary/20 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: getCategoryColor(cat.category),
                  }}
                />
                <span className="text-sm font-medium text-primary truncate">
                  {cat.category}
                </span>
              </div>
              <div className="flex justify-between text-xs ml-5">
                <span className="text-secondary">Total:</span>
                <span className="text-primary font-medium">{cat.totalCount}</span>
              </div>
              <div className="flex justify-between text-xs ml-5">
                <span className="text-secondary">Cost Impact:</span>
                <span className="text-warning font-medium">{cat.withEconomicImpact}</span>
              </div>
              <div className="flex justify-between text-xs ml-5">
                <span className="text-secondary">Percentage:</span>
                <span className="text-primary font-medium">
                  {((cat.totalCount / deviations.length) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}

          <div className="mt-auto pt-3 border-t border-secondary/20">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-secondary">Economic Impact Total</span>
              <span className="text-lg font-bold text-warning font-heading">
                {totalWithEconomicImpact}
              </span>
              <span className="text-xs text-secondary">
                {((totalWithEconomicImpact / deviations.length) * 100).toFixed(1)}% of all deviations
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviationCategoryChart;
