'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MdTrendingUp, MdTrendingDown, MdRemove } from 'react-icons/md';
import { TARGETS } from '@/lib/constants/dashboardConfig';
import { DashboardKPIsPayload } from '@/app/types/payloads';

interface DashboardKPIsProps {
  kpiData: DashboardKPIsPayload['data'];
  className?: string;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ kpiData, className = '' }) => {
  // Early return with empty state if no data
  if (!kpiData) {
    return (
      <div className={`w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="opacity-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary font-heading">--</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Extract KPI values from API response
  const {
    total,
    trend,
    activeCostDrivers,
    avgResolutionTime,
    overdueCount,
  } = kpiData;

  // Calculate derived values for UI
  const resolutionComparison = avgResolutionTime - TARGETS.resolutionDays;

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
              {total.toLocaleString()}
            </p>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span className="font-medium">
                {Math.abs(trend).toFixed(1)}%
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
              {activeCostDrivers}
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
              {avgResolutionTime.toFixed(1)}
              <span className="text-base text-secondary ml-1">days</span>
            </p>
            <div
              className={`flex items-center gap-1 text-sm ${
                resolutionComparison > 0 ? 'text-error' : 'text-accent'
              }`}
            >
              {resolutionComparison > 0 ? (
                <MdTrendingUp />
              ) : (
                <MdTrendingDown />
              )}
              <span className="font-medium">
                {Math.abs(resolutionComparison).toFixed(1)}
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
              {overdueCount}
            </p>
            <div className="flex flex-col items-end text-xs text-secondary">
              <span className="text-secondary">
                {/* TODO: Backend doesn't return oldestOverdue yet */}
                Open items
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
