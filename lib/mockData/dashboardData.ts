// Mockup Data Generator for Dashboard
// Generates synthetic deviation data based on AF project patterns
// TODO: DELETE THIS ENTIRE FILE when connecting to real API

import { DeviationRecord, SeverityLevel, ProjectName } from '@/app/types/dashboard';
import {
  PROJECTS,
  SEVERITY_LEVELS,
  DEVIATION_STATUSES,
  DEVIATION_CATEGORIES,
  WORKFLOW_STAGES,
} from '@/lib/constants/dashboardConfig';

// Seed data arrays based on Vision dataset patterns
const COMPANIES = [
  'Betonmast Buskerud-Vestfold AS',
  'Xpert Installasjon AS',
  'Gran VVS AS',
  'Elektro Sør AS',
  'Nordic Bygg & Anlegg',
  'Ventilasjon Norge AS',
  'Maler Team AS',
  'Tømrer Service AS',
  'Rør & Sanitær Gruppen',
  'Betong Spesialisten AS',
];

const TRADES = [
  'Elektro',
  'VVS',
  'Betong',
  'Tømrer',
  'Maler',
  'Rør',
  'Ventilasjon',
  'Gulv',
  'Stål',
];

const INSTALLATION_TYPES = [
  '310 Grunnarbeider',
  '320 Betongarbeider',
  '330 Murerarbeider',
  '340 Elektro bygg A-C',
  '350 VVS',
  '360 Ventilasjon',
  '370 Tømrerarbeider',
  '380 Malerarbeider',
  '390 Gulvlegging',
  '400 Stålarbeider',
];

const PHASES = [
  'Fundamentering',
  'Råbygg',
  'Taktekking',
  'Utvendig kledning',
  'Innvendig finish',
  'Teknisk installasjon',
  'Ferdigstillelse',
];

// Utility functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomWeightedChoice<T>(array: readonly T[], weights: number[]): T {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;

  for (let i = 0; i < array.length; i++) {
    random -= weights[i];
    if (random <= 0) return array[i];
  }

  return array[0];
}

function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Generate realistic cost based on severity and category
function generateCost(severity: SeverityLevel, category: string): number {
  const baseMultipliers: Record<SeverityLevel, number> = {
    Low: 1,
    Medium: 3,
    High: 8,
    Critical: 20,
  };

  const categoryMultipliers: Record<string, number> = {
    'Avvik': 2.5,
    'RTB': 1.5,
    'Skader under byggetid': 3.0,
    'RUH': 1.2,
    'Statusbefaring': 1.0,
    'Forbefaring': 0.8,
    'Ferdigbefaring': 1.5,
    'Oppgave produksjon': 2.0,
    'Intern oppgave': 1.0,
  };

  const base = randomInt(5000, 25000);
  const severityMult = baseMultipliers[severity];
  const categoryMult = categoryMultipliers[category] || 1.0;

  return Math.round(base * severityMult * categoryMult);
}

// Generate resolution days based on category and workflow
function generateResolutionDays(category: string, workflow: string, severity: SeverityLevel): number {
  const baseResolution: Record<string, number> = {
    'Avvik': 14,
    'RTB': 7,
    'Skader under byggetid': 21,
    'RUH': 10,
    'Statusbefaring': 5,
    'Forbefaring': 3,
    'Ferdigbefaring': 12,
    'Oppgave produksjon': 8,
    'Intern oppgave': 5,
  };

  const workflowMultipliers: Record<string, number> = {
    '1. Planlegging': 0.8,
    '2. Utførelse': 1.2,
    '3. Kontroll': 1.0,
    '4. Befaringer': 1.5,
    '5. Lukking': 0.7,
  };

  const severityMultipliers: Record<SeverityLevel, number> = {
    Low: 0.7,
    Medium: 1.0,
    High: 1.5,
    Critical: 2.5,
  };

  const base = baseResolution[category] || 7;
  const workflowMult = workflowMultipliers[workflow] || 1.0;
  const severityMult = severityMultipliers[severity];

  const variance = randomInt(-3, 5);
  return Math.max(1, Math.round(base * workflowMult * severityMult + variance));
}

// Generate single deviation record
function generateDeviation(daysAgo: number): DeviationRecord {
  const severity = randomWeightedChoice(SEVERITY_LEVELS, [40, 35, 20, 5]); // More low/medium
  const category = randomWeightedChoice(DEVIATION_CATEGORIES, [15, 12, 20, 10, 8, 15, 8, 7, 5]);
  const workflow = randomChoice(WORKFLOW_STAGES);
  const status = randomWeightedChoice(DEVIATION_STATUSES, [10, 25, 30, 35]); // More resolved/closed
  const company = randomChoice(COMPANIES);
  const trade = randomChoice(TRADES);

  const hasEconomicImpact = severity === 'High' || severity === 'Critical' || Math.random() > 0.6;
  const hasScheduleImpact = severity !== 'Low' && Math.random() > 0.5;

  const estimatedCost = hasEconomicImpact ? generateCost(severity, category) : 0;
  const resolutionDays = generateResolutionDays(category, workflow, severity);

  // Overdue only for open/in progress items
  const isOverdue = (status === 'Open' || status === 'In Progress') && Math.random() > 0.7;
  const overdueDays = isOverdue ? randomInt(1, 45) : 0;

  // Handover count increases with workflow complexity
  const handoverCount = workflow === '4. Befaringer' ? randomInt(2, 7) :
                       workflow === '3. Kontroll' ? randomInt(1, 5) :
                       randomInt(0, 3);

  return {
    id: `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    date: getDateDaysAgo(daysAgo),
    company,
    trade,
    category,
    severity,
    hasEconomicImpact,
    hasScheduleImpact,
    estimatedCost,
    resolutionDays,
    overdueDays,
    workflow,
    installationType: randomChoice(INSTALLATION_TYPES),
    status,
    handoverCount,
    project: randomChoice(PROJECTS),
    phase: randomChoice(PHASES),
  };
}

// Generate dataset for specified date range
export function generateMockDeviations(days: number = 180, count?: number): DeviationRecord[] {
  const deviations: DeviationRecord[] = [];
  const totalRecords = count || randomInt(800, 1200);

  for (let i = 0; i < totalRecords; i++) {
    const daysAgo = randomInt(0, days);
    deviations.push(generateDeviation(daysAgo));
  }

  // Sort by date descending (most recent first)
  return deviations.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Pre-generated dataset for consistent dashboard experience
let cachedDeviations: DeviationRecord[] | null = null;

export function getMockDeviations(regenerate: boolean = false): DeviationRecord[] {
  if (!cachedDeviations || regenerate) {
    cachedDeviations = generateMockDeviations(180, 1000);
  }
  return cachedDeviations;
}

// Filter deviations based on dashboard filters
export function filterDeviations(
  deviations: DeviationRecord[],
  filters: {
    dateRange?: { start: Date; end: Date };
    projects?: ProjectName[];
    severities?: SeverityLevel[];
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

  if (filters.severities && filters.severities.length > 0) {
    filtered = filtered.filter((d) => filters.severities!.includes(d.severity));
  }

  return filtered;
}

// Export constants for use in components
export const MOCK_COMPANIES = COMPANIES;
export const MOCK_TRADES = TRADES;
export const MOCK_CATEGORIES = DEVIATION_CATEGORIES;
export const MOCK_WORKFLOWS = WORKFLOW_STAGES;
export const MOCK_INSTALLATION_TYPES = INSTALLATION_TYPES;
export const MOCK_PROJECTS = PROJECTS;
