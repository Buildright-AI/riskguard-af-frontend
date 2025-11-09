/**
 * Dashboard Configuration
 *
 * Central configuration file for all dashboard constants, colors, and thresholds.
 * This is the SINGLE SOURCE OF TRUTH for dashboard configuration.
 *
 * When connecting to real API:
 * - Keep this file (update with API-driven values where needed)
 * - Delete lib/mockData/dashboardData.ts
 * - Update DashboardPage.tsx to fetch from API instead of mock data
 *
 * NOTE: This file does NOT import types to avoid circular dependencies.
 * Types in app/types/dashboard.ts are derived FROM these constants.
 */

// ============================================
// DATE RANGE CONFIGURATION
// ============================================

export const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '180d', label: 'Last 180 days', days: 180 },
] as const;

export const DEFAULT_DATE_RANGE = '30d' as const;

export const getDateRangeInDays = (range: string): number => {
  const config = DATE_RANGE_OPTIONS.find((r) => r.value === range);
  return config?.days || 30;
};

// ============================================
// BUSINESS DATA (Temporary - will come from API)
// ============================================

/**
 * Project names
 * TODO: Replace with API call to fetch available projects
 */
export const PROJECTS = [
  'Brynsengfaret',
  'Ensjoveien',
  'Vision',
  'Sjoparken',
] as const;

/**
 * Severity levels
 * Note: This is likely permanent as it's a business constant
 */
export const SEVERITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

/**
 * Workflow stages
 * TODO: Replace with API call if workflows are project-specific
 */
export const WORKFLOW_STAGES = [
  '1. Planlegging',
  '2. Utførelse',
  '3. Kontroll',
  '4. Befaringer',
  '5. Lukking',
] as const;

/**
 * Deviation categories
 * TODO: Replace with API call to fetch available categories
 */
export const DEVIATION_CATEGORIES = [
  'Avvik',
  'RTB',
  'Statusbefaring',
  'Forbefaring',
  'RUH',
  'Oppgave produksjon',
  'Skader under byggetid',
  'Ferdigbefaring',
  'Intern oppgave',
] as const;

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
 * Severity colors for charts (HSL format using CSS variables)
 */
export const SEVERITY_COLORS = {
  Low: 'hsl(var(--accent))',
  Medium: 'hsl(var(--highlight))',
  High: 'hsl(var(--warning))',
  Critical: 'hsl(var(--error))',
} as const;

/**
 * Severity colors for text (Tailwind classes)
 */
export const SEVERITY_TEXT_COLORS = {
  Low: 'text-accent',
  Medium: 'text-warning',
  High: 'text-error',
  Critical: 'text-error font-bold',
} as const;

/**
 * Workflow stage colors
 */
export const WORKFLOW_COLORS: Record<string, string> = {
  '1. Planlegging': 'hsl(var(--accent))',
  '2. Utførelse': 'hsl(var(--highlight))',
  '3. Kontroll': 'hsl(var(--warning))',
  '4. Befaringer': 'hsl(var(--warning))', // Using warning for consistency
  '5. Lukking': 'hsl(var(--error))',
};

/**
 * Deviation category colors
 * Note: Using CSS variables where possible, fallback hex for specific needs
 */
export const CATEGORY_COLORS: Record<string, string> = {
  'Avvik': 'hsl(var(--error))',
  'RTB': 'hsl(var(--warning))',
  'Statusbefaring': 'hsl(var(--highlight))',
  'Forbefaring': 'hsl(var(--accent))',
  'RUH': '#8B5CF6', // Purple
  'Oppgave produksjon': '#F59E0B', // Amber
  'Skader under byggetid': '#EF4444', // Red
  'Ferdigbefaring': '#10B981', // Emerald
  'Intern oppgave': '#6B7280', // Gray
};

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
 * Severity score thresholds
 * Used when converting severity to numeric (Low=1, Medium=2, High=3, Critical=4)
 */
export const SEVERITY_SCORE_THRESHOLDS = {
  critical: 3.5,
  high: 2.5,
  medium: 1.5,
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
// LOADING & API CONFIGURATION
// ============================================

/**
 * Simulated API delay for mockup
 * TODO: Remove this when connecting real API
 */
export const SIMULATED_API_DELAY_MS = 1500;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get CSS color for a given severity level
 */
export const getSeverityColor = (severity: string): string => {
  return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || 'hsl(var(--secondary))';
};

/**
 * Get text color class for a given severity level
 */
export const getSeverityTextColor = (severity: string): string => {
  return SEVERITY_TEXT_COLORS[severity as keyof typeof SEVERITY_TEXT_COLORS] || 'text-secondary';
};

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
 * Get category color with fallback
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || 'hsl(var(--secondary))';
};

/**
 * Get workflow color with fallback
 */
export const getWorkflowColor = (workflow: string): string => {
  return WORKFLOW_COLORS[workflow] || 'hsl(var(--secondary))';
};

/**
 * Convert severity to numeric score (1-4)
 */
export const getSeverityScore = (severity: string): number => {
  const scoreMap = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  } as const;
  return scoreMap[severity as keyof typeof scoreMap] || 0;
};

/**
 * Categorize severity based on average score
 */
export const categorizeSeverityScore = (avgScore: number): string => {
  if (avgScore >= SEVERITY_SCORE_THRESHOLDS.critical) return 'Critical';
  if (avgScore >= SEVERITY_SCORE_THRESHOLDS.high) return 'High';
  if (avgScore >= SEVERITY_SCORE_THRESHOLDS.medium) return 'Medium';
  return 'Low';
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
