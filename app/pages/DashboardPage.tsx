'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardFilters from '@/app/components/dashboard/DashboardFilters';
import DashboardKPIs from '@/app/components/dashboard/DashboardKPIs';
import SubcontractorCostChart from '@/app/components/dashboard/SubcontractorCostChart';
import DeviationCategoryChart from '@/app/components/dashboard/DeviationCategoryChart';
import RiskSeverityTrends from '@/app/components/dashboard/RiskSeverityTrends';
import ResolutionTimeChart from '@/app/components/dashboard/ResolutionTimeChart';
import WorkflowBottleneckChart from '@/app/components/dashboard/WorkflowBottleneckChart';
import OverdueTrendsChart from '@/app/components/dashboard/OverdueTrendsChart';
import InstallationDelayHeatmap from '@/app/components/dashboard/InstallationDelayHeatmap';
import { DashboardFilters as DashboardFiltersType, DeviationRecord } from '@/app/types/dashboard';
import { getMockDeviations, filterDeviations } from '@/lib/mockData/dashboardData'; // TODO: Replace with API client
import { getDateRangeInDays, SIMULATED_API_DELAY_MS } from '@/lib/constants/dashboardConfig';

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allDeviations, setAllDeviations] = useState<DeviationRecord[]>([]);
  const [filters, setFilters] = useState<DashboardFiltersType>({
    dateRange: '30d',
    projects: [],
    severities: [],
  });

  // Simulate data loading on mount
  // TODO: Replace with real API call when backend is ready
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // TODO: Remove simulated delay when connecting to real API
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));
      // TODO: Replace getMockDeviations() with: await fetchDashboardData()
      const deviations = getMockDeviations();
      setAllDeviations(deviations);
      setLoading(false);
    };

    loadData();
  }, []);

  // Apply filters to get filtered dataset
  const filteredDeviations = useMemo(() => {
    const now = new Date();
    let dateRange: { start: Date; end: Date } | undefined;

    if (filters.dateRange === 'custom' && filters.customStartDate && filters.customEndDate) {
      dateRange = {
        start: filters.customStartDate,
        end: filters.customEndDate,
      };
    } else if (filters.dateRange !== 'custom') {
      const days = getDateRangeInDays(filters.dateRange);
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      dateRange = { start: startDate, end: now };
    }

    return filterDeviations(allDeviations, {
      dateRange,
      projects: filters.projects.length > 0 ? filters.projects : undefined,
      severities: filters.severities.length > 0 ? filters.severities : undefined,
    });
  }, [allDeviations, filters]);

  const handleFilterChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="flex flex-col gap-4 pb-8">
        {/* Page Header */}
        <div className="w-full flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary text-sm">
            Analytics and insights for cost drivers and delay factors across all projects
          </p>
        </div>

        {/* Global Filters */}
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          disabled={loading}
        />

        {/* KPI Cards */}
        {loading ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))}
          </div>
        ) : (
          <DashboardKPIs deviations={filteredDeviations} className="fade-in" />
        )}

        {/* Cost Drivers Section */}
      <div className="w-full flex flex-col gap-4 mt-4">
        <div className="w-full flex items-center gap-3">
          <h2 className="font-heading text-2xl font-semibold text-primary">Cost Drivers</h2>
          <div className="flex-1 h-px bg-secondary/20" />
        </div>

        {loading ? (
          <>
            <Skeleton className="h-[400px] w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col gap-4 fade-in">
            {/* Subcontractor Cost Chart - Full Width */}
            <SubcontractorCostChart deviations={filteredDeviations} />

            {/* Deviation Category & Risk Severity - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DeviationCategoryChart deviations={filteredDeviations} />
              <RiskSeverityTrends deviations={filteredDeviations} />
            </div>
          </div>
        )}
      </div>

      {/* Delay Drivers Section */}
      <div className="w-full flex flex-col gap-4 mt-6">
        <div className="w-full flex items-center gap-3">
          <h2 className="font-heading text-2xl font-semibold text-primary">Delay Drivers</h2>
          <div className="flex-1 h-px bg-secondary/20" />
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[450px] w-full" />
          </>
        ) : (
          <div className="w-full flex flex-col gap-4 fade-in">
            {/* Resolution Time & Workflow Bottleneck - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ResolutionTimeChart deviations={filteredDeviations} />
              <WorkflowBottleneckChart deviations={filteredDeviations} />
            </div>

            {/* Overdue Trends - Full Width */}
            <OverdueTrendsChart deviations={filteredDeviations} />

            {/* Installation Delay Heatmap - Full Width */}
            <InstallationDelayHeatmap deviations={filteredDeviations} />
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default DashboardPage;
