/**
 * Dashboard Configuration
 *
 * Central configuration file for all dashboard constants, colors, and thresholds.
 * This is the SINGLE SOURCE OF TRUTH for dashboard configuration.
 *
 * NOTE: This file does NOT import types to avoid circular dependencies.
 * Types in app/types/dashboard.ts are derived FROM these constants.
 *
 * Business data (projects, workflows, categories, etc.) is fetched dynamically
 * from the API via /api/dashboard/metadata endpoint.
 */

// ============================================
// DATE RANGE CONFIGURATION
// ============================================

export const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '180d', label: 'Last 180 days', days: 180 },
  { value: 'custom', label: 'Custom range', days: null },
] as const;

export const DEFAULT_DATE_RANGE = '30d' as const;

export const getDateRangeInDays = (range: string): number => {
  const config = DATE_RANGE_OPTIONS.find((r) => r.value === range);
  // Return 30 as default, or if 'custom' range is selected (days: null)
  return config?.days ?? 30;
};

// ============================================
// BUSINESS DATA
// ============================================
// Note: Projects, workflows, categories, installation types, and companies
// are now fetched dynamically from the API via /api/dashboard/metadata endpoint.
// This eliminates hardcoded mock data and enables multi-tenant/multi-project support.

/**
 * Deviation status values
 */
export const DEVIATION_STATUSES = [
  'Open',
  'In Progress',
  'Resolved',
  'Closed',
] as const;

// ============================================
// COLOR MAPPINGS
// ============================================

/**
 * Generic color palette for dynamic chart data
 *
 * This palette is used to assign colors to any dynamic data items
 * (workflows, categories, installation types, etc.) based on their
 * position in the data array, not hardcoded business values.
 *
 * Colors are carefully selected to be:
 * - Visually distinct from each other
 * - Accessible (good contrast)
 * - Professional for business dashboards
 */
export const CHART_COLOR_PALETTE = [
  '#4682B4', // SteelBlue
  '#D2691E', // Chocolate
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#708090', // SlateGray
  '#CD853F', // Peru
  '#FF6347', // Tomato
  '#87CEEB', // SkyBlue
  '#8B4513', // SaddleBrown
  '#FFD700', // Gold
  '#DEB887', // BurlyWood
  '#A9A9A9', // DarkGray
  '#6B7280', // Gray
] as const;

/**
 * Bottleneck severity colors
 */
export const BOTTLENECK_COLORS = {
  good: 'hsl(var(--accent))',
  moderate: 'hsl(var(--warning))',
  critical: 'hsl(var(--error))',
} as const;

/**
 * Heatmap intensity colors (Tailwind classes)
 */
export const HEATMAP_COLORS = {
  empty: 'bg-background_alt',
  veryLow: 'bg-accent/30',
  low: 'bg-warning/50',
  medium: 'bg-warning',
  high: 'bg-error/70',
  critical: 'bg-error',
} as const;

// ============================================
// THRESHOLDS & TARGETS
// ============================================

/**
 * KPI targets and thresholds
 */
export const TARGETS = {
  /** Target resolution time in days */
  resolutionDays: 10,

  /** Handover count considered moderate bottleneck */
  moderateHandoverThreshold: 2,

  /** Handover count considered critical bottleneck */
  criticalHandoverThreshold: 3,

  /** Days in one stage before considered "stuck" */
  stuckThresholdDays: 30,

  /** Trend percentage threshold for "significant" change */
  significantTrendPercent: 5,
} as const;

/**
 * Delay thresholds in days
 */
export const DELAY_THRESHOLDS = {
  critical: 20,
  high: 12,
} as const;

// ============================================
// CHART CONFIGURATION
// ============================================

/**
 * Chart heights (in pixels)
 */
export const CHART_HEIGHTS = {
  default: 400,
  small: 350,
  large: 450,
  kpi: 120,
} as const;

/**
 * Display limits for charts
 */
export const DISPLAY_LIMITS = {
  /** Top N companies to display in subcontractor chart */
  topCompanies: 10,

  /** Top N categories to show in stats */
  topCategories: 5,

  /** Top N delayed installation types */
  topDelayedTypes: 5,

  /** Top N categories to display in resolution time chart */
  topResolutionCategories: 8,

  /** Number of weeks to display in trend charts */
  weeksToDisplay: 12,

  /** Number of weeks to display in heatmap */
  heatmapWeeks: 8,
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get color for bottleneck based on average handovers
 */
export const getBottleneckColor = (avgHandovers: number): string => {
  if (avgHandovers > TARGETS.criticalHandoverThreshold) {
    return BOTTLENECK_COLORS.critical;
  }
  if (avgHandovers > TARGETS.moderateHandoverThreshold) {
    return BOTTLENECK_COLORS.moderate;
  }
  return BOTTLENECK_COLORS.good;
};

/**
 * Get color for an item based on its index
 *
 * Cycles through CHART_COLOR_PALETTE if index exceeds palette size.
 * This ensures every item gets a color, even if there are more items than colors.
 */
export const getDynamicColor = (index: number): string => {
  return CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length];
};

/**
 * Get consistent color for an item based on its position in the full dataset
 *
 * This ensures the same item always gets the same color across different charts
 * by using its index in the complete dataset, not just the filtered/limited view.
 *
 * @param item - The item to get a color for (e.g., installation type name)
 * @param allItems - Complete array of all possible items (maintains consistency)
 * @returns Hex color from palette
 */
export const getColorForItem = (item: string, allItems: string[]): string => {
  const index = allItems.indexOf(item);
  return getDynamicColor(index >= 0 ? index : 0);
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
};
