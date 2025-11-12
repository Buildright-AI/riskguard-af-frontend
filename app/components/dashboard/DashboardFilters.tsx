'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DashboardFilters as DashboardFiltersType, DateRangeFilter } from '@/app/types/dashboard';
import { MdFilterList, MdClose } from 'react-icons/md';
import {
  DATE_RANGE_OPTIONS,
} from '@/lib/constants/dashboardConfig';

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
  const handleDateRangeChange = (range: DateRangeFilter) => {
    onFilterChange({
      ...filters,
      dateRange: range,
    });
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
    onFilterChange({
      dateRange: '30d',
      projects: [],
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
            {DATE_RANGE_OPTIONS.map((option) => (
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
            ))}
          </div>

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
              {DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)?.label}
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
