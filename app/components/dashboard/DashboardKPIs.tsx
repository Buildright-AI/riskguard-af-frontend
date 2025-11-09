'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviationRecord } from '@/app/types/dashboard';
import { MdTrendingUp, MdTrendingDown, MdRemove } from 'react-icons/md';
import { TARGETS } from '@/lib/constants/dashboardConfig';

interface DashboardKPIsProps {
  deviations: DeviationRecord[];
  className?: string;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ deviations, className = '' }) => {
  const kpiData = useMemo(() => {
    const total = deviations.length;

    // Calculate trend: compare last 30 days vs previous 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30Days = deviations.filter((d) => d.date >= thirtyDaysAgo).length;
    const previous30Days = deviations.filter(
      (d) => d.date >= sixtyDaysAgo && d.date < thirtyDaysAgo
    ).length;

    const trend = previous30Days > 0
      ? ((last30Days - previous30Days) / previous30Days) * 100
      : 0;

    // Active cost drivers (economic impact)
    const activeCostDrivers = deviations.filter(
      (d) => d.hasEconomicImpact && (d.status === 'Open' || d.status === 'In Progress')
    ).length;

    // Average resolution time
    const resolvedDeviations = deviations.filter(
      (d) => d.status === 'Resolved' || d.status === 'Closed'
    );
    const avgResolutionTime = resolvedDeviations.length > 0
      ? resolvedDeviations.reduce((sum, d) => sum + d.resolutionDays, 0) / resolvedDeviations.length
      : 0;

    const resolutionComparison = avgResolutionTime - TARGETS.resolutionDays;

    // Current overdue
    const overdueDeviations = deviations.filter((d) => d.overdueDays > 0);
    const currentOverdue = overdueDeviations.length;
    const oldestOverdue = overdueDeviations.length > 0
      ? Math.max(...overdueDeviations.map((d) => d.overdueDays))
      : 0;

    return {
      total,
      trend,
      activeCostDrivers,
      avgResolutionTime,
      resolutionComparison,
      currentOverdue,
      oldestOverdue,
    };
  }, [deviations]);

  const getTrendIcon = (trend: number) => {
    if (trend > TARGETS.significantTrendPercent) return <MdTrendingUp className="text-error" />;
    if (trend < -TARGETS.significantTrendPercent) return <MdTrendingDown className="text-accent" />;
    return <MdRemove className="text-secondary" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > TARGETS.significantTrendPercent) return 'text-error';
    if (trend < -TARGETS.significantTrendPercent) return 'text-accent';
    return 'text-secondary';
  };

  return (
    <div className={`w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Deviations */}
      <Card className="hover:border-accent/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-secondary">
            Total Deviations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-primary font-heading">
              {kpiData.total.toLocaleString()}
            </p>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(kpiData.trend)}`}>
              {getTrendIcon(kpiData.trend)}
              <span className="font-medium">
                {Math.abs(kpiData.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-1">
            Last 30 days vs previous period
          </p>
        </CardContent>
      </Card>

      {/* Active Cost Drivers */}
      <Card className="hover:border-warning/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-secondary">
            Active Cost Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-warning font-heading">
              {kpiData.activeCostDrivers}
            </p>
            <div className="flex flex-col items-end text-xs text-secondary">
              <span>Economic</span>
              <span>Impact</span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-1">
            Open or in progress with cost impact
          </p>
        </CardContent>
      </Card>

      {/* Avg Resolution Time */}
      <Card className="hover:border-highlight/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-secondary">
            Avg Resolution Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-primary font-heading">
              {kpiData.avgResolutionTime.toFixed(1)}
              <span className="text-base text-secondary ml-1">days</span>
            </p>
            <div
              className={`flex items-center gap-1 text-sm ${
                kpiData.resolutionComparison > 0 ? 'text-error' : 'text-accent'
              }`}
            >
              {kpiData.resolutionComparison > 0 ? (
                <MdTrendingUp />
              ) : (
                <MdTrendingDown />
              )}
              <span className="font-medium">
                {Math.abs(kpiData.resolutionComparison).toFixed(1)}
              </span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-1">
            Target: {TARGETS.resolutionDays} days
          </p>
        </CardContent>
      </Card>

      {/* Current Overdue */}
      <Card className="hover:border-error/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-secondary">
            Current Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-error font-heading">
              {kpiData.currentOverdue}
            </p>
            <div className="flex flex-col items-end text-xs text-secondary">
              <span>Oldest:</span>
              <span className="text-error font-medium">
                {kpiData.oldestOverdue} days
              </span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-1">
            Past deadline, require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardKPIs;
