'use client';

import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardFilters from '@/app/components/dashboard/DashboardFilters';
import DashboardKPIs from '@/app/components/dashboard/DashboardKPIs';
import SubcontractorCostChart from '@/app/components/dashboard/SubcontractorCostChart';
import DeviationCategoryChart from '@/app/components/dashboard/DeviationCategoryChart';
import ResolutionTimeChart from '@/app/components/dashboard/ResolutionTimeChart';
import WorkflowBottleneckChart from '@/app/components/dashboard/WorkflowBottleneckChart';
import WorkflowImpactBubbleChart from '@/app/components/dashboard/WorkflowImpactBubbleChart';
import OverdueTrendsChart from '@/app/components/dashboard/OverdueTrendsChart';
import InstallationDelayHeatmap from '@/app/components/dashboard/InstallationDelayHeatmap';
import { DashboardFilters as DashboardFiltersType, DeviationRecord } from '@/app/types/dashboard';
import { getDateRangeInDays } from '@/lib/constants/dashboardConfig';
import { getDashboardKPIs } from '@/app/api/getDashboardKPIs';
import { getDashboardDeviations } from '@/app/api/getDashboardDeviations';
import { getDashboardMetadata } from '@/app/api/getDashboardMetadata';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { DashboardKPIsPayload, DashboardMetadataPayload } from '@/app/types/payloads';
import { SessionContext } from '@/app/components/contexts/SessionContext';
import { format } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { getAuthToken } = useAuthenticatedFetch();
  const { initialized } = useContext(SessionContext);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<DashboardKPIsPayload['data']>(null);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [allDeviations, setAllDeviations] = useState<DeviationRecord[]>([]);
  const [metadata, setMetadata] = useState<DashboardMetadataPayload['data']>(null);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFiltersType>({
    dateRange: '30d',
    projects: [],
  });

  // Create stable filter keys for dependency tracking
  const dateRangeKey = filters.dateRange;
  const projectsKey = useMemo(() => JSON.stringify(filters.projects), [filters.projects]);
  const customDatesKey = useMemo(
    () => JSON.stringify([filters.customStartDate, filters.customEndDate]),
    [filters.customStartDate, filters.customEndDate]
  );

  // Check for cache invalidation URL parameter
  useEffect(() => {
    // Wait for user to be initialized before attempting cache invalidation
    if (!initialized) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const shouldInvalidateCache = searchParams.get('cache') === 'invalidate';

    if (shouldInvalidateCache) {
      const invalidateCache = async () => {
        try {
          const token = await getAuthToken();

          // Call cache invalidation endpoint
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/cache/invalidate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
        } catch {
          // Silent fail - cache invalidation is best-effort
        } finally {
          // Remove cache parameter from URL without page reload
          searchParams.delete('cache');
          const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
          window.history.replaceState({}, '', newUrl);
        }
      };

      invalidateCache();
    }
  }, [initialized, getAuthToken]);

  // Load metadata on mount (projects, workflows, categories, etc.)
  useEffect(() => {
    // Wait for user to be initialized before loading metadata
    if (!initialized) {
      return;
    }

    const loadMetadata = async () => {
      try {
        const token = await getAuthToken();
        const response = await getDashboardMetadata(token || undefined);

        if (response.data) {
          setMetadata(response.data);
        }
      } catch {
        // Error is silent - metadata will remain null and filters will be disabled
      } finally {
        setMetadataLoading(false);
      }
    };

    loadMetadata();
  }, [initialized, getAuthToken]);

  // Load dashboard data on mount and when filters change
  useEffect(() => {
    // Wait for user to be initialized before loading dashboard data
    if (!initialized) {
      return;
    }

    // AbortController to cancel previous requests
    const abortController = new AbortController();
    let isActive = true;

    const loadData = async () => {
      setLoading(true);
      setKpiError(null);

      try {
        const token = await getAuthToken();

        // Build API options based on date range type
        let apiOptions;
        if (filters.dateRange === 'custom' && filters.customStartDate && filters.customEndDate) {
          // Custom date range mode
          apiOptions = {
            start_date: format(filters.customStartDate, 'yyyy-MM-dd'),
            end_date: format(filters.customEndDate, 'yyyy-MM-dd'),
            projects: filters.projects.length > 0 ? filters.projects : undefined,
          };
        } else {
          // Preset range mode
          const days = getDateRangeInDays(filters.dateRange);
          apiOptions = {
            days,
            projects: filters.projects.length > 0 ? filters.projects : undefined,
          };
        }

        // Fetch KPI data from API
        const kpiResponse = await getDashboardKPIs(apiOptions, token || undefined);

        // Check if request was cancelled
        if (!isActive || abortController.signal.aborted) {
          return;
        }

        if (kpiResponse.error) {
          setKpiError(kpiResponse.error);
        } else {
          setKpiData(kpiResponse.data);
        }

        // Fetch deviation records for charts
        const deviationsResponse = await getDashboardDeviations(apiOptions, token || undefined);

        // Check if request was cancelled
        if (!isActive || abortController.signal.aborted) {
          return;
        }

        if (deviationsResponse.error) {
          // Keep empty array on error to prevent chart crashes
          setAllDeviations([]);
        } else if (deviationsResponse.data) {
          // Parse ISO date strings to Date objects for chart compatibility
          const processedDeviations = deviationsResponse.data.map((d) => ({
            ...d,
            date: new Date(d.date)
          }));
          setAllDeviations(processedDeviations);
        }
      } catch {
        // Ignore abort errors
        if (!isActive || abortController.signal.aborted) {
          return;
        }
        setKpiError('Failed to load dashboard data');
      } finally {
        if (isActive && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup: cancel request if component unmounts or dependencies change
    return () => {
      isActive = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, dateRangeKey, projectsKey, customDatesKey, getAuthToken]);

  // Backend already filtered by date range and projects
  const filteredDeviations = allDeviations;

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
          availableProjects={metadata?.projects || []}
          disabled={loading || metadataLoading}
        />

        {/* KPI Cards */}
        {loading ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))}
          </div>
        ) : kpiError ? (
          <div className="w-full p-4 bg-error/10 border border-error/20 rounded-md text-error">
            Failed to load KPI data: {kpiError}
          </div>
        ) : (
          <DashboardKPIs kpiData={kpiData} className="fade-in" />
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
            <Skeleton className="h-[400px] w-full" />
          </>
        ) : (
          <div className="w-full flex flex-col gap-4 fade-in">
            {/* Subcontractor Cost Chart - Full Width */}
            <SubcontractorCostChart deviations={filteredDeviations} />

            {/* Deviation Category Chart */}
            <DeviationCategoryChart deviations={filteredDeviations} />
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
              <WorkflowBottleneckChart
                deviations={filteredDeviations}
                availableWorkflows={metadata?.workflows || []}
              />
            </div>

            {/* Workflow Impact Analysis - Full Width */}
            <WorkflowImpactBubbleChart
              deviations={filteredDeviations}
              availableWorkflows={metadata?.workflows || []}
            />

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
