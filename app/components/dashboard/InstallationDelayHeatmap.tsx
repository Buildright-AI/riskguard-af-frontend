'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviationRecord } from '@/app/types/dashboard';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { DISPLAY_LIMITS, DELAY_THRESHOLDS } from '@/lib/constants/dashboardConfig';

interface InstallationDelayHeatmapProps {
  deviations: DeviationRecord[];
}

const InstallationDelayHeatmap: React.FC<InstallationDelayHeatmapProps> = ({ deviations }) => {
  const { heatmapData, installationTypes, weeks, maxDelay } = useMemo(() => {
    const weeksList: Date[] = [];
    for (let i = DISPLAY_LIMITS.heatmapWeeks - 1; i >= 0; i--) {
      weeksList.push(startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 }));
    }

    // Get unique installation types
    const typesSet = new Set(deviations.map((d) => d.installationType));
    const typesList = Array.from(typesSet).sort();

    // Create heatmap data structure
    const data = new Map<string, Map<string, { totalDelay: number; count: number }>>();

    typesList.forEach((type) => {
      data.set(type, new Map());
      weeksList.forEach((week) => {
        data.get(type)!.set(format(week, 'MMM dd'), { totalDelay: 0, count: 0 });
      });
    });

    // Populate data
    let maxDelayValue = 0;
    deviations.forEach((dev) => {
      const weekStart = startOfWeek(dev.date, { weekStartsOn: 1 });
      const weekLabel = format(weekStart, 'MMM dd');

      if (data.has(dev.installationType) && data.get(dev.installationType)!.has(weekLabel)) {
        const cell = data.get(dev.installationType)!.get(weekLabel)!;
        cell.totalDelay += dev.resolutionDays;
        cell.count += 1;

        const avgDelay = cell.totalDelay / cell.count;
        if (avgDelay > maxDelayValue) {
          maxDelayValue = avgDelay;
        }
      }
    });

    return {
      heatmapData: data,
      installationTypes: typesList,
      weeks: weeksList.map((w) => format(w, 'MMM dd')),
      maxDelay: maxDelayValue,
    };
  }, [deviations]);

  const getColorIntensity = (avgDelay: number) => {
    if (avgDelay === 0) return 'bg-background_alt';

    const normalized = Math.min(avgDelay / maxDelay, 1);

    if (normalized >= 0.8) return 'bg-error';
    if (normalized >= 0.6) return 'bg-error/70';
    if (normalized >= 0.4) return 'bg-warning';
    if (normalized >= 0.2) return 'bg-warning/50';
    return 'bg-accent/30';
  };

  const getTextColor = (avgDelay: number) => {
    if (avgDelay === 0) return 'text-secondary/50';

    const normalized = Math.min(avgDelay / maxDelay, 1);
    if (normalized >= 0.6) return 'text-background';
    return 'text-primary';
  };

  // Calculate top delayed installation types
  const topDelayed = useMemo(() => {
    const typeDelays = new Map<string, { totalDelay: number; count: number }>();

    installationTypes.forEach((type) => {
      typeDelays.set(type, { totalDelay: 0, count: 0 });
    });

    deviations.forEach((dev) => {
      if (typeDelays.has(dev.installationType)) {
        const data = typeDelays.get(dev.installationType)!;
        data.totalDelay += dev.resolutionDays;
        data.count += 1;
      }
    });

    return Array.from(typeDelays.entries())
      .map(([type, data]) => ({
        type,
        avgDelay: data.count > 0 ? data.totalDelay / data.count : 0,
        count: data.count,
      }))
      .sort((a, b) => b.avgDelay - a.avgDelay)
      .slice(0, DISPLAY_LIMITS.topDelayedTypes);
  }, [deviations, installationTypes]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Installation Type Delay Heatmap</CardTitle>
        <CardDescription>
          Average resolution days by installation type and week (color intensity indicates delay severity)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex lg:flex-row flex-col gap-4">
        {/* Heatmap */}
        <div className="w-full lg:w-3/4 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header Row */}
            <div className="flex mb-2">
              <div className="w-48 flex-shrink-0" />
              {weeks.map((week) => (
                <div
                  key={week}
                  className="flex-1 text-center text-xs font-medium text-secondary px-1"
                >
                  {week}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            {installationTypes.map((type) => (
              <div key={type} className="flex mb-1 group">
                <div className="w-48 flex-shrink-0 pr-2 text-sm text-primary truncate font-medium flex items-center">
                  {type}
                </div>
                {weeks.map((week) => {
                  const cell = heatmapData.get(type)?.get(week);
                  const avgDelay = cell && cell.count > 0 ? cell.totalDelay / cell.count : 0;
                  const count = cell?.count || 0;

                  return (
                    <div
                      key={`${type}-${week}`}
                      className={`flex-1 mx-0.5 rounded flex items-center justify-center cursor-pointer transition-all hover:ring-2 hover:ring-highlight ${getColorIntensity(avgDelay)}`}
                      style={{ minHeight: '40px' }}
                      title={`${type}\n${week}\nAvg Delay: ${avgDelay.toFixed(1)} days\nReports: ${count}`}
                    >
                      <span className={`text-xs font-bold ${getTextColor(avgDelay)}`}>
                        {avgDelay > 0 ? avgDelay.toFixed(0) : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-secondary">
              <span>Delay Scale:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-accent/30 rounded" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-warning/50 rounded" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-warning rounded" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-error/70 rounded" />
                <span>Very High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-error rounded" />
                <span>Critical</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-1/4 flex flex-col gap-3 border border-secondary/20 rounded-md p-4">
          <h4 className="font-heading font-semibold text-sm text-primary mb-2">
            Top {DISPLAY_LIMITS.topDelayedTypes} Delayed Types
          </h4>
          {topDelayed.map((item, idx) => (
            <div
              key={item.type}
              className="flex flex-col gap-1 pb-3 border-b border-secondary/20 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs text-accent font-bold">#{idx + 1}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    item.avgDelay > DELAY_THRESHOLDS.critical
                      ? 'bg-error/20 text-error'
                      : item.avgDelay > DELAY_THRESHOLDS.high
                      ? 'bg-warning/20 text-warning'
                      : 'bg-accent/20 text-accent'
                  }`}
                >
                  {item.avgDelay.toFixed(1)} days
                </span>
              </div>
              <p className="text-xs font-medium text-primary truncate" title={item.type}>
                {item.type}
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Reports:</span>
                <span className="text-primary font-medium">{item.count}</span>
              </div>
            </div>
          ))}

          <div className="mt-auto pt-3 border-t border-secondary/20">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-secondary">Max Delay</span>
              <span className="text-lg font-bold text-error font-heading">
                {maxDelay.toFixed(1)}
                <span className="text-sm text-secondary ml-1">days</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallationDelayHeatmap;
