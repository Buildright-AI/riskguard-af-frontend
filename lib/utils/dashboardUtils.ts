import { DeviationRecord, ProjectName } from '@/app/types/dashboard';

/**
 * Client-side filtering utility for dashboard deviations.
 * Backend filtering handles date and project filters.
 * This utility can be used for custom date ranges if needed.
 */
export function filterDeviations(
  deviations: DeviationRecord[],
  filters: {
    dateRange?: { start: Date; end: Date };
    projects?: ProjectName[];
  }
): DeviationRecord[] {
  let filtered = [...deviations];

  if (filters.dateRange) {
    filtered = filtered.filter(
      (d) => d.date >= filters.dateRange!.start && d.date <= filters.dateRange!.end
    );
  }

  if (filters.projects && filters.projects.length > 0) {
    filtered = filtered.filter((d) => filters.projects!.includes(d.project));
  }

  return filtered;
}
