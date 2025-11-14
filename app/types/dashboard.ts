// Dashboard TypeScript Types
// Types for the Dashboard page components and data structures
// All types derived from single source of truth in dashboardConfig.ts

import {
  DEVIATION_STATUSES,
} from '@/lib/constants/dashboardConfig';

export type DeviationStatus = typeof DEVIATION_STATUSES[number];
export type ProjectName = string;

// Core deviation record matching AF data structure
export interface DeviationRecord {
  id: string;
  date: Date;
  company: string;
  trade: string;
  category: string;
  hasEconomicImpact: boolean;
  hasScheduleImpact: boolean;
  estimatedCost: number; // NOK
  resolutionDays: number;
  overdueDays: number;
  workflow: string;
  installationType: string;
  status: DeviationStatus;
  handoverCount: number;
  project: ProjectName;
  phase: string;
}

// Global filter state
export interface DashboardFilters {
  dateRange: DateRangeFilter;
  projects: ProjectName[];
  customStartDate?: Date;
  customEndDate?: Date;
}

export type DateRangeFilter = '7d' | '30d' | '90d' | '180d' | 'custom';

// KPI Metric
export interface KPIMetric {
  label: string;
  value: number | string;
  trend?: number; // Percentage change (-100 to 100)
  trendDirection?: 'up' | 'down' | 'neutral';
  suffix?: string;
  prefix?: string;
  highlighted?: boolean;
}

// Chart Data Interfaces

// Subcontractor Cost Chart
export interface SubcontractorCostData {
  company: string;
  totalCost: number;
  deviationCount: number;
  avgResolutionDays: number;
}

// Deviation Category Chart
export interface DeviationCategoryData {
  category: string;
  withEconomicImpact: number;
  withoutEconomicImpact: number;
  totalCount: number;
}

export interface DeviationCategoryTimeData {
  month: string;
  [key: string]: number | string; // Dynamic keys for each category
}

// Resolution Time Chart
export interface ResolutionTimeData {
  category: string;
  avgDays: number;
  minDays: number;
  maxDays: number;
  medianDays: number;
  count: number;
  primaryWorkflowStage: string;
}

// Workflow Bottleneck Chart
export interface WorkflowBottleneckData {
  workflow: string;
  avgDaysInStage: number;
  avgHandovers: number;
  stuckReports: number; // Reports >30 days in this stage
  totalReports: number;
}

// Overdue Trends Chart
export interface OverdueTrendsData {
  week: string;
  newOverdue: number;
  totalOverdue: number;
}

// Installation Delay Heatmap
export interface InstallationDelayData {
  installationType: string;
  week: string;
  avgDelayDays: number;
  reportCount: number;
}

// Processed heatmap data for rendering
export interface HeatmapCell {
  x: number; // Week index
  y: number; // Installation type index
  value: number; // Delay days
  count: number; // Report count
  label: string; // For tooltip
}

// Filter change handler type
export type FilterChangeHandler = (filters: DashboardFilters) => void;

// Chart configuration
export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}
