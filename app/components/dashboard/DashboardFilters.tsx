'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DashboardFilters as DashboardFiltersType, DateRangeFilter } from '@/app/types/dashboard';
import { MdFilterList, MdClose } from 'react-icons/md';
import {
  DATE_RANGE_OPTIONS,
} from '@/lib/constants/dashboardConfig';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface DashboardFiltersProps {
  filters: DashboardFiltersType;
  onFilterChange: (filters: DashboardFiltersType) => void;
  availableProjects: string[];
  disabled?: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFilterChange,
  availableProjects,
  disabled = false,
}) => {
  // Date display format constant
  const DATE_DISPLAY_FORMAT = 'MMM dd, yyyy';

  // State for custom date range picker
  const [customDates, setCustomDates] = useState<DateRange | undefined>(
    filters.customStartDate && filters.customEndDate
      ? { from: filters.customStartDate, to: filters.customEndDate }
      : undefined
  );

  // Pending state for custom date selection (not yet applied)
  const [pendingCustomDates, setPendingCustomDates] = useState<DateRange | undefined>(undefined);
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);

  // Sync local state with props when filters change (e.g., reset button, URL params)
  useEffect(() => {
    if (filters.customStartDate && filters.customEndDate) {
      setCustomDates({ from: filters.customStartDate, to: filters.customEndDate });
    } else if (filters.dateRange !== 'custom') {
      setCustomDates(undefined);
    }
  }, [filters.customStartDate, filters.customEndDate, filters.dateRange]);

  const handleDateRangeChange = (range: DateRangeFilter) => {
    onFilterChange({
      ...filters,
      dateRange: range,
      // Clear custom dates when switching to preset ranges
      customStartDate: range === 'custom' ? filters.customStartDate : undefined,
      customEndDate: range === 'custom' ? filters.customEndDate : undefined,
    });
  };

  // Update pending selection (no filter change yet)
  const handleCustomDateSelection = (range: DateRange | undefined) => {
    setPendingCustomDates(range);
  };

  // Apply pending dates to filters (triggers database refresh)
  const handleApplyCustomDates = () => {
    if (pendingCustomDates?.from && pendingCustomDates?.to) {
      setCustomDates(pendingCustomDates);
      onFilterChange({
        ...filters,
        dateRange: 'custom',
        customStartDate: pendingCustomDates.from,
        customEndDate: pendingCustomDates.to,
      });
      setIsCustomPickerOpen(false);
    }
  };

  // Cancel custom date selection
  const handleCancelCustomDates = () => {
    setPendingCustomDates(customDates); // Reset to current applied dates
    setIsCustomPickerOpen(false);
  };


  const handleProjectToggle = (project: string) => {
    const newProjects = filters.projects.includes(project)
      ? filters.projects.filter((p) => p !== project)
      : [...filters.projects, project];

    onFilterChange({
      ...filters,
      projects: newProjects,
    });
  };

  const handleReset = () => {
    setCustomDates(undefined);
    setPendingCustomDates(undefined);
    setIsCustomPickerOpen(false);
    onFilterChange({
      dateRange: '30d',
      projects: [],
      customStartDate: undefined,
      customEndDate: undefined,
    });
  };

  const hasActiveFilters =
    filters.dateRange !== '30d' ||
    filters.projects.length > 0;

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="w-full flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Filter Icon & Label */}
          <div className="flex items-center gap-2 text-primary">
            <MdFilterList className="text-xl" />
            <span className="font-heading font-semibold">Filters</span>
          </div>

          {/* Date Range Buttons */}
          <div className="flex flex-wrap gap-2">
            {DATE_RANGE_OPTIONS.map((option) => {
              // Skip custom option - it's handled separately below
              if (option.value === 'custom') {
                return null;
              }

              return (
                <Button
                  key={option.value}
                  variant={filters.dateRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateRangeChange(option.value)}
                  disabled={disabled}
                  className={
                    filters.dateRange === option.value
                      ? 'bg-accent text-background hover:bg-accent/90'
                      : ''
                  }
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          {/* Custom Date Range Picker - always rendered */}
          <Popover
            open={isCustomPickerOpen}
            onOpenChange={(open) => {
              if (open) {
                // Initialize pending dates with current selection when opening
                setPendingCustomDates(customDates);
              }
              setIsCustomPickerOpen(open);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant={filters.dateRange === 'custom' ? 'default' : 'outline'}
                size="sm"
                disabled={disabled}
                className={
                  filters.dateRange === 'custom'
                    ? 'bg-accent text-background hover:bg-accent/90 min-w-[200px] justify-start text-left'
                    : ''
                }
              >
                {filters.dateRange === 'custom' && customDates?.from && customDates?.to
                  ? `${format(customDates.from, DATE_DISPLAY_FORMAT)} - ${format(customDates.to, DATE_DISPLAY_FORMAT)}`
                  : 'Custom range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col">
                <Calendar
                  mode="range"
                  selected={pendingCustomDates}
                  onSelect={handleCustomDateSelection}
                  numberOfMonths={window.innerWidth > 768 ? 2 : 1}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
                {/* Apply/Cancel buttons */}
                <div className="flex gap-2 p-3 border-t border-secondary/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelCustomDates}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyCustomDates}
                    disabled={!pendingCustomDates?.from || !pendingCustomDates?.to}
                    className="flex-1 bg-accent text-background hover:bg-accent/90"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Projects Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="relative"
              >
                Projects
                {filters.projects.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-accent text-background rounded-full">
                    {filters.projects.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="flex flex-col gap-3">
                <h4 className="font-heading font-semibold text-sm">Select Projects</h4>
                {availableProjects.map((project) => (
                  <div key={project} className="flex items-center gap-2">
                    <Checkbox
                      id={`project-${project}`}
                      checked={filters.projects.includes(project)}
                      onCheckedChange={() => handleProjectToggle(project)}
                    />
                    <Label
                      htmlFor={`project-${project}`}
                      className="text-sm cursor-pointer"
                    >
                      {project}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
              className="ml-auto text-secondary hover:text-primary"
            >
              <MdClose className="mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        <div className="mt-3 pt-3 border-t border-secondary/20">
          <div className="flex flex-wrap gap-2 items-center text-sm text-secondary">
            <span>Active filters:</span>
            <span className="px-2 py-1 bg-foreground rounded text-primary text-xs">
              {filters.dateRange === 'custom' && customDates?.from && customDates?.to
                ? `${format(customDates.from, DATE_DISPLAY_FORMAT)} - ${format(customDates.to, DATE_DISPLAY_FORMAT)}`
                : DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)?.label}
            </span>
            {filters.projects.map((project) => (
                <span
                  key={project}
                  className="px-2 py-1 bg-foreground rounded text-primary text-xs"
                >
                  {project}
                </span>
              ))}
            </div>
          </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;
